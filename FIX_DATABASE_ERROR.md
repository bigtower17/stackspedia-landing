# 🔧 Fix Database Error per Importazione

## ❌ Errore Attuale
```
Errore inserimento progetto: Could not find the 'stack_components' column of 'projects' in the schema cache
```

## 🎯 Soluzione Step-by-Step

### Passo 1: Aggiorna Database Schema

1. **Vai su Supabase Dashboard**: https://app.supabase.com
2. **Apri il tuo progetto** StackSpedia
3. **Vai su SQL Editor**
4. **Copia e incolla** tutto il contenuto di `database-setup-fix.sql`
5. **Clicca "Run"**

### Passo 2: Verifica Database

Dopo aver eseguito lo script, dovresti vedere:

```sql
-- Risultato finale
SELECT 'Database schema setup completato! Ora puoi importare progetti.' as message;
```

E la lista delle tabelle create:
- ✅ projects
- ✅ stack_components  
- ✅ project_stack
- ✅ metrics
- ✅ contributors
- ✅ sponsors
- ✅ community_links
- ✅ contributing_info
- ✅ project_health
- ✅ getting_started_guides
- ✅ roadmap_items

### Passo 3: Restart Applicazione

```bash
# Ferma il server se sta girando (Ctrl+C)
# Poi riavvia
npm run dev
```

### Passo 4: Testa Importazione

```bash
# Testa con LizardByte/Sunshine
node scripts/import-github-project.js https://github.com/LizardByte/Sunshine
```

## 🔍 Cosa è Stato Corretto

### Database Schema
- ✅ Tabella `projects` NON contiene `stack_components` (corretto)
- ✅ Relazione many-to-many attraverso `project_stack`
- ✅ Tutte le tabelle necessarie create
- ✅ Indici per performance
- ✅ RLS policies per sicurezza

### Codice Importer
- ✅ `prepareProjectData` ora separa dati progetto da stack components
- ✅ Stack components inseriti in tabella separata `project_stack`
- ✅ Nessun tentativo di inserire `stack_components` in `projects`

## 🎮 Test con LizardByte/Sunshine

Dopo il fix, l'importazione dovrebbe:

1. ✅ **Recuperare info GitHub**: Nome, descrizione, URL, licenza
2. ✅ **Fare scraping metriche**: Stars, forks, contributors, issues  
3. ✅ **Rilevare stack technology**: C++, CMake, Docker, etc.
4. ✅ **Inserire progetto** nella tabella `projects`
5. ✅ **Associare stack components** via `project_stack`
6. ✅ **Salvare metriche** in tabella `metrics`
7. ✅ **Aggiungere contributors** da GitHub

## 🛠️ Se Ancora Non Funziona

### Debug Database
```sql
-- Verifica che le tabelle esistano
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verifica struttura tabella projects
\d projects;

-- Verifica stack components
SELECT count(*) FROM stack_components;
```

### Debug Codice
Aggiungi console.log nell'importer:

```typescript
// In src/lib/github-project-importer.ts
console.log('Project data:', JSON.stringify(projectData, null, 2));
console.log('Stack components:', stackComponentIds);
```

### Restart Completo
```bash
# Pulisci cache Next.js
rm -rf .next

# Reinstalla dipendenze
npm install

# Riavvia
npm run dev
```

## 📋 Checklist Finale

Prima di testare importazione:

- [ ] ✅ Schema database eseguito in Supabase
- [ ] ✅ Tabelle create (verifica in Supabase Dashboard)
- [ ] ✅ Server riavviato
- [ ] ✅ Nessun errore di build/compilazione
- [ ] 🔧 GITHUB_TOKEN configurato (opzionale ma raccomandato)

## 🚀 Risultato Atteso

```bash
$ node scripts/import-github-project.js https://github.com/LizardByte/Sunshine

🔍 Ottenimento suggerimenti...
🔍 Suggerimenti stack components per: https://github.com/LizardByte/Sunshine
   Componenti suggeriti: 5
   - cpp-component-id
   - cmake-component-id
   - docker-component-id
   - github-actions-component-id
   - linux-component-id

🚀 Importazione progetto: https://github.com/LizardByte/Sunshine
   Approvazione automatica: ❌
   Visibilità pubblica: ✅
✅ Progetto "Sunshine" importato con successo! In attesa di approvazione.
   ID Progetto: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   URL: http://localhost:3000/projects/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Dopo il fix, l'importazione dovrebbe funzionare perfettamente! 🎉