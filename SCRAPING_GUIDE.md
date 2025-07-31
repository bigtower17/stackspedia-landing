# Sistema di Scraping GitHub per StackSpedia

Questo sistema automatizza il recupero delle metriche GitHub per i progetti nella piattaforma.

## 🚀 Funzionalità

- **Scraping automatico** delle metriche GitHub (stars, forks, issues, contributors)
- **Aggiornamento batch** di tutti i progetti
- **Aggiornamento singolo progetto**
- **Gestione rate limits** GitHub
- **Sistema di retry** e gestione errori
- **Aggiornamento contributors** automatico

## 📊 Dati Raccolti

### Metriche Base
- ⭐ **Stars**: Numero di stelle del repository
- 🍴 **Forks**: Numero di fork
- 🐛 **Issues**: Issues aperte
- 👥 **Contributors**: Numero di contributori

### Metadati Temporali
- 📅 **Last Commit**: Data ultimo commit
- 🏷️ **Last Release**: Data ultimo release
- 🎯 **First Commit**: Data primo commit

### Dati Aggiuntivi
- 💻 **Language Stats**: Statistiche linguaggi (JSON)
- 👨‍💻 **Contributors List**: Lista contributors con avatar e contributi

## 🛠️ Setup

### 1. Token GitHub (Raccomandato)

Crea un Personal Access Token su [GitHub Settings](https://github.com/settings/tokens):

1. Vai su **Settings** > **Developer settings** > **Personal access tokens**
2. Crea un token con permessi `public_repo`
3. Aggiungi al `.env.local`:

```bash
GITHUB_TOKEN=ghp_your_token_here
```

**Perché serve?**: Aumenta i rate limits da 60 a 5,000 richieste/ora.

### 2. Database

Le tabelle necessarie sono già nel schema:
- `metrics` - Metriche repository
- `contributors` - Contributors GitHub

## 📡 API Endpoints

### POST `/api/scrape/github`
Scraping singolo progetto.

```json
{
  "project_id": "uuid-del-progetto",
  "repo_url": "https://github.com/owner/repo"
}
```

### GET `/api/scrape/github`
Aggiornamento batch di tutti i progetti (con delay anti-rate-limit).

### POST `/api/admin/metrics/update`
Sistema avanzato di aggiornamento con opzioni.

```json
{
  "project_id": "uuid-progetto", // Opzionale, per singolo progetto
  "force_update": false,         // Forza aggiornamento anche se recente
  "max_age": 24,                // Ore dopo cui considerare dati vecchi
  "delay_ms": 1000              // Delay tra richieste (ms)
}
```

### GET `/api/admin/metrics/update`
Statistiche sui progetti che necessitano aggiornamento.

## 🎯 Come Usare

### Comando rapido
```bash
# Test del sistema
npm run scrape:test

# Aggiornamento tutti i progetti
npm run scrape:update

# Visualizza statistiche
npm run scrape:stats
```

### Da codice
```typescript
import { metricsUpdater } from '@/lib/metrics-updater';

// Aggiorna tutti i progetti
const result = await metricsUpdater.updateAllProjectMetrics({
  forceUpdate: false,
  maxAge: 24,
  delayMs: 1000
});

// Aggiorna singolo progetto
const result = await metricsUpdater.updateSingleProject('project-id');

// Ottieni statistiche
const stats = await metricsUpdater.getUpdateStats();
```

### Da client
```typescript
// Aggiorna tutti i progetti
const response = await fetch('/api/admin/metrics/update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ force_update: false })
});

// Aggiorna singolo progetto
const response = await fetch('/api/admin/metrics/update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ project_id: 'uuid-progetto' })
});
```

## ⚡ Automazione

### Cron Job (Consigliato)
Aggiungi un cron job per aggiornamento automatico:

```bash
# Ogni giorno alle 2:00 AM
0 2 * * * curl -X POST http://your-domain.com/api/admin/metrics/update
```

### Vercel Cron
Usa [Vercel Cron](https://vercel.com/docs/functions/cron-jobs):

```typescript
// api/cron/update-metrics.ts
import { metricsUpdater } from '@/lib/metrics-updater';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const result = await metricsUpdater.updateAllProjectMetrics();
  return res.json(result);
}
```

### GitHub Actions
```yaml
name: Update GitHub Metrics
on:
  schedule:
    - cron: '0 2 * * *' # Ogni giorno alle 2:00 AM
  workflow_dispatch: # Trigger manuale

jobs:
  update-metrics:
    runs-on: ubuntu-latest
    steps:
      - name: Update Metrics
        run: |
          curl -X POST ${{ secrets.SITE_URL }}/api/admin/metrics/update
```

## 🚨 Rate Limits & Best Practices

### Limiti GitHub
- **Senza token**: 60 richieste/ora per IP
- **Con token**: 5,000 richieste/ora per token

### Best Practices
1. **Usa sempre il token** per produzione
2. **Delay di 1 secondo** tra richieste (configurabile)
3. **Aggiorna solo quando necessario** (max_age)
4. **Monitora i rate limits** tramite l'API

### Gestione Errori
Il sistema gestisce automaticamente:
- Repository inesistenti (404)
- Rate limit raggiunto (403)
- Token non valido (401)
- Errori di rete (timeout, retry)

## 📈 Monitoraggio

### Log degli Errori
Gli errori vengono loggati con dettagli:
```typescript
{
  success: false,
  stats: {
    total: 50,
    successful: 45,
    failed: 3,
    skipped: 2
  },
  errors: [
    { project: "Next.js", error: "Rate limit raggiunto" },
    { project: "React", error: "Repository non trovato" }
  ],
  rate_limit: {
    remaining: 4950,
    resetAt: "2024-01-01T03:00:00Z"
  }
}
```

### Metriche Database
Ogni aggiornamento salva:
- Timestamp ultimo aggiornamento
- Tutte le metriche GitHub
- Lista contributors aggiornata

## 🔧 Troubleshooting

### Errore "Repository non trovato"
- Verifica che l'URL sia corretto
- Controlla che il repository sia pubblico
- Assicurati che non sia stato eliminato

### Rate limit raggiunto
- Aggiungi/verifica il `GITHUB_TOKEN`
- Aumenta il `delay_ms` tra richieste
- Riduci la frequenza di aggiornamento

### Token non valido
- Rigenera il token su GitHub
- Verifica i permessi (`public_repo`)
- Controlla che non sia scaduto

### Errori database
- Verifica la connessione Supabase
- Controlla che le tabelle esistano
- Verifica i permessi RLS

## 📝 Esempi d'Uso

### Admin Dashboard
```typescript
// Componente per admin dashboard
export function MetricsPanel() {
  const [stats, setStats] = useState(null);
  const [updating, setUpdating] = useState(false);
  
  const loadStats = async () => {
    const res = await fetch('/api/admin/metrics/update');
    const data = await res.json();
    setStats(data.stats);
  };
  
  const updateAll = async () => {
    setUpdating(true);
    const res = await fetch('/api/admin/metrics/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ force_update: false })
    });
    const result = await res.json();
    setUpdating(false);
    console.log('Aggiornamento completato:', result);
  };
  
  return (
    <div>
      <button onClick={loadStats}>📊 Carica Statistiche</button>
      <button onClick={updateAll} disabled={updating}>
        {updating ? '⏳ Aggiornando...' : '🔄 Aggiorna Tutti'}
      </button>
      {stats && (
        <div>
          <p>Progetti totali: {stats.total_projects}</p>
          <p>Con GitHub: {stats.with_github_repos}</p>
          <p>Mai aggiornati: {stats.never_updated}</p>
          <p>Da aggiornare: {stats.outdated}</p>
        </div>
      )}
    </div>
  );
}
```

### Hook per Progetti
```typescript
// Hook per aggiornare metriche di un progetto
export function useProjectMetrics(projectId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const updateMetrics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/admin/metrics/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId })
      });
      
      const result = await res.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return { updateMetrics, loading, error };
}
```

## 🎉 Sistema Completo!

Il sistema di scraping è ora completamente funzionale e pronto per l'uso in produzione. Supporta:

✅ Scraping automatico delle metriche GitHub  
✅ Aggiornamento batch con rate limiting  
✅ Gestione errori robusta  
✅ API endpoints completi  
✅ Sistema di monitoraggio  
✅ Documentazione completa  

Per iniziare, aggiungi il `GITHUB_TOKEN` e testa con `npm run scrape:test`!