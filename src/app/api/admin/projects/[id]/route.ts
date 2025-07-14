import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { authenticateAdmin } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const projectId = params.id;
    const updateData = await request.json();

    // Campi che possono essere modificati
    const allowedFields = [
      'title', 'description', 'website_url', 'github_url', 'logo_url',
      'tags', 'category', 'is_confirmed', 'featured', 'visibility',
      'contributors', 'sponsors', 'getting_started_guides', 'community_links',
      'contributing_info', 'metrics'
    ];

    // Filtra solo i campi permessi
    const filteredUpdate = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {} as any);

    if (Object.keys(filteredUpdate).length === 0) {
      return NextResponse.json(
        { error: 'Nessun campo valido da aggiornare' },
        { status: 400 }
      );
    }

    // Aggiorna il progetto
    const { data: project, error: updateError } = await supabase
      .from('projects')
      .update(filteredUpdate)
      .eq('id', projectId)
      .select()
      .single();

    if (updateError) {
      console.error('Errore aggiornamento progetto:', updateError);
      return NextResponse.json(
        { error: 'Errore aggiornamento progetto' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      project,
      message: 'Progetto aggiornato con successo'
    });

  } catch (error) {
    console.error('Errore nella modifica del progetto:', error);
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const projectId = params.id;

    // Ottieni il progetto completo con tutti i dettagli
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        stack_components:project_stack(
          stack_component_id,
          stack_components(*)
        ),
        metrics(*),
        contributors(*),
        sponsors(*),
        getting_started_guides(*),
        community_links(*),
        contributing_info(*)
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Errore recupero progetto:', error);
      return NextResponse.json(
        { error: 'Progetto non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });

  } catch (error) {
    console.error('Errore nel recupero del progetto:', error);
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    );
  }
} 