# Stackspedia Platform

La piattaforma completa per esplorare, scoprire e contribuire ai migliori progetti Open Source.

## 🚀 Funzionalità Implementate

### 📊 Database Schema
- **Projects**: Progetti open source con informazioni complete
- **Stack Components**: Componenti tecnologici riutilizzabili
- **Project Stack**: Relazioni N:N tra progetti e stack
- **Metrics**: Metriche dei progetti (stars, forks, issues)
- **Roadmap Items**: Roadmap e milestone dei progetti

### 🛠️ API Endpoints

#### Projects
- `GET /api/projects` - Lista progetti con filtri e paginazione
- `POST /api/projects` - Crea nuovo progetto
- `GET /api/projects/[slug]` - Dettagli progetto
- `PUT /api/projects/[slug]` - Aggiorna progetto
- `DELETE /api/projects/[slug]` - Elimina progetto

#### Stack Components
- `GET /api/stack-components` - Lista componenti stack
- `POST /api/stack-components` - Crea nuovo componente

### 🎨 UI/UX
- **Home Page**: Esplorazione progetti con filtri avanzati
- **Project Details**: Pagina dettagliata con stack, metriche, roadmap
- **Add Project**: Form completo per aggiungere nuovi progetti
- **Responsive Design**: Ottimizzato per mobile e desktop
- **Dark Theme**: Design moderno con glassmorphism

## 🔧 Setup e Configurazione

### 1. Database Setup (Supabase)

Esegui lo script SQL per creare le tabelle:

```sql
-- Vedi il file per lo schema completo delle tabelle
```

### 2. Popolare i Dati

Esegui il seed script per popolare i componenti stack:

```sql
-- Esegui src/lib/seed-data.sql nel SQL Editor di Supabase
```

### 3. Variabili d'Ambiente

Configura le variabili d'ambiente:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Avvio Locale

```bash
npm run dev
```

## 📱 Utilizzo della Piattaforma

### Esplorare Progetti
1. Vai su `/platform`
2. Usa i filtri per cercare progetti specifici:
   - **Ricerca testuale**: Nome e descrizione
   - **Stato**: Active, Stale, Deprecated
   - **Tecnologie**: Frontend, Backend, Database, etc.

### Visualizzare Dettagli Progetto
1. Clicca su un progetto o vai su `/platform/projects/[slug]`
2. Visualizza:
   - Stack tecnologico organizzato per categoria
   - Metriche GitHub (stars, forks, issues)
   - Roadmap e milestone
   - Links utili (repository, homepage)

### Aggiungere Nuovo Progetto
1. Vai su `/platform/add-project`
2. Compila il form con:
   - **Info base**: Nome, descrizione, URLs
   - **Stack tecnologico**: Selezione multipla per categoria
   - **Tags**: Etichette personalizzate
   - **Stato**: Active/Stale/Deprecated

## 🎯 Filtri e Ricerca

### Filtri Disponibili
- **Ricerca**: Cerca nei nomi e descrizioni
- **Stato del progetto**: Active, Stale, Deprecated
- **Tecnologie**: Filtra per tipo di stack
- **Paginazione**: 20 progetti per pagina

### Esempi di URL con Filtri
```
/api/projects?search=react&status=active&stack_types=frontend
/api/projects?tags=javascript&tags=typescript&page=2
```

## 🗂️ Struttura Dati

### Categorie Stack Tecnologico
- **🎨 Frontend**: React, Vue, Angular, Next.js
- **⚙️ Backend**: Node.js, Django, FastAPI, Laravel
- **🗄️ Database**: PostgreSQL, MongoDB, Redis, Supabase
- **🔄 CI/CD**: GitHub Actions, GitLab CI, Jenkins
- **🚀 DevOps**: Docker, Kubernetes, AWS, Vercel
- **🔧 Tooling**: Webpack, Vite, ESLint, Jest
- **⚡ Runtime**: Node.js, Deno, Python, Go

### Metadati Progetto
- **Identità**: Nome, slug, descrizione, logo
- **Links**: Repository, homepage, documentazione
- **Licenza**: MIT, Apache, GPL, etc.
- **Stato**: Active (attivo), Stale (stagnante), Deprecated
- **Tags**: Etichette personalizzate
- **Visibilità**: Pubblico/privato

## 🔮 Funzionalità Future

### Fase 2 - Collaborazione
- [ ] Sistema di autenticazione utenti
- [ ] Contributi e submission workflow
- [ ] Votazioni e rating progetti
- [ ] Commenti e discussioni

### Fase 3 - Analytics
- [ ] Metriche avanzate (commit frequency, contributor activity)
- [ ] Trending projects
- [ ] Statistiche di utilizzo stack
- [ ] Confronto progetti simili

### Fase 4 - Community
- [ ] Profili utente e portfolio
- [ ] Collezioni e liste personalizzate
- [ ] Notifiche e follow progetti
- [ ] Badge e achievements

### Fase 5 - Integrazione
- [ ] Sync automatico con GitHub API
- [ ] Integrazione con package managers (npm, pip, etc.)
- [ ] API pubblica per sviluppatori
- [ ] Webhook per aggiornamenti esterni

## 🎨 Design System

### Colori
- **Primary**: Blue (#3B82F6)
- **Background**: Slate gradient (#0F172A → #1E293B)
- **Cards**: White/5% opacity con backdrop-blur
- **Text**: White (#FFFFFF) e Slate-300 (#CBD5E1)

### Componenti
- **Cards**: Glassmorphism effect con hover animations
- **Buttons**: Rounded design con stati hover/focus
- **Forms**: Consistent styling con validazione
- **Filters**: Pill-shaped buttons con stati attivi

### Responsive
- **Mobile**: Stack verticale, filtri collassabili
- **Tablet**: Grid 2 colonne
- **Desktop**: Grid 3 colonne, sidebar filtri

## 🚀 Deployment

### Vercel (Consigliato)
1. Collega il repository GitHub
2. Configura le variabili d'ambiente
3. Deploy automatico ad ogni push

### Altro hosting
- Supporta qualsiasi piattaforma che supporti Next.js
- Richiede database PostgreSQL (Supabase consigliato)

## 📝 Contribuire

1. Fork del repository
2. Crea branch per la feature
3. Implementa le modifiche
4. Test completi
5. Pull request con descrizione dettagliata

## 🔧 Tecnologie Utilizzate

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: TailwindCSS, Shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **API**: Next.js API Routes
- **Deployment**: Vercel

---

**Stackspedia** - The hub for Open Source projects 🚀 