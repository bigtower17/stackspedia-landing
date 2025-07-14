import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ProjectFilters, ProjectListResponse, ProjectWithStack } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Servizio non disponibile' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parametri di paginazione
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');
    const offset = (page - 1) * per_page;

    // Filtri
    const filters: ProjectFilters = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') as any || undefined,
      tags: searchParams.getAll('tags'),
      stack_types: searchParams.getAll('stack_types') as any[],
      visibility: searchParams.get('visibility') === 'true' ? true : undefined,
    };

    // Filtro featured
    const featured = searchParams.get('featured') === 'true';

    // Query base
    let query = supabase
      .from('projects')
      .select(`
        *,
        stack_components:project_stack(
          stack_component_id,
          stack_components(*)
        ),
        metrics(*),
        roadmap_items(*)
      `)
      .eq('visibility', true)
      .eq('is_confirmed', true); // Solo progetti confermati

    // Applicare filtri
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    // Filtro featured
    if (featured) {
      query = query.eq('featured', true);
    }

    // Ordinamento
    query = query.order('created_at', { ascending: false });

    // Paginazione
    query = query.range(offset, offset + per_page - 1);

    const { data: projects, error, count } = await query;

    if (error) {
      console.error('Errore nel recupero progetti:', error);
      return NextResponse.json(
        { error: 'Errore nel recupero dei progetti' },
        { status: 500 }
      );
    }

    // Trasformare i dati per l'UI
    const transformedProjects: ProjectWithStack[] = projects?.map(project => ({
      ...project,
      stack_components: project.stack_components?.map((ps: any) => ps.stack_components) || [],
      metrics: project.metrics?.[0] || undefined,
      roadmap_items: project.roadmap_items || [],
    })) || [];

    // Filtrare per stack_types se specificato
    let filteredProjects = transformedProjects;
    if (filters.stack_types && filters.stack_types.length > 0) {
      filteredProjects = transformedProjects.filter(project =>
        project.stack_components.some(component =>
          filters.stack_types!.includes(component.type)
        )
      );
    }

    const response: ProjectListResponse = {
      projects: filteredProjects,
      total: count || 0,
      page,
      per_page,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Errore API progetti:', error);
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Servizio non disponibile' },
        { status: 503 }
      );
    }

    const projectData = await request.json();
    
    // Validazione base
    if (!projectData.name || !projectData.slug) {
      return NextResponse.json(
        { error: 'Nome e slug sono obbligatori' },
        { status: 400 }
      );
    }

    // Verificare che lo slug sia unico
    const { data: existingProject } = await supabase
      .from('projects')
      .select('slug')
      .eq('slug', projectData.slug)
      .single();

    if (existingProject) {
      return NextResponse.json(
        { error: 'Slug già esistente' },
        { status: 409 }
      );
    }

    // Estrarre i dati correlati dai dati del progetto
    const { 
      stack_components, 
      contributors, 
      sponsors, 
      getting_started_guides, 
      community_links, 
      contributing_info, 
      metrics,
      ...projectDataWithoutRelations 
    } = projectData;

    // Inserire il progetto
    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert([projectDataWithoutRelations])
      .select()
      .single();

    if (projectError) {
      console.error('Errore creazione progetto:', projectError);
      return NextResponse.json(
        { error: 'Errore nella creazione del progetto' },
        { status: 500 }
      );
    }

    // Inserire le relazioni con i componenti di stack
    if (stack_components && stack_components.length > 0) {
      const stackRelations = stack_components.map((componentId: string) => ({
        project_id: newProject.id,
        stack_component_id: componentId,
      }));

      const { error: stackError } = await supabase
        .from('project_stack')
        .insert(stackRelations);

      if (stackError) {
        console.error('Errore inserimento stack:', stackError);
        // Non fallire completamente, il progetto è stato creato
      }
    }

    // Inserire i contributors
    if (contributors && contributors.length > 0) {
      const contributorsData = contributors.map((contributor: any) => ({
        project_id: newProject.id,
        name: contributor.name,
        role: contributor.role,
        avatar_url: contributor.avatar_url || null,
        github_url: contributor.github_url || null,
        bio: contributor.bio || null,
      }));

      const { error: contributorsError } = await supabase
        .from('contributors')
        .insert(contributorsData);

      if (contributorsError) {
        console.error('Errore inserimento contributors:', contributorsError);
      }
    }

    // Inserire i sponsors
    if (sponsors && sponsors.length > 0) {
      const sponsorsData = sponsors.map((sponsor: any) => ({
        project_id: newProject.id,
        name: sponsor.name,
        tier: sponsor.tier,
        logo_url: sponsor.logo_url || null,
        website_url: sponsor.website_url || null,
        description: sponsor.description || null,
      }));

      const { error: sponsorsError } = await supabase
        .from('sponsors')
        .insert(sponsorsData);

      if (sponsorsError) {
        console.error('Errore inserimento sponsors:', sponsorsError);
      }
    }

    // Inserire le getting started guides
    if (getting_started_guides && getting_started_guides.length > 0) {
      const guidesData = getting_started_guides.map((guide: any, index: number) => ({
        project_id: newProject.id,
        step_number: index + 1,
        title: guide.title,
        description: guide.description,
        prerequisites: guide.prerequisites || null,
        estimated_time: guide.estimated_time || null,
      }));

      const { error: guidesError } = await supabase
        .from('getting_started_guides')
        .insert(guidesData);

      if (guidesError) {
        console.error('Errore inserimento getting started guides:', guidesError);
      }
    }

    // Inserire i community links
    if (community_links && community_links.length > 0) {
      const communityData = community_links.map((link: any) => ({
        project_id: newProject.id,
        type: link.type,
        name: link.name,
        url: link.url,
        member_count: link.member_count || null,
      }));

      const { error: communityError } = await supabase
        .from('community_links')
        .insert(communityData);

      if (communityError) {
        console.error('Errore inserimento community links:', communityError);
      }
    }

    // Inserire le contributing info
    if (contributing_info) {
      const contributingData = {
        project_id: newProject.id,
        difficulty_level: contributing_info.difficulty_level,
        setup_time: contributing_info.setup_time || null,
        good_first_issues: contributing_info.good_first_issues || null,
        mentorship_available: contributing_info.mentorship_available || false,
      };

      const { error: contributingError } = await supabase
        .from('contributing_info')
        .insert([contributingData]);

      if (contributingError) {
        console.error('Errore inserimento contributing info:', contributingError);
      }
    }

    // Inserire le metrics
    if (metrics && Object.keys(metrics).length > 0) {
      const metricsData = {
        project_id: newProject.id,
        health_score: metrics.health_score || null,
        stars: metrics.stars || null,
        forks: metrics.forks || null,
        contributors_count: metrics.contributors_count || null,
      };

      const { error: metricsError } = await supabase
        .from('metrics')
        .insert([metricsData]);

      if (metricsError) {
        console.error('Errore inserimento metrics:', metricsError);
      }
    }

    return NextResponse.json(newProject, { status: 201 });

  } catch (error) {
    console.error('Errore API POST progetti:', error);
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    );
  }
} 