-- Script per creare la tabella emails in Supabase
-- Copia questo codice nel SQL Editor di Supabase

-- Crea la tabella emails
CREATE TABLE IF NOT EXISTS emails (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    ip VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crea indici per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at);
CREATE INDEX IF NOT EXISTS idx_emails_ip ON emails(ip);

-- Abilita Row Level Security per sicurezza
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Permetti solo inserimenti (nessun READ pubblico per privacy)
CREATE POLICY "Enable insert for all users" ON emails
    FOR INSERT WITH CHECK (true);

-- Aggiungi il campo is_confirmed alla tabella projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_confirmed BOOLEAN DEFAULT false;

-- Aggiungi il campo featured per i progetti in evidenza
ALTER TABLE projects ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Crea indici per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_projects_confirmed ON projects(is_confirmed);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);

-- Crea tabella per gli account admin
CREATE TABLE IF NOT EXISTS admin_accounts (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Crea indice per gli admin accounts
CREATE INDEX IF NOT EXISTS idx_admin_accounts_username ON admin_accounts(username);
CREATE INDEX IF NOT EXISTS idx_admin_accounts_email ON admin_accounts(email);

-- Abilita Row Level Security per la tabella admin_accounts
ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;

-- Policy per admin accounts (solo loro possono leggere/scrivere)
CREATE POLICY "Admin accounts can read their own data" ON admin_accounts
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Visualizza la struttura della tabella (opzionale)
\d emails; 