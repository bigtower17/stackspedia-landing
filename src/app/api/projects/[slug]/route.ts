import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ProjectWithStack } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Servizio non disponibile' },
        { status: 503 }
      );
    }

    const { slug } = await params;

    // Recuperare il progetto con tutti i dati correlati
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        stack_components:project_stack(
          stack_component_id,
          stack_components(*)
        ),
        metrics(*),
        roadmap_items(*),
        contributors(*),
        sponsors(*),
        community_links(*),
        contributing_info(*),
        project_health(*),
        getting_started_guides(*)
      `)
      .eq('slug', slug)
      .eq('visibility', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Progetto non trovato' },
          { status: 404 }
        );
      }
      console.error('Errore nel recupero progetto:', error);
      return NextResponse.json(
        { error: 'Errore nel recupero del progetto' },
        { status: 500 }
      );
    }

    // Trasformare i dati per l'UI
    const transformedProject: ProjectWithStack = {
      ...project,
      stack_components: project.stack_components?.map((ps: any) => ps.stack_components) || [],
      metrics: project.metrics?.[0] || undefined,
      roadmap_items: project.roadmap_items || [],
      contributors: project.contributors || [],
      sponsors: project.sponsors || [],
      community_links: project.community_links || [],
      contributing_info: project.contributing_info?.[0] || undefined,
      project_health: project.project_health?.[0] || undefined,
      getting_started_guides: project.getting_started_guides || [],
    };



    return NextResponse.json(transformedProject);

  } catch (error) {
    console.error('Errore API progetto:', error);
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Servizio non disponibile' },
        { status: 503 }
      );
    }

    const { slug } = await params;
    const updateData = await request.json();

    // Verificare che il progetto esista
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Progetto non trovato' },
        { status: 404 }
      );
    }

    // Se si cambia lo slug, verificare che sia unico
    if (updateData.slug && updateData.slug !== slug) {
      const { data: slugExists } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', updateData.slug)
        .single();

      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug già esistente' },
          { status: 409 }
        );
      }
    }

    // Estrarre i stack_components dai dati di aggiornamento
    const { stack_components, ...projectDataWithoutStack } = updateData;

    // Aggiornare il progetto
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update(projectDataWithoutStack)
      .eq('slug', slug)
      .select()
      .single();

    if (updateError) {
      console.error('Errore aggiornamento progetto:', updateError);
      return NextResponse.json(
        { error: 'Errore nell\'aggiornamento del progetto' },
        { status: 500 }
      );
    }

    // Aggiornare le relazioni con i componenti di stack se forniti
    if (stack_components) {
      // Rimuovere le relazioni esistenti
      await supabase
        .from('project_stack')
        .delete()
        .eq('project_id', existingProject.id);

      // Inserire le nuove relazioni
      if (stack_components.length > 0) {
        const stackRelations = stack_components.map((componentId: string) => ({
          project_id: existingProject.id,
          stack_component_id: componentId,
        }));

        const { error: stackError } = await supabase
          .from('project_stack')
          .insert(stackRelations);

        if (stackError) {
          console.error('Errore aggiornamento stack:', stackError);
          // Non fallire completamente, il progetto è stato aggiornato
        }
      }
    }

    return NextResponse.json(updatedProject);

  } catch (error) {
    console.error('Errore API PUT progetto:', error);
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Servizio non disponibile' },
        { status: 503 }
      );
    }

    const { slug } = await params;

    // Verificare che il progetto esista
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Progetto non trovato' },
        { status: 404 }
      );
    }

    // Eliminare il progetto (le relazioni vengono eliminate automaticamente per CASCADE)
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('slug', slug);

    if (deleteError) {
      console.error('Errore eliminazione progetto:', deleteError);
      return NextResponse.json(
        { error: 'Errore nell\'eliminazione del progetto' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Progetto eliminato con successo' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Errore API DELETE progetto:', error);
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    );
  }
} 