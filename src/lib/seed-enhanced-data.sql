-- Sample data for enhanced open source features

-- First, let's make sure we have the stackspedia project (use DO NOTHING to avoid ID conflicts)
INSERT INTO projects (id, name, slug, description, logo_url, homepage_url, repo_url, license, status, tags, visibility, created_at) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-123456789012',
  'Stackspedia',
  'stackspedia',
  'The ultimate hub for Open Source projects. Discover, explore, and contribute to the best open source software.',
  'https://stackspedia.com/logo.png',
  'https://stackspedia.com',
  'https://github.com/bigtower17/stackspedia',
  'MIT',
  'active',
  ARRAY['open-source', 'platform', 'community', 'discovery', 'nextjs', 'typescript'],
  true,
  now()
) ON CONFLICT (slug) DO NOTHING;

-- Get the actual project ID for stackspedia
DO $$
DECLARE
    stackspedia_id UUID;
    react_id UUID;
BEGIN
    -- Get the actual project ID for stackspedia
    SELECT id INTO stackspedia_id FROM projects WHERE slug = 'stackspedia';
    
    -- If we found the project, insert the related data
    IF stackspedia_id IS NOT NULL THEN
        -- Contributors for Stackspedia
        INSERT INTO contributors (project_id, name, github_username, avatar_url, role, bio, website_url, is_active, joined_at, contributions_count) VALUES
        (
          stackspedia_id,
          'Marco Rossi',
          'marcorossi',
          'https://github.com/marcorossi.png',
          'founder',
          'Full-stack developer passionate about open source and developer tools',
          'https://marcorossi.dev',
          true,
          '2024-01-15',
          150
        ),
        (
          stackspedia_id,
          'Giulia Bianchi',
          'giuliabianchi',
          'https://github.com/giuliabianchi.png',
          'maintainer',
          'Frontend specialist with expertise in React and TypeScript',
          'https://giulia.dev',
          true,
          '2024-02-01',
          85
        ),
        (
          stackspedia_id,
          'Luca Verdi',
          'lucaverdi',
          'https://github.com/lucaverdi.png',
          'core_contributor',
          'Backend developer specializing in Node.js and databases',
          null,
          true,
          '2024-03-15',
          42
        ),
        (
          stackspedia_id,
          'Sara Neri',
          'saraneri',
          'https://github.com/saraneri.png',
          'contributor',
          'UI/UX designer who loves contributing to open source projects',
          'https://saraneri.design',
          true,
          '2024-04-01',
          18
        )
        ON CONFLICT (id) DO NOTHING;

        -- Sponsors for Stackspedia
        INSERT INTO sponsors (project_id, name, logo_url, website_url, type, tier, amount_monthly, description, is_active, started_at) VALUES
        (
          stackspedia_id,
          'Vercel',
          'https://vercel.com/logo.png',
          'https://vercel.com',
          'company',
          'gold',
          500.00,
          'Providing hosting and deployment infrastructure',
          true,
          '2024-02-01'
        ),
        (
          stackspedia_id,
          'Supabase',
          'https://supabase.com/logo.png',
          'https://supabase.com',
          'company',
          'silver',
          250.00,
          'Database and authentication services',
          true,
          '2024-03-01'
        ),
        (
          stackspedia_id,
          'GitHub',
          'https://github.com/logo.png',
          'https://github.com',
          'company',
          'platinum',
          1000.00,
          'Code hosting and collaboration platform',
          true,
          '2024-01-15'
        ),
        (
          stackspedia_id,
          'Open Source Collective',
          'https://opencollective.com/logo.png',
          'https://opencollective.com',
          'foundation',
          'bronze',
          100.00,
          'Supporting open source communities worldwide',
          true,
          '2024-04-01'
        )
        ON CONFLICT (id) DO NOTHING;

        -- Community links for Stackspedia
        INSERT INTO community_links (project_id, platform, url, name, member_count, is_active) VALUES
        (
          stackspedia_id,
          'discord',
          'https://discord.gg/stackspedia',
          'Stackspedia Community',
          1250,
          true
        ),
        (
          stackspedia_id,
          'twitter',
          'https://twitter.com/stackspedia',
          'Stackspedia',
          3400,
          true
        ),
        (
          stackspedia_id,
          'reddit',
          'https://reddit.com/r/stackspedia',
          'r/stackspedia',
          890,
          true
        ),
        (
          stackspedia_id,
          'mailing_list',
          'https://groups.google.com/g/stackspedia',
          'Stackspedia Mailing List',
          456,
          true
        )
        ON CONFLICT (id) DO NOTHING;

        -- Contributing info for Stackspedia
        INSERT INTO contributing_info (project_id, difficulty_level, setup_time_minutes, contributing_guide_url, code_of_conduct_url, good_first_issues_count, documentation_url, development_setup_guide, testing_guide, preferred_languages, requires_cla, has_mentorship, hacktoberfest_friendly) VALUES
        (
          stackspedia_id,
          'intermediate',
          15,
          'https://github.com/bigtower17/stackspedia/blob/main/CONTRIBUTING.md',
          'https://github.com/bigtower17/stackspedia/blob/main/CODE_OF_CONDUCT.md',
          12,
          'https://stackspedia.com/docs',
          'Clone the repository, run npm install, then npm run dev to start the development server.',
          'Run npm test to execute the test suite. We use Jest for unit tests and Cypress for e2e tests.',
          ARRAY['TypeScript', 'React', 'Next.js', 'PostgreSQL'],
          false,
          true,
          true
        )
        ON CONFLICT (project_id) DO UPDATE SET
          difficulty_level = EXCLUDED.difficulty_level,
          setup_time_minutes = EXCLUDED.setup_time_minutes,
          contributing_guide_url = EXCLUDED.contributing_guide_url,
          code_of_conduct_url = EXCLUDED.code_of_conduct_url,
          good_first_issues_count = EXCLUDED.good_first_issues_count,
          documentation_url = EXCLUDED.documentation_url,
          development_setup_guide = EXCLUDED.development_setup_guide,
          testing_guide = EXCLUDED.testing_guide,
          preferred_languages = EXCLUDED.preferred_languages,
          requires_cla = EXCLUDED.requires_cla,
          has_mentorship = EXCLUDED.has_mentorship,
          hacktoberfest_friendly = EXCLUDED.hacktoberfest_friendly,
          updated_at = now();

        -- Project health for Stackspedia
        INSERT INTO project_health (project_id, health_score, bus_factor, avg_time_to_close_issue_days, avg_time_to_merge_pr_days, activity_level, community_engagement_score, documentation_quality_score) VALUES
        (
          stackspedia_id,
          85,
          3,
          5,
          3,
          'high',
          78,
          90
        )
        ON CONFLICT (project_id) DO UPDATE SET
          health_score = EXCLUDED.health_score,
          bus_factor = EXCLUDED.bus_factor,
          avg_time_to_close_issue_days = EXCLUDED.avg_time_to_close_issue_days,
          avg_time_to_merge_pr_days = EXCLUDED.avg_time_to_merge_pr_days,
          activity_level = EXCLUDED.activity_level,
          community_engagement_score = EXCLUDED.community_engagement_score,
          documentation_quality_score = EXCLUDED.documentation_quality_score,
          last_calculated_at = now();

        -- Getting started guides for Stackspedia
        INSERT INTO getting_started_guides (project_id, title, content, order_index, estimated_time_minutes, prerequisites, is_published) VALUES
        (
          stackspedia_id,
          'Fork and Clone the Repository',
          'Start by forking the repository on GitHub, then clone it to your local machine using git clone. This will create a local copy of the project that you can work on.',
          1,
          5,
          ARRAY['Git', 'GitHub account'],
          true
        ),
        (
          stackspedia_id,
          'Install Dependencies',
          'Navigate to the project directory and run npm install to install all the required dependencies. Make sure you have Node.js 18 or higher installed.',
          2,
          3,
          ARRAY['Node.js 18+', 'npm'],
          true
        ),
        (
          stackspedia_id,
          'Set up Environment Variables',
          'Copy the .env.example file to .env.local and fill in the required environment variables. You''ll need Supabase credentials for the database connection.',
          3,
          5,
          ARRAY['Supabase account'],
          true
        ),
        (
          stackspedia_id,
          'Start the Development Server',
          'Run npm run dev to start the development server. The application will be available at http://localhost:3000. The server will automatically reload when you make changes.',
          4,
          2,
          ARRAY['Completed setup'],
          true
        ),
        (
          stackspedia_id,
          'Make Your First Contribution',
          'Look for issues labeled "good first issue" in the GitHub repository. Create a new branch, make your changes, and submit a pull request. Don''t forget to follow the contribution guidelines.',
          5,
          30,
          ARRAY['Development environment set up'],
          true
        )
        ON CONFLICT (id) DO NOTHING;

        -- Update metrics for Stackspedia
        INSERT INTO metrics (project_id, stars, forks, open_issues, contributors_count, last_commit_at, last_release_at, first_commit_at, language_stats) VALUES
        (
          stackspedia_id,
          142,
          28,
          12,
          23,
          '2024-12-15 10:30:00',
          '2024-12-01 14:20:00',
          '2024-01-15 09:00:00',
          '{"TypeScript": 65, "JavaScript": 20, "CSS": 10, "HTML": 5}'::jsonb
        )
        ON CONFLICT (project_id) DO UPDATE SET
          stars = EXCLUDED.stars,
          forks = EXCLUDED.forks,
          open_issues = EXCLUDED.open_issues,
          contributors_count = EXCLUDED.contributors_count,
          last_commit_at = EXCLUDED.last_commit_at,
          last_release_at = EXCLUDED.last_release_at,
          first_commit_at = EXCLUDED.first_commit_at,
          language_stats = EXCLUDED.language_stats,
          updated_at = now();
    END IF;
END $$;

-- Sample data for another project (React)
INSERT INTO projects (id, name, slug, description, logo_url, homepage_url, repo_url, license, status, tags, visibility, created_at) VALUES
(
  'b2c3d4e5-f6a7-8901-bcde-234567890123',
  'React',
  'react',
  'A JavaScript library for building user interfaces',
  'https://reactjs.org/logo.svg',
  'https://reactjs.org',
  'https://github.com/facebook/react',
  'MIT',
  'active',
  ARRAY['javascript', 'frontend', 'library', 'ui', 'facebook'],
  true,
  now()
) ON CONFLICT (slug) DO NOTHING;

-- Handle React project data
DO $$
DECLARE
    react_id UUID;
BEGIN
    -- Get the actual project ID for React
    SELECT id INTO react_id FROM projects WHERE slug = 'react';
    
    -- If we found the project, insert the related data
    IF react_id IS NOT NULL THEN
        -- Contributors for React
        INSERT INTO contributors (project_id, name, github_username, avatar_url, role, bio, is_active, joined_at, contributions_count) VALUES
        (
          react_id,
          'Dan Abramov',
          'gaearon',
          'https://github.com/gaearon.png',
          'maintainer',
          'React core team member and Redux creator',
          true,
          '2013-05-29',
          2500
        ),
        (
          react_id,
          'Sebastian Markbåge',
          'sebmarkbage',
          'https://github.com/sebmarkbage.png',
          'maintainer',
          'React core team member working on React internals',
          true,
          '2013-05-29',
          1800
        ),
        (
          react_id,
          'Brian Vaughn',
          'bvaughn',
          'https://github.com/bvaughn.png',
          'core_contributor',
          'React DevTools maintainer and performance expert',
          true,
          '2016-03-15',
          950
        )
        ON CONFLICT (id) DO NOTHING;

        -- Sponsors for React
        INSERT INTO sponsors (project_id, name, logo_url, website_url, type, tier, description, is_active, started_at) VALUES
        (
          react_id,
          'Meta',
          'https://about.meta.com/logo.png',
          'https://about.meta.com',
          'company',
          'diamond',
          'Primary sponsor and creator of React',
          true,
          '2013-05-29'
        ),
        (
          react_id,
          'Vercel',
          'https://vercel.com/logo.png',
          'https://vercel.com',
          'company',
          'gold',
          'Supporting React ecosystem development',
          true,
          '2020-01-01'
        )
        ON CONFLICT (id) DO NOTHING;

        -- Contributing info for React
        INSERT INTO contributing_info (project_id, difficulty_level, setup_time_minutes, contributing_guide_url, code_of_conduct_url, good_first_issues_count, documentation_url, preferred_languages, requires_cla, has_mentorship, hacktoberfest_friendly) VALUES
        (
          react_id,
          'advanced',
          30,
          'https://github.com/facebook/react/blob/main/CONTRIBUTING.md',
          'https://github.com/facebook/react/blob/main/CODE_OF_CONDUCT.md',
          8,
          'https://reactjs.org/docs',
          ARRAY['JavaScript', 'Flow', 'C++'],
          true,
          false,
          false
        )
        ON CONFLICT (project_id) DO NOTHING;

        -- Project health for React
        INSERT INTO project_health (project_id, health_score, bus_factor, avg_time_to_close_issue_days, avg_time_to_merge_pr_days, activity_level, community_engagement_score, documentation_quality_score) VALUES
        (
          react_id,
          95,
          8,
          12,
          7,
          'very_high',
          95,
          85
        )
        ON CONFLICT (project_id) DO NOTHING;

        -- Metrics for React
        INSERT INTO metrics (project_id, stars, forks, open_issues, contributors_count, last_commit_at, language_stats) VALUES
        (
          react_id,
          220000,
          45000,
          890,
          1500,
          '2024-12-15 16:45:00',
          '{"JavaScript": 70, "C++": 15, "Flow": 10, "Other": 5}'::jsonb
        )
        ON CONFLICT (project_id) DO NOTHING;
    END IF;
END $$; 