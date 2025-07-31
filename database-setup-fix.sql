-- SETUP COMPLETO DATABASE SUPABASE PER STACKSPEDIA
-- Eseguire questo script nel SQL Editor di Supabase

-- 1. Prima creiamo/aggiorniamo la tabella projects con tutte le colonne necessarie
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS is_confirmed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- 2. Creiamo le tabelle mancanti se non esistono

-- Tabella stack_components (se non esiste)
CREATE TABLE IF NOT EXISTS stack_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  type text CHECK (type IN ('frontend', 'backend', 'database', 'ci_cd', 'devops', 'tooling', 'runtime')) NOT NULL,
  official_url text,
  description text,
  icon_url text,
  created_at timestamptz DEFAULT now()
);

-- Tabella project_stack (relazione many-to-many)
CREATE TABLE IF NOT EXISTS project_stack (
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  stack_component_id uuid REFERENCES stack_components(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, stack_component_id)
);

-- Tabella metrics
CREATE TABLE IF NOT EXISTS metrics (
  project_id uuid PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  stars integer DEFAULT 0,
  forks integer DEFAULT 0,
  open_issues integer DEFAULT 0,
  contributors_count integer DEFAULT 0,
  last_commit_at timestamptz,
  last_release_at timestamptz,
  first_commit_at timestamptz,
  language_stats jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Tabella contributors
CREATE TABLE IF NOT EXISTS contributors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  github_username text,
  avatar_url text,
  role text CHECK (role IN ('maintainer', 'core_contributor', 'contributor', 'founder')) DEFAULT 'contributor',
  bio text,
  website_url text,
  twitter_username text,
  linkedin_url text,
  is_active boolean DEFAULT true,
  joined_at timestamptz DEFAULT now(),
  contributions_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Tabella sponsors
CREATE TABLE IF NOT EXISTS sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  logo_url text,
  website_url text,
  type text CHECK (type IN ('individual', 'company', 'organization', 'foundation')) DEFAULT 'company',
  tier text CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')) DEFAULT 'bronze',
  amount_monthly numeric(10,2),
  currency text DEFAULT 'USD',
  description text,
  is_active boolean DEFAULT true,
  started_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Tabella community_links
CREATE TABLE IF NOT EXISTS community_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  platform text CHECK (platform IN ('discord', 'slack', 'reddit', 'twitter', 'linkedin', 'telegram', 'matrix', 'forum', 'mailing_list', 'other')) NOT NULL,
  url text NOT NULL,
  name text,
  member_count integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabella contributing_info
CREATE TABLE IF NOT EXISTS contributing_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  difficulty_level text CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'intermediate',
  setup_time_minutes integer,
  contributing_guide_url text,
  code_of_conduct_url text,
  good_first_issues_count integer DEFAULT 0,
  documentation_url text,
  development_setup_guide text,
  testing_guide text,
  preferred_languages text[],
  requires_cla boolean DEFAULT false,
  has_mentorship boolean DEFAULT false,
  hacktoberfest_friendly boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Tabella project_health
CREATE TABLE IF NOT EXISTS project_health (
  project_id uuid PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  health_score integer CHECK (health_score >= 0 AND health_score <= 100),
  bus_factor integer,
  avg_time_to_close_issue_days integer,
  avg_time_to_merge_pr_days integer,
  activity_level text CHECK (activity_level IN ('very_low', 'low', 'medium', 'high', 'very_high')) DEFAULT 'medium',
  community_engagement_score integer,
  documentation_quality_score integer,
  last_calculated_at timestamptz DEFAULT now()
);

-- Tabella getting_started_guides
CREATE TABLE IF NOT EXISTS getting_started_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  order_index integer DEFAULT 0,
  estimated_time_minutes integer,
  prerequisites text[],
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabella roadmap_items (se non esiste già)
CREATE TABLE IF NOT EXISTS roadmap_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text CHECK (status IN ('planned', 'in_progress', 'done')) DEFAULT 'planned',
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  link text,
  created_at timestamptz DEFAULT now()
);

-- 3. Creiamo indici per performance
CREATE INDEX IF NOT EXISTS idx_projects_confirmed ON projects(is_confirmed);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_contributors_project_id ON contributors(project_id);
CREATE INDEX IF NOT EXISTS idx_contributors_role ON contributors(role);
CREATE INDEX IF NOT EXISTS idx_sponsors_project_id ON sponsors(project_id);
CREATE INDEX IF NOT EXISTS idx_sponsors_tier ON sponsors(tier);
CREATE INDEX IF NOT EXISTS idx_community_links_project_id ON community_links(project_id);
CREATE INDEX IF NOT EXISTS idx_community_links_platform ON community_links(platform);
CREATE INDEX IF NOT EXISTS idx_contributing_info_project_id ON contributing_info(project_id);
CREATE INDEX IF NOT EXISTS idx_project_health_project_id ON project_health(project_id);
CREATE INDEX IF NOT EXISTS idx_getting_started_project_id ON getting_started_guides(project_id);
CREATE INDEX IF NOT EXISTS idx_getting_started_order ON getting_started_guides(project_id, order_index);
CREATE INDEX IF NOT EXISTS idx_metrics_project_id ON metrics(project_id);
CREATE INDEX IF NOT EXISTS idx_project_stack_project_id ON project_stack(project_id);
CREATE INDEX IF NOT EXISTS idx_project_stack_component_id ON project_stack(stack_component_id);

-- 4. Abilitiamo RLS dove necessario
ALTER TABLE contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributing_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE getting_started_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_stack ENABLE ROW LEVEL SECURITY;

-- 5. Creiamo policy di base per lettura pubblica (drop prima se esistono)
DROP POLICY IF EXISTS "Enable read access for all users" ON contributors;
DROP POLICY IF EXISTS "Enable read access for all users" ON sponsors;
DROP POLICY IF EXISTS "Enable read access for all users" ON community_links;
DROP POLICY IF EXISTS "Enable read access for all users" ON contributing_info;
DROP POLICY IF EXISTS "Enable read access for all users" ON project_health;
DROP POLICY IF EXISTS "Enable read access for all users" ON getting_started_guides;
DROP POLICY IF EXISTS "Enable read access for all users" ON metrics;
DROP POLICY IF EXISTS "Enable read access for all users" ON project_stack;
DROP POLICY IF EXISTS "Enable read access for all users" ON stack_components;

CREATE POLICY "Enable read access for all users" ON contributors FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON sponsors FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON community_links FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON contributing_info FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON project_health FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON getting_started_guides FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON metrics FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON project_stack FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON stack_components FOR SELECT USING (true);

-- 6. Inserire alcuni stack components di base se la tabella è vuota
INSERT INTO stack_components (name, type, description) VALUES
('React', 'frontend', 'JavaScript library for building user interfaces'),
('Vue.js', 'frontend', 'Progressive JavaScript framework'),
('Angular', 'frontend', 'Platform for building mobile and desktop web applications'),
('Next.js', 'frontend', 'React framework for production'),
('Svelte', 'frontend', 'Cybernetically enhanced web apps'),

('Node.js', 'backend', 'JavaScript runtime built on Chrome V8 engine'),
('Express', 'backend', 'Fast, unopinionated, minimalist web framework for Node.js'),
('Django', 'backend', 'High-level Python web framework'),
('Flask', 'backend', 'Lightweight WSGI web application framework'),
('FastAPI', 'backend', 'Modern, fast web framework for building APIs with Python'),
('Spring Boot', 'backend', 'Java-based framework for creating microservices'),
('Ruby on Rails', 'backend', 'Server-side web application framework written in Ruby'),
('ASP.NET Core', 'backend', 'Cross-platform, high-performance framework for modern apps'),
('Go', 'backend', 'Open source programming language'),
('Rust', 'backend', 'Systems programming language'),
('C++', 'runtime', 'General-purpose programming language'),
('Python', 'runtime', 'High-level programming language'),
('Java', 'runtime', 'Object-oriented programming language'),
('TypeScript', 'runtime', 'Typed superset of JavaScript'),
('PHP', 'backend', 'Popular general-purpose scripting language'),

('PostgreSQL', 'database', 'Advanced open source relational database'),
('MySQL', 'database', 'Popular open-source relational database'),
('MongoDB', 'database', 'Document-oriented NoSQL database'),
('Redis', 'database', 'In-memory data structure store'),
('SQLite', 'database', 'Self-contained SQL database engine'),
('Supabase', 'database', 'Open source Firebase alternative'),

('Docker', 'devops', 'Platform for developing, shipping, and running applications'),
('Kubernetes', 'devops', 'Container orchestration platform'),
('AWS', 'devops', 'Amazon Web Services cloud platform'),
('Vercel', 'devops', 'Platform for frontend frameworks and static sites'),
('Netlify', 'devops', 'Platform for modern web development'),

('GitHub Actions', 'ci_cd', 'Automation platform for CI/CD workflows'),
('GitLab CI', 'ci_cd', 'Continuous integration service'),
('Jenkins', 'ci_cd', 'Open source automation server'),
('CircleCI', 'ci_cd', 'Continuous integration and delivery platform'),

('Webpack', 'tooling', 'Module bundler for modern JavaScript applications'),
('Vite', 'tooling', 'Next generation frontend tooling'),
('ESLint', 'tooling', 'Pluggable JavaScript linter'),
('Prettier', 'tooling', 'Opinionated code formatter'),
('Jest', 'tooling', 'JavaScript testing framework'),
('Cypress', 'tooling', 'End-to-end testing framework'),
('Tailwind CSS', 'tooling', 'Utility-first CSS framework'),
('Sass', 'tooling', 'CSS preprocessor'),
('CMake', 'tooling', 'Cross-platform build system')

ON CONFLICT (name) DO NOTHING;

-- 7. Verifica che tutto sia stato creato correttamente
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'projects', 'stack_components', 'project_stack', 
        'metrics', 'contributors', 'sponsors', 
        'community_links', 'contributing_info', 
        'project_health', 'getting_started_guides', 
        'roadmap_items'
    )
ORDER BY tablename;

-- Messaggio finale
SELECT 'Database schema setup completato! Ora puoi importare progetti.' as message;