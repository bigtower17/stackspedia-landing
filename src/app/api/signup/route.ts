import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validazione email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email non valida' },
        { status: 400 }
      );
    }

    // Controlla se l'email esiste già
    const { data: existingEmail } = await supabase
      .from('emails')
      .select('email')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email già registrata' },
        { status: 409 }
      );
    }

    // Salva l'email in Supabase
    const { error } = await supabase
      .from('emails')
      .insert([{ email }]);

    if (error) {
      console.error('Errore Supabase:', error);
      return NextResponse.json(
        { error: 'Errore nel salvare l\'email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Email registrata con successo!' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Errore signup:', error);
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    );
  }
} 