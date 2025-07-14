import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { authenticateAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Servizio non disponibile' },
        { status: 503 }
      );
    }

    // Verifica autenticazione admin
    const admin = authenticateAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Accesso non autorizzato' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'pending', 'confirmed', 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');
    const offset = (page - 1) * per_page;

    // Query per progetti admin (senza filtro is_confirmed)
    let query = supabase
      .from('projects')
      .select(`
        *,
        stack_components:project_stack(
          stack_component_id,
          stack_components(*)
        ),
        metrics(*),
        contributors(*),
        sponsors(*)
      `)
      .eq('visibility', true);

    // Filtra per status
    if (status === 'pending') {
      query = query.eq('is_confirmed', false);
    } else if (status === 'confirmed') {
      query = query.eq('is_confirmed', true);
    }
    // 'all' non applica filtri

    // Ordinamento e paginazione
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + per_page - 1);

    const { data: projects, error, count } = await query;

    if (error) {
      console.error('Errore nel recupero progetti admin:', error);
      return NextResponse.json(
        { error: 'Errore nel recupero dei progetti' },
        { status: 500 }
      );
    }

    // Trasformare i dati per l'UI
    const transformedProjects = projects?.map(project => ({
      ...project,
      stack_components: project.stack_components?.map((ps: any) => ps.stack_components) || [],
      metrics: project.metrics?.[0] || undefined,
      contributors: project.contributors || [],
      sponsors: project.sponsors || []
    })) || [];

    return NextResponse.json({
      projects: transformedProjects,
      total: count || 0,
      page,
      per_page,
    });

  } catch (error) {
    console.error('Errore API admin progetti:', error);
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Servizio non disponibile' },
        { status: 503 }
      );
    }

    // Verifica autenticazione admin
    const admin = authenticateAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Accesso non autorizzato' },
        { status: 401 }
      );
    }

    const { projectId, action, value } = await request.json();

    if (!projectId || !action) {
      return NextResponse.json(
        { error: 'Project ID e action sono obbligatori' },
        { status: 400 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'confirm':
        updateData.is_confirmed = value ?? true;
        break;
      case 'feature':
        updateData.featured = value ?? true;
        break;
      case 'status':
        updateData.status = value;
        break;
      default:
        return NextResponse.json(
          { error: 'Action non valida' },
          { status: 400 }
        );
    }

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Errore aggiornamento progetto:', error);
      return NextResponse.json(
        { error: 'Errore nell\'aggiornamento del progetto' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Errore API admin PATCH:', error);
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Servizio non disponibile' },
        { status: 503 }
      );
    }

    // Verifica autenticazione admin
    const admin = authenticateAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Accesso non autorizzato' },
        { status: 401 }
      );
    }

    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID è obbligatorio' },
        { status: 400 }
      );
    }

    // Elimina prima le relazioni
    await supabase.from('project_stack').delete().eq('project_id', projectId);
    await supabase.from('contributors').delete().eq('project_id', projectId);
    await supabase.from('sponsors').delete().eq('project_id', projectId);
    await supabase.from('getting_started_guides').delete().eq('project_id', projectId);
    await supabase.from('community_links').delete().eq('project_id', projectId);
    await supabase.from('contributing_info').delete().eq('project_id', projectId);
    await supabase.from('metrics').delete().eq('project_id', projectId);

    // Elimina il progetto
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Errore eliminazione progetto:', error);
      return NextResponse.json(
        { error: 'Errore nell\'eliminazione del progetto' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Progetto eliminato con successo' });

  } catch (error) {
    console.error('Errore API admin DELETE:', error);
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    );
  }
} 