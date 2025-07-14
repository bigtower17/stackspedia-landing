-- Inserimento Stack Components di esempio
INSERT INTO stack_components (name, type, official_url, description, icon_url) VALUES
  -- Frontend
  ('React', 'frontend', 'https://reactjs.org', 'A JavaScript library for building user interfaces', NULL),
  ('Vue.js', 'frontend', 'https://vuejs.org', 'The Progressive JavaScript Framework', NULL),
  ('Angular', 'frontend', 'https://angular.io', 'Platform for building mobile and desktop web applications', NULL),
  ('Next.js', 'frontend', 'https://nextjs.org', 'The React Framework for Production', NULL),
  ('Nuxt.js', 'frontend', 'https://nuxtjs.org', 'The Vue.js Framework', NULL),
  ('Svelte', 'frontend', 'https://svelte.dev', 'Cybernetically enhanced web apps', NULL),
  ('TailwindCSS', 'frontend', 'https://tailwindcss.com', 'A utility-first CSS framework', NULL),
  ('Bootstrap', 'frontend', 'https://getbootstrap.com', 'The most popular HTML, CSS, and JS library', NULL),
  
  -- Backend
  ('Node.js', 'backend', 'https://nodejs.org', 'JavaScript runtime built on Chrome V8 engine', NULL),
  ('Express.js', 'backend', 'https://expressjs.com', 'Fast, unopinionated, minimalist web framework for Node.js', NULL),
  ('Django', 'backend', 'https://djangoproject.com', 'The web framework for perfectionists with deadlines', NULL),
  ('Flask', 'backend', 'https://flask.palletsprojects.com', 'A lightweight WSGI web application framework', NULL),
  ('FastAPI', 'backend', 'https://fastapi.tiangolo.com', 'Modern, fast web framework for building APIs with Python', NULL),
  ('Laravel', 'backend', 'https://laravel.com', 'The PHP Framework for Web Artisans', NULL),
  ('Spring Boot', 'backend', 'https://spring.io/projects/spring-boot', 'Create stand-alone, production-grade Spring applications', NULL),
  ('Ruby on Rails', 'backend', 'https://rubyonrails.org', 'A web-application framework that includes everything needed', NULL),
  ('ASP.NET Core', 'backend', 'https://docs.microsoft.com/en-us/aspnet/core/', 'Cross-platform, high-performance framework for building modern applications', NULL),
  ('Go Gin', 'backend', 'https://gin-gonic.com', 'A web framework written in Go', NULL),
  
  -- Database
  ('PostgreSQL', 'database', 'https://postgresql.org', 'The world''s most advanced open source relational database', NULL),
  ('MySQL', 'database', 'https://mysql.com', 'The world''s most popular open source database', NULL),
  ('MongoDB', 'database', 'https://mongodb.com', 'The most popular database for modern apps', NULL),
  ('Redis', 'database', 'https://redis.io', 'In-memory data structure store, used as a database, cache, and message broker', NULL),
  ('SQLite', 'database', 'https://sqlite.org', 'A C-language library that implements a small, fast, self-contained SQL database engine', NULL),
  ('Supabase', 'database', 'https://supabase.com', 'The open source Firebase alternative', NULL),
  ('Firebase', 'database', 'https://firebase.google.com', 'A platform developed by Google for creating mobile and web applications', NULL),
  ('Prisma', 'database', 'https://prisma.io', 'Next-generation Node.js and TypeScript ORM', NULL),
  
  -- CI/CD
  ('GitHub Actions', 'ci_cd', 'https://github.com/features/actions', 'Automate your workflow from idea to production', NULL),
  ('GitLab CI', 'ci_cd', 'https://docs.gitlab.com/ee/ci/', 'GitLab''s built-in continuous integration service', NULL),
  ('Jenkins', 'ci_cd', 'https://jenkins.io', 'An open source automation server', NULL),
  ('CircleCI', 'ci_cd', 'https://circleci.com', 'Continuous Integration and Delivery', NULL),
  ('Travis CI', 'ci_cd', 'https://travis-ci.org', 'Test and Deploy with Confidence', NULL),
  ('Azure DevOps', 'ci_cd', 'https://azure.microsoft.com/en-us/services/devops/', 'Developer services to support teams to plan work, collaborate on code development, and build and deploy applications', NULL),
  
  -- DevOps
  ('Docker', 'devops', 'https://docker.com', 'A platform designed to help developers build, share, and run modern applications', NULL),
  ('Kubernetes', 'devops', 'https://kubernetes.io', 'Production-Grade Container Orchestration', NULL),
  ('Terraform', 'devops', 'https://terraform.io', 'Infrastructure as Code', NULL),
  ('AWS', 'devops', 'https://aws.amazon.com', 'Amazon Web Services', NULL),
  ('Google Cloud', 'devops', 'https://cloud.google.com', 'Google Cloud Platform', NULL),
  ('Azure', 'devops', 'https://azure.microsoft.com', 'Microsoft Azure', NULL),
  ('Vercel', 'devops', 'https://vercel.com', 'The Frontend Cloud', NULL),
  ('Netlify', 'devops', 'https://netlify.com', 'All-in-one platform for automating modern web projects', NULL),
  
  -- Tooling
  ('Webpack', 'tooling', 'https://webpack.js.org', 'A static module bundler for modern JavaScript applications', NULL),
  ('Vite', 'tooling', 'https://vitejs.dev', 'Next generation frontend tooling', NULL),
  ('ESLint', 'tooling', 'https://eslint.org', 'Find and fix problems in your JavaScript code', NULL),
  ('Prettier', 'tooling', 'https://prettier.io', 'An opinionated code formatter', NULL),
  ('Jest', 'tooling', 'https://jestjs.io', 'A delightful JavaScript Testing Framework', NULL),
  ('Cypress', 'tooling', 'https://cypress.io', 'Fast, easy and reliable testing for anything that runs in a browser', NULL),
  ('Storybook', 'tooling', 'https://storybook.js.org', 'Tool for building UI components and pages in isolation', NULL),
  ('Figma', 'tooling', 'https://figma.com', 'A vector graphics editor and prototyping tool', NULL),
  
  -- Runtime
  ('Deno', 'runtime', 'https://deno.land', 'A secure runtime for JavaScript and TypeScript', NULL),
  ('Bun', 'runtime', 'https://bun.sh', 'A fast all-in-one JavaScript runtime', NULL),
  ('Python', 'runtime', 'https://python.org', 'A programming language that lets you work quickly', NULL),
  ('Java', 'runtime', 'https://java.com', 'A general-purpose programming language', NULL),
  ('Go', 'runtime', 'https://golang.org', 'An open source programming language', NULL),
  ('Rust', 'runtime', 'https://rust-lang.org', 'A language empowering everyone to build reliable and efficient software', NULL),
  ('PHP', 'runtime', 'https://php.net', 'A popular general-purpose scripting language', NULL)
ON CONFLICT (name) DO NOTHING;

-- Esempio di progetto
INSERT INTO projects (name, slug, description, logo_url, homepage_url, repo_url, license, status, tags, visibility) VALUES
  (
    'Stackspedia',
    'stackspedia',
    'The ultimate hub for Open Source projects. Discover, explore, and contribute to the best open source software.',
    'https://stackspedia.com/logo.png',
    'https://stackspedia.com',
    'https://github.com/bigtower17/stackspedia',
    'MIT',
    'active',
    ARRAY['open-source', 'platform', 'community', 'discovery'],
    true
  )
ON CONFLICT (slug) DO NOTHING; 