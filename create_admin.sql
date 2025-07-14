-- Script per creare il primo utente admin
-- Eseguire questo script in Supabase SQL Editor dopo aver configurato la tabella admin_accounts

-- Inserisci il primo utente admin
-- Password: admin123 (da cambiare dopo il primo login)
INSERT INTO admin_accounts (username, email, password_hash, role) VALUES 
('admin', 'admin@stackspedia.com', '$2b$10$Cus4agIYtuPyTGXfIbfWeOSTZZtDWXyuyLxqQwft3bFfQxlHbis7K', 'admin');

-- Questo hash corrisponde alla password "admin123"
-- È importante cambiarla dopo il primo login per sicurezza

-- Query per verificare l'utente creato
SELECT id, username, email, role, created_at FROM admin_accounts WHERE username = 'admin'; 