-- Enhanced database schema for open source projects

-- Existing tables (keeping them)
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  logo_url text,
  homepage_url text,
  repo_url text,
  license text,
  status text CHECK (status IN ('active', 'stale', 'deprecated')) DEFAULT 'active',
  tags text[],
  visibility boolean DEFAULT true,
  submitter_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stack_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  type text CHECK (type IN ('frontend', 'backend', 'database', 'ci_cd', 'devops', 'tooling', 'runtime')) NOT NULL,
  official_url text,
  description text,
  icon_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_stack (
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  stack_component_id uuid REFERENCES stack_components(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, stack_component_id)
);

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

-- NEW TABLES FOR OPEN SOURCE FEATURES

-- Contributors/Maintainers (equivalent to "Meet the team")
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

-- Sponsors/Backers (equivalent to "Meet the investors")
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

-- Community links (Discord, Slack, Reddit, etc.)
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

-- Contributing information
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

-- Project health metrics
CREATE TABLE IF NOT EXISTS project_health (
  project_id uuid PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  health_score integer CHECK (health_score >= 0 AND health_score <= 100),
  bus_factor integer, -- How many key contributors could leave before project is at risk
  avg_time_to_close_issue_days integer,
  avg_time_to_merge_pr_days integer,
  activity_level text CHECK (activity_level IN ('very_low', 'low', 'medium', 'high', 'very_high')) DEFAULT 'medium',
  community_engagement_score integer,
  documentation_quality_score integer,
  last_calculated_at timestamptz DEFAULT now()
);

-- Getting started guides
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contributors_project_id ON contributors(project_id);
CREATE INDEX IF NOT EXISTS idx_contributors_role ON contributors(role);
CREATE INDEX IF NOT EXISTS idx_sponsors_project_id ON sponsors(project_id);
CREATE INDEX IF NOT EXISTS idx_sponsors_tier ON sponsors(tier);
CREATE INDEX IF NOT EXISTS idx_community_links_project_id ON community_links(project_id);
CREATE INDEX IF NOT EXISTS idx_community_links_platform ON community_links(platform);
CREATE INDEX IF NOT EXISTS idx_contributing_info_project_id ON contributing_info(project_id);
CREATE INDEX IF NOT EXISTS idx_contributing_info_difficulty ON contributing_info(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_project_health_project_id ON project_health(project_id);
CREATE INDEX IF NOT EXISTS idx_getting_started_project_id ON getting_started_guides(project_id);
CREATE INDEX IF NOT EXISTS idx_getting_started_order ON getting_started_guides(project_id, order_index);

-- Enable RLS (Row Level Security) for all tables
ALTER TABLE contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributing_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE getting_started_guides ENABLE ROW LEVEL SECURITY;

-- RLS policies (basic read access for all, can be refined later)
CREATE POLICY "Enable read access for all users" ON contributors FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON sponsors FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON community_links FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON contributing_info FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON project_health FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON getting_started_guides FOR SELECT USING (true); 