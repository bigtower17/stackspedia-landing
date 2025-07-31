-- FIX RLS POLICIES per Importazione Progetti
-- Eseguire in Supabase SQL Editor

-- 1. Aggiungi policy per inserimenti nelle tabelle correlate

-- project_stack (relazioni stack components)
DROP POLICY IF EXISTS "Enable insert for project_stack" ON project_stack;
CREATE POLICY "Enable insert for project_stack" ON project_stack 
  FOR INSERT 
  WITH CHECK (true);

-- metrics (metriche GitHub)  
DROP POLICY IF EXISTS "Enable insert for metrics" ON metrics;
CREATE POLICY "Enable insert for metrics" ON metrics 
  FOR INSERT 
  WITH CHECK (true);

-- contributors (contributors GitHub)
DROP POLICY IF EXISTS "Enable insert for contributors" ON contributors;
CREATE POLICY "Enable insert for contributors" ON contributors 
  FOR INSERT 
  WITH CHECK (true);

-- sponsors (per completezza futura)
DROP POLICY IF EXISTS "Enable insert for sponsors" ON sponsors;
CREATE POLICY "Enable insert for sponsors" ON sponsors 
  FOR INSERT 
  WITH CHECK (true);

-- community_links (per completezza futura) 
DROP POLICY IF EXISTS "Enable insert for community_links" ON community_links;
CREATE POLICY "Enable insert for community_links" ON community_links 
  FOR INSERT 
  WITH CHECK (true);

-- contributing_info (per completezza futura)
DROP POLICY IF EXISTS "Enable insert for contributing_info" ON contributing_info;
CREATE POLICY "Enable insert for contributing_info" ON contributing_info 
  FOR INSERT 
  WITH CHECK (true);

-- project_health (per completezza futura)
DROP POLICY IF EXISTS "Enable insert for project_health" ON project_health;
CREATE POLICY "Enable insert for project_health" ON project_health 
  FOR INSERT 
  WITH CHECK (true);

-- getting_started_guides (per completezza futura)
DROP POLICY IF EXISTS "Enable insert for getting_started_guides" ON getting_started_guides;
CREATE POLICY "Enable insert for getting_started_guides" ON getting_started_guides 
  FOR INSERT 
  WITH CHECK (true);

-- roadmap_items (se ha RLS abilitato)
DROP POLICY IF EXISTS "Enable insert for roadmap_items" ON roadmap_items;
CREATE POLICY "Enable insert for roadmap_items" ON roadmap_items 
  FOR INSERT 
  WITH CHECK (true);

-- 2. Anche policy UPDATE per future modifiche

-- project_stack UPDATE
DROP POLICY IF EXISTS "Enable update for project_stack" ON project_stack;
CREATE POLICY "Enable update for project_stack" ON project_stack 
  FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

-- metrics UPDATE
DROP POLICY IF EXISTS "Enable update for metrics" ON metrics;
CREATE POLICY "Enable update for metrics" ON metrics 
  FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

-- contributors UPDATE
DROP POLICY IF EXISTS "Enable update for contributors" ON contributors;
CREATE POLICY "Enable update for contributors" ON contributors 
  FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

-- 3. Verifica che le policy siano state create
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('project_stack', 'metrics', 'contributors', 'sponsors', 'community_links')
ORDER BY tablename, cmd;

-- Messaggio finale
SELECT 'RLS Policies aggiornate! Ora l''importazione dovrebbe funzionare completamente.' as message;