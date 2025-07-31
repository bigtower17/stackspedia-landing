# 🚀 Guida Importazione Progetti GitHub

Questa guida ti mostra tutti i modi per aggiungere progetti a StackSpedia, incluso LizardByte/Sunshine.

## 📋 Metodi di Aggiunta Progetti

### 1. 🎯 **Importazione Automatica GitHub** (Raccomandato)

Il metodo più veloce per progetti con repository GitHub pubblico.

#### Via Web Interface
1. Vai su `/admin/import`
2. Incolla URL: `https://github.com/LizardByte/Sunshine`
3. Clicca "Suggerimenti" per rilevare stack automaticamente
4. Clicca "Importa Progetto"

#### Via Command Line
```bash
# Importazione singola
npm run import:github https://github.com/LizardByte/Sunshine

# Ottenere suggerimenti stack
node scripts/import-github-project.js --suggest https://github.com/LizardByte/Sunshine

# Importare progetti di esempio
npm run import:examples
```

#### Via API
```bash
# POST /api/admin/import/github
curl -X POST http://localhost:3000/api/admin/import/github \
  -H "Content-Type: application/json" \
  -d '{
    "repo_url": "https://github.com/LizardByte/Sunshine",
    "auto_approve": false,
    "visibility": true,
    "custom_tags": ["gaming", "streaming"],
    "stack_components": ["cpp-component-id", "cmake-component-id"]
  }'
```

### 2. 📝 **Form Manuale**

Per progetti senza GitHub o per controllo completo.

1. Vai su `/add-project`
2. Compila tutte le sezioni:
   - **Basic Info**: Nome, descrizione, URL
   - **Contributors**: Team del progetto
   - **Sponsors**: Sostenitori
   - **Getting Started**: Guide passo-passo
   - **Community**: Discord, Twitter, etc.
   - **Contributing**: Info per contribuire
   - **Metrics**: Statistiche manuali

### 3. 🔄 **Importazione Batch**

Per importare molti progetti insieme.

```javascript
// Via script
const urls = [
  'https://github.com/LizardByte/Sunshine',
  'https://github.com/microsoft/vscode',
  'https://github.com/vercel/next.js'
];

// Importazione multipla con delay
node scripts/import-github-project.js --batch
```

## 🎮 Esempio: LizardByte/Sunshine

### Informazioni Rilevate Automaticamente

Quando importi `https://github.com/LizardByte/Sunshine`, il sistema rileva:

#### 📊 **Metriche GitHub**
- ⭐ **Stars**: ~11,000+
- 🍴 **Forks**: ~800+
- 🐛 **Issues**: Numero variabile
- 👥 **Contributors**: ~50+

#### 💻 **Stack Technology**
Il sistema rileva automaticamente:
- **C++** (linguaggio principale)
- **CMake** (build system)
- **Docker** (containerization)
- **GitHub Actions** (CI/CD)
- **Linux/Windows** (piattaforme)

#### 🏷️ **Tags Automatici**
Dal repository GitHub:
- `gaming`
- `streaming`
- `gamestream`
- `moonlight`
- `nvidia-gamestream`
- `cpp`
- `cmake`

### Dati Specifici del Progetto

```json
{
  "name": "Sunshine",
  "slug": "sunshine",
  "description": "Self-hosted game stream host for Moonlight",
  "repo_url": "https://github.com/LizardByte/Sunshine",
  "homepage_url": "https://lizardbyte.github.io/Sunshine/",
  "license": "GPL-3.0",
  "status": "active",
  "tags": ["gaming", "streaming", "gamestream", "moonlight", "cpp"],
  "stack_components": ["cpp", "cmake", "docker", "github-actions"]
}
```

## 🛠️ Setup Required

### 1. Database Schema
Prima di importare, assicurati che il database abbia lo schema completo:

```sql
-- Eseguire in Supabase SQL Editor
-- Contenuto di src/lib/database-schema.sql
```

### 2. GitHub Token (Opzionale ma Raccomandato)
```bash
# .env.local
GITHUB_TOKEN=ghp_your_token_here
```

**Perché?** Aumenta i rate limits da 60 a 5,000 richieste/ora.

### 3. Stack Components
Assicurati di avere i componenti base nel database:

```sql
-- Esempi di stack components per gaming/streaming
INSERT INTO stack_components (name, type, description) VALUES
('C++', 'runtime', 'Sistema di programmazione ad alte prestazioni'),
('CMake', 'tooling', 'Cross-platform build system'),
('Docker', 'devops', 'Containerization platform'),
('NVIDIA GameStream', 'runtime', 'Game streaming protocol'),
('Moonlight', 'frontend', 'Game streaming client');
```

## 🎯 Workflow Completo

### Passaggio 1: Preparazione
```bash
# 1. Clona/aggiorna il repository
git pull origin main

# 2. Installa dipendenze
npm install

# 3. Avvia il server
npm run dev
```

### Passaggio 2: Importazione
```bash
# Metodo 1: Script automatico
npm run import:github https://github.com/LizardByte/Sunshine

# Metodo 2: Via web
# Vai su http://localhost:3000/admin/import
```

### Passaggio 3: Verifica
```bash
# Controlla che sia stato importato
curl http://localhost:3000/api/projects?search=sunshine

# Aggiorna le metriche se necessario
npm run scrape:update
```

### Passaggio 4: Approvazione (se non auto-approvato)
1. Vai su `/admin/projects`
2. Trova il progetto importato
3. Clicca "Approva" o "Modifica"
4. Imposta `featured: true` se è un progetto importante

## 📈 Post-Importazione

### Aggiornamento Automatico Metriche
Una volta importato, le metriche GitHub vengono aggiornate automaticamente:

```bash
# Aggiornamento manuale
npm run scrape:update

# Aggiornamento singolo progetto
curl -X POST http://localhost:3000/api/admin/metrics/update \
  -H "Content-Type: application/json" \
  -d '{"project_id": "uuid-del-progetto"}'
```

### Cron Job per Aggiornamenti
```bash
# Ogni giorno alle 2:00 AM
0 2 * * * curl -X POST http://localhost:3000/api/admin/metrics/update
```

## 🔧 Troubleshooting

### Errore: "Could not find column"
Il database non ha lo schema completo.
**Soluzione**: Eseguire `src/lib/database-schema.sql` in Supabase.

### Errore: "Repository non trovato"
Il repository è privato o l'URL è errato.
**Soluzione**: Verificare URL e accessibilità.

### Errore: "Rate limit raggiunto"
Troppe richieste GitHub.
**Soluzione**: Aggiungere `GITHUB_TOKEN` o attendere.

### Progetto già esistente
Il repository è già stato importato.
**Soluzione**: Aggiornare le metriche invece di reimportare.

## 📝 Esempi di Progetti da Importare

### Gaming & Streaming
```bash
npm run import:github https://github.com/LizardByte/Sunshine
npm run import:github https://github.com/moonlight-stream/moonlight-qt
npm run import:github https://github.com/parsec-cloud/parsec-sdk
```

### Development Tools
```bash
npm run import:github https://github.com/microsoft/vscode
npm run import:github https://github.com/JetBrains/intellij-community
npm run import:github https://github.com/atom/atom
```

### Web Frameworks
```bash
npm run import:github https://github.com/vercel/next.js
npm run import:github https://github.com/facebook/react
npm run import:github https://github.com/vuejs/vue
```

## 🎉 Risultato Finale

Dopo l'importazione di LizardByte/Sunshine, avrai:

✅ **Progetto completo** con metadati GitHub  
✅ **Metriche aggiornate** automaticamente  
✅ **Contributors** dal repository  
✅ **Stack components** rilevati automaticamente  
✅ **Tags** dai GitHub Topics  
✅ **Aggiornamento periodico** delle statistiche  

Il progetto sarà visibile su:
- Homepage (se approvato)
- Pagina di ricerca
- Filtri per categoria
- API endpoints

## 🚀 Prossimi Passi

1. **Importa LizardByte/Sunshine**
2. **Configura aggiornamento automatico**
3. **Aggiungi altri progetti gaming**
4. **Personalizza categorizzazione**
5. **Configura featured projects**

Il sistema è pronto per importare qualsiasi progetto GitHub pubblico con un solo comando!