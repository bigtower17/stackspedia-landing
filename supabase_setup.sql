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

-- Visualizza la struttura della tabella (opzionale)
\d emails; 