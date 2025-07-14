import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Servizio non disponibile' },
        { status: 503 }
      );
    }

    const { username, password } = await request.json();

    // Validazione input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username e password sono obbligatori' },
        { status: 400 }
      );
    }

    // Cerca l'utente admin
    console.log('Cercando utente:', username);
    const { data: user, error } = await supabase
      .from('admin_accounts')
      .select('*')
      .eq('username', username)
      .single();

    console.log('Risultato query:', { user, error });

    if (error || !user) {
      console.log('Utente non trovato o errore:', error);
      return NextResponse.json(
        { error: 'Credenziali non valide' },
        { status: 401 }
      );
    }

    // Verifica password
    console.log('Verificando password per utente:', user.username);
    console.log('Password ricevuta:', password);
    console.log('Hash nel database:', user.password_hash);
    
    const isValidPassword = await verifyPassword(password, user.password_hash);
    console.log('Password valida?', isValidPassword);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenziali non valide' },
        { status: 401 }
      );
    }

    // Aggiorna last_login
    await supabase
      .from('admin_accounts')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Genera JWT token
    const token = generateToken({
      userId: user.id.toString(),
      username: user.username,
      email: user.email,
      role: user.role
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Errore login:', error);
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    );
  }
} 