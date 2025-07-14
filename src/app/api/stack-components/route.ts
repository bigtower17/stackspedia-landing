import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { StackComponent } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Servizio non disponibile' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    let query = supabase
      .from('stack_components')
      .select('*')
      .order('name', { ascending: true });

    // Filtrare per tipo se specificato
    if (type) {
      query = query.eq('type', type);
    }

    // Filtrare per ricerca se specificato
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: components, error } = await query;

    if (error) {
      console.error('Errore nel recupero componenti:', error);
      return NextResponse.json(
        { error: 'Errore nel recupero dei componenti' },
        { status: 500 }
      );
    }

    return NextResponse.json(components || []);

  } catch (error) {
    console.error('Errore API stack components:', error);
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

    const componentData = await request.json();

    // Validazione base
    if (!componentData.name || !componentData.type) {
      return NextResponse.json(
        { error: 'Nome e tipo sono obbligatori' },
        { status: 400 }
      );
    }

    // Verificare che il tipo sia valido
    const validTypes = ['frontend', 'backend', 'database', 'ci_cd', 'devops', 'tooling', 'runtime'];
    if (!validTypes.includes(componentData.type)) {
      return NextResponse.json(
        { error: 'Tipo non valido' },
        { status: 400 }
      );
    }

    // Verificare che il nome sia unico
    const { data: existingComponent } = await supabase
      .from('stack_components')
      .select('name')
      .eq('name', componentData.name)
      .single();

    if (existingComponent) {
      return NextResponse.json(
        { error: 'Componente già esistente' },
        { status: 409 }
      );
    }

    // Inserire il componente
    const { data: newComponent, error } = await supabase
      .from('stack_components')
      .insert([componentData])
      .select()
      .single();

    if (error) {
      console.error('Errore creazione componente:', error);
      return NextResponse.json(
        { error: 'Errore nella creazione del componente' },
        { status: 500 }
      );
    }

    return NextResponse.json(newComponent, { status: 201 });

  } catch (error) {
    console.error('Errore API POST stack components:', error);
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    );
  }
} 