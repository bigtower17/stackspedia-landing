# 🔐 Admin System Setup - Stackspedia

## ✅ Funzionalità Implementate

### 1. **Sistema di Approvazione Progetti**
- I progetti aggiunti dagli utenti sono ora **pendenti** di default (`is_confirmed = false`)
- Solo i progetti confermati vengono mostrati nell'API pubblica
- Gli admin possono confermare/rifiutare i progetti dal pannello admin

### 2. **Autenticazione JWT**
- Sistema di login admin con JWT tokens
- Sessioni di 24 ore
- Protezione delle API admin con middleware di autenticazione
- Logout sicuro con rimozione del token

### 3. **Pannello Admin Completo**
- **Dashboard** con statistiche dei progetti
- **Gestione Progetti**: conferma, elimina, metti in evidenza
- **Filtri**: tutti, pending, confermati
- **Paginazione** per gestire grandi quantità di dati
- **Visualizzazione responsive** con metriche e contatori

### 4. **Features Aggiuntive**
- Campo `featured` per progetti in evidenza
- Visualizzazione responsive di contributors e sponsors (2-3-4 colonne)
- Sistema di ruoli admin espandibile
- Tracking del last login degli admin

## 🗄️ Database Changes

### Tabelle Modificate/Aggiunte:

```sql
-- Campi aggiunti alla tabella projects
ALTER TABLE projects ADD COLUMN is_confirmed BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN featured BOOLEAN DEFAULT false;

-- Nuova tabella per account admin
CREATE TABLE admin_accounts (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);
```

## 🚀 Setup Instructions

### 1. **Database Setup**
1. Esegui il file `supabase_setup.sql` nel SQL Editor di Supabase
2. Esegui il file `create_admin.sql` per creare il primo utente admin

### 2. **Environment Variables**
Aggiungi al tuo file `.env.local`:
```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. **Primo Admin User**
- **Username**: `admin`
- **Password**: `admin123`
- **IMPORTANTE**: Cambia la password dopo il primo login!

### 4. **Accesso al Pannello Admin**
- URL: `http://localhost:3000/admin/login`
- Dopo il login: `http://localhost:3000/admin/dashboard`

## 🛡️ API Endpoints

### Autenticazione
- `POST /api/auth/login` - Login admin
- Headers: `Content-Type: application/json`
- Body: `{"username": "admin", "password": "admin123"}`

### Admin APIs (richiedono autenticazione)
- `GET /api/admin/projects` - Lista progetti (con filtri)
- `PATCH /api/admin/projects` - Aggiorna progetto
- `DELETE /api/admin/projects` - Elimina progetto

### Headers per API Admin:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

## 📊 Funzionalità Dashboard

### Statistiche
- **In Attesa**: Progetti non ancora confermati
- **Confermati**: Progetti approvati e pubblici
- **In Evidenza**: Progetti featured
- **Totali**: Conteggio totale progetti

### Azioni Disponibili
- ✅ **Conferma progetto**: Rende il progetto pubblico
- ⭐ **Metti in evidenza**: Marca come featured
- 👁️ **Visualizza**: Apre la pagina del progetto
- 🗑️ **Elimina**: Rimuove completamente il progetto

### Filtri
- **Tutti**: Mostra tutti i progetti
- **In Attesa**: Solo progetti pending
- **Confermati**: Solo progetti approvati

## 🎨 UI Improvements

### Contributors & Sponsors Layout
- **Mobile**: 2 colonne
- **Tablet**: 3 colonne  
- **Desktop**: 4 colonne
- Layout responsive e ottimizzato

### Admin Dashboard
- Design dark theme coerente con la piattaforma
- Tabella responsive con azioni rapide
- Statistiche visive con icone
- Paginazione per performance

## 🔒 Security Features

### JWT Authentication
- Token expiration: 24 ore
- Role-based access control
- Secure password hashing (bcrypt)
- Protected admin routes

### API Security
- Middleware di autenticazione
- Validazione input
- Error handling sicuro
- Rate limiting ready

## 🚀 Future Enhancements

### Possibili Miglioramenti:
1. **Multi-role system**: Super admin, moderator, editor
2. **Activity logs**: Tracking delle azioni admin
3. **Bulk operations**: Azioni multiple sui progetti
4. **Advanced filtering**: Filtri per data, categoria, metriche
5. **Email notifications**: Alert per progetti pending
6. **API statistics**: Metriche di utilizzo
7. **Backup/restore**: Gestione backup database

## 📝 Usage Flow

### Per gli Admin:
1. Login su `/admin/login`
2. Visualizza dashboard con statistiche
3. Filtra progetti per stato (pending/confirmed)
4. Revisiona progetti pending
5. Conferma/rifiuta/elimina progetti
6. Metti in evidenza progetti meritevoli

### Per gli Utenti:
1. Aggiungono progetti tramite form
2. Progetti vanno in stato "pending"
3. Attendono approvazione admin
4. Una volta confermati, diventano pubblici

## 🎯 Production Checklist

- [ ] Cambia JWT_SECRET in production
- [ ] Cambia password admin default
- [ ] Configura rate limiting
- [ ] Setup monitoring/logging
- [ ] Backup database strategy
- [ ] SSL/HTTPS configurato
- [ ] Environment variables sicure

---

🎉 **Sistema Admin completo e funzionante!** 
Ora hai il controllo completo sui progetti della piattaforma con un'interfaccia moderna e sicura. 