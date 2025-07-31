import { supabase } from '@/lib/supabase';
import { GitHubScraper } from '@/lib/github-scraper';
import { ProjectFormData } from '@/lib/types';

export interface GitHubProjectInfo {
  name: string;
  full_name: string;
  description: string;
  homepage: string | null;
  html_url: string;
  clone_url: string;
  language: string;
  license: {
    key: string;
    name: string;
    spdx_id: string;
  } | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface ImportResult {
  success: boolean;
  project_id?: string;
  message: string;
  errors?: string[];
}

export class GitHubProjectImporter {
  private scraper: GitHubScraper;
  
  constructor() {
    this.scraper = new GitHubScraper();
  }
  
  /**
   * Importa un progetto GitHub automaticamente
   */
  async importProject(repoUrl: string, options: {
    autoApprove?: boolean; // Se true, imposta is_confirmed=true
    visibility?: boolean;  // Visibilità del progetto (default: true)
    customTags?: string[]; // Tag personalizzati da aggiungere
    stackComponents?: string[]; // ID componenti stack da associare
    autoDetectStack?: boolean; // Se true, rileva automaticamente stack components
  } = {}): Promise<ImportResult> {
    const {
      autoApprove = false,
      visibility = true,
      customTags = [],
      stackComponents = [],
      autoDetectStack = true
    } = options;
    
    try {
      // 1. Ottenere info base del repository
      console.log('🔍 Recupero informazioni repository...');
      const repoInfo = await this.fetchRepositoryInfo(repoUrl);
      
      // 2. Fare scraping delle metriche
      console.log('📊 Scraping metriche GitHub...');
      const githubData = await this.scraper.scrapeRepository(repoUrl);
      
      // 3. Rilevare automaticamente stack components se richiesto
      let finalStackComponents = [...stackComponents];
      if (autoDetectStack) {
        console.log('🔍 Rilevamento automatico stack components...');
        const autoDetected = await this.suggestStackComponents(repoUrl);
        finalStackComponents = [...new Set([...finalStackComponents, ...autoDetected])];
        console.log(`   Rilevati ${autoDetected.length} componenti automaticamente`);
      }
      
      // 4. Preparare i dati del progetto
      const { projectData, stackComponentIds } = await this.prepareProjectData(repoInfo, githubData, {
        visibility,
        customTags,
        stackComponents: finalStackComponents
      });
      
      // 5. Controllare se il progetto esiste già
      const { data: existingProject } = await supabase
        .from('projects')
        .select('id, name, slug')
        .eq('repo_url', repoUrl)
        .single();
      
      if (existingProject) {
        return {
          success: false,
          message: `Progetto "${existingProject.name}" già esistente con questo repository`,
        };
      }
      
      // 6. Controllare slug duplicato
      const { data: slugExists } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', projectData.slug)
        .single();
      
      if (slugExists) {
        // Aggiungere un suffisso per evitare duplicati
        projectData.slug = `${projectData.slug}-${Date.now()}`;
      }
      
      // 7. Inserire il progetto nel database
      console.log('💾 Inserimento progetto nel database...');
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert([{
          ...projectData,
          is_confirmed: autoApprove,
          featured: false,
          submitter_id: null // Importazione automatica
        }])
        .select()
        .single();
      
      if (projectError) {
        throw new Error(`Errore inserimento progetto: ${projectError.message}`);
      }
      
      // 8. Inserire le relazioni stack components
      if (stackComponentIds.length > 0) {
        const stackRelations = stackComponentIds.map(componentId => ({
          project_id: newProject.id,
          stack_component_id: componentId,
        }));
        
        const { error: stackError } = await supabase
          .from('project_stack')
          .insert(stackRelations);
        
        if (stackError) {
          console.warn('Errore inserimento stack components:', stackError);
        }
      }
      
      // 9. Inserire le metriche
      const { error: metricsError } = await supabase
        .from('metrics')
        .insert([{
          project_id: newProject.id,
          stars: githubData.stars,
          forks: githubData.forks,
          open_issues: githubData.open_issues,
          contributors_count: githubData.contributors_count,
          last_commit_at: githubData.last_commit_at,
          last_release_at: githubData.last_release_at,
          first_commit_at: githubData.first_commit_at,
          language_stats: githubData.language_stats,
        }]);
      
      if (metricsError) {
        console.warn('Errore inserimento metriche:', metricsError);
      }
      
      // 10. Inserire i contributors (primi 20)
      console.log(`👥 Contributors trovati: ${githubData.contributors.length}`);
      if (githubData.contributors.length > 0) {
        const contributorsData = githubData.contributors.slice(0, 20).map(contributor => ({
          project_id: newProject.id,
          name: contributor.github_username,
          github_username: contributor.github_username,
          avatar_url: contributor.avatar_url,
          role: 'contributor' as const,
          contributions_count: contributor.contributions_count,
          is_active: true
        }));
        
        console.log(`   Inserimento ${contributorsData.length} contributors...`);
        const { error: contributorsError } = await supabase
          .from('contributors')
          .insert(contributorsData);
        
        if (contributorsError) {
          console.error('❌ Errore inserimento contributors:', contributorsError);
        } else {
          console.log(`✅ Contributors inseriti con successo`);
        }
      } else {
        console.log('⚠️  Nessun contributor trovato nel scraping');
      }
      
      return {
        success: true,
        project_id: newProject.id,
        message: `Progetto "${repoInfo.name}" importato con successo! ${autoApprove ? 'Approvato automaticamente.' : 'In attesa di approvazione.'}`
      };
      
    } catch (error) {
      console.error('Errore importazione progetto:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Errore sconosciuto durante l\'importazione'
      };
    }
  }
  
  /**
   * Recupera informazioni base del repository da GitHub API
   */
  private async fetchRepositoryInfo(repoUrl: string): Promise<GitHubProjectInfo> {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('URL GitHub non valido');
    }
    
    const [, owner, repo] = match;
    const repoName = repo.replace(/\.git$/, '');
    
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'StackSpedia-Importer'
    };
    
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    
    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
      headers
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Repository non trovato o privato');
      }
      if (response.status === 403) {
        throw new Error('Rate limit GitHub raggiunto');
      }
      throw new Error(`Errore GitHub API: ${response.status}`);
    }
    
    return response.json();
  }
  
  /**
   * Prepara i dati del progetto per l'inserimento nel database
   */
  private async prepareProjectData(
    repoInfo: GitHubProjectInfo,
    githubData: any,
    options: {
      visibility: boolean;
      customTags: string[];
      stackComponents: string[];
    }
  ): Promise<{
    projectData: Omit<ProjectFormData, 'stack_components'> & { is_confirmed?: boolean };
    stackComponentIds: string[];
  }> {
    // Generare slug dal nome
    const slug = repoInfo.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Combinare tags GitHub Topics con tag personalizzati
    const allTags = [
      ...repoInfo.topics,
      ...options.customTags
    ].filter((tag, index, arr) => arr.indexOf(tag) === index); // Rimuovere duplicati
    
    // Determinare il linguaggio principale
    const primaryLanguage = repoInfo.language || 'Unknown';
    if (primaryLanguage !== 'Unknown' && !allTags.includes(primaryLanguage.toLowerCase())) {
      allTags.push(primaryLanguage.toLowerCase());
    }
    
    // Tentativo di rilevare logo automaticamente
    const logoUrl = await this.detectLogo(repoInfo);
    
    const projectData = {
      name: repoInfo.name,
      slug: slug,
      description: repoInfo.description || `Open source project: ${repoInfo.name}`,
      logo_url: logoUrl,
      homepage_url: repoInfo.homepage || '',
      repo_url: repoInfo.html_url,
      license: repoInfo.license?.name || repoInfo.license?.spdx_id || '',
      status: 'active' as const,
      tags: allTags,
      visibility: options.visibility,
    };
    
    return {
      projectData,
      stackComponentIds: options.stackComponents
    };
  }
  
  /**
   * Importa più progetti in batch
   */
  async importMultipleProjects(
    repoUrls: string[],
    options: {
      autoApprove?: boolean;
      visibility?: boolean;
      delayMs?: number;
      customTags?: string[];
      stackComponents?: string[];
      autoDetectStack?: boolean;
    } = {}
  ): Promise<{
    successful: Array<{ url: string; project_id: string; message: string }>;
    failed: Array<{ url: string; error: string }>;
  }> {
    const { delayMs = 2000, ...importOptions } = options;
    
    const successful: Array<{ url: string; project_id: string; message: string }> = [];
    const failed: Array<{ url: string; error: string }> = [];
    
    for (const repoUrl of repoUrls) {
      try {
        // Delay tra le importazioni per evitare rate limiting
        if (successful.length + failed.length > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        
        console.log(`📥 Importazione: ${repoUrl}`);
        
        const result = await this.importProject(repoUrl, importOptions);
        
        if (result.success) {
          successful.push({
            url: repoUrl,
            project_id: result.project_id!,
            message: result.message
          });
          console.log(`✅ Successo: ${repoUrl}`);
        } else {
          failed.push({
            url: repoUrl,
            error: result.message
          });
          console.log(`❌ Fallito: ${repoUrl} - ${result.message}`);
        }
        
      } catch (error) {
        failed.push({
          url: repoUrl,
          error: error instanceof Error ? error.message : 'Errore sconosciuto'
        });
        console.log(`❌ Errore: ${repoUrl} - ${error}`);
      }
    }
    
    return { successful, failed };
  }
  
  /**
   * Rileva automaticamente il logo del progetto
   */
  private async detectLogo(repoInfo: GitHubProjectInfo): Promise<string> {
    try {
      const [owner, repo] = repoInfo.full_name.split('/');
      
      // Lista di possibili percorsi per i logo
      const logoPaths = [
        'logo.png',
        'logo.svg', 
        'logo.jpg',
        'logo.jpeg',
        'assets/logo.png',
        'assets/logo.svg',
        'docs/logo.png',
        'docs/logo.svg',
        'docs/images/logo.png',
        'docs/images/logo.svg',
        'images/logo.png',
        'images/logo.svg',
        'src/assets/logo.png',
        'src/assets/logo.svg',
        'public/logo.png',
        'public/logo.svg',
        'static/logo.png',
        'static/logo.svg',
        `.github/logo.png`,
        `.github/logo.svg`,
        'icon.png',
        'icon.svg',
        'favicon.png',
        'favicon.svg'
      ];
    
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'User-Agent': 'StackSpedia-Importer'
    };
    
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    
    // Prova ogni possibile percorso
    for (const path of logoPaths) {
      try {
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
        const response = await fetch(url, { headers });
        
        if (response.ok) {
          // Logo trovato, restituisci il raw URL
          return `https://raw.githubusercontent.com/${owner}/${repo}/master/${path}`;
        }
      } catch (error) {
        // Continua con il prossimo percorso
        continue;
      }
    }
    
    // Prova anche con branch "main" invece di "master"
    for (const path of logoPaths.slice(0, 10)) { // Solo i più comuni per "main"
      try {
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
        const response = await fetch(url, { headers });
        
        if (response.ok) {
          return `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
        }
      } catch (error) {
        continue;
      }
    }
    
      console.log(`   🔍 Logo non trovato per ${repoInfo.full_name}`);
      return '';
      
    } catch (error) {
      console.warn(`❌ Errore rilevamento logo per ${repoInfo.full_name}:`, error);
      return '';
    }
  }
  
  /**
   * Suggerisce stack components basati sui linguaggi e topics del repository
   */
  async suggestStackComponents(repoUrl: string): Promise<string[]> {
    try {
      const repoInfo = await this.fetchRepositoryInfo(repoUrl);
      const githubData = await this.scraper.scrapeRepository(repoUrl);
      
      // Ottenere tutti i componenti stack disponibili
      const { data: stackComponents } = await supabase
        .from('stack_components')
        .select('id, name, type');
      
      if (!stackComponents) {
        return [];
      }
      
      const suggestions: string[] = [];
      
      // Linguaggi dal repository (con percentuali)
      const languages = Object.keys(githubData.language_stats || {});
      const primaryLanguage = repoInfo.language;
      
      // Topics dal repository
      const topics = repoInfo.topics || [];
      
      // Keywords dal nome e descrizione
      const nameWords = repoInfo.name.toLowerCase().split(/[-_]/);
      const descWords = (repoInfo.description || '').toLowerCase().split(/\s+/);
      
      // Mapping intelligente per stack components comuni
      const intelligentMappings = {
        // Linguaggi di programmazione
        'c++': ['C++', 'CMake'],
        'cpp': ['C++', 'CMake'], 
        'python': ['Python'],
        'javascript': ['JavaScript', 'Node.js'],
        'typescript': ['TypeScript', 'Node.js'],
        'java': ['Java'],
        'rust': ['Rust'],
        'go': ['Go'],
        'php': ['PHP'],
        'ruby': ['Ruby', 'Ruby on Rails'],
        'swift': ['Swift'],
        'kotlin': ['Kotlin'],
        'dart': ['Dart', 'Flutter'],
        'c#': ['ASP.NET Core'],
        'shell': ['Bash'],
        
        // Frameworks e librerie
        'react': ['React', 'JavaScript', 'Node.js'],
        'vue': ['Vue.js', 'JavaScript', 'Node.js'],
        'angular': ['Angular', 'TypeScript', 'Node.js'],
        'svelte': ['Svelte', 'JavaScript'],
        'next': ['Next.js', 'React', 'JavaScript'],
        'nuxt': ['Vue.js', 'JavaScript'],
        'django': ['Django', 'Python'],
        'flask': ['Flask', 'Python'],
        'fastapi': ['FastAPI', 'Python'],
        'spring': ['Spring Boot', 'Java'],
        'rails': ['Ruby on Rails', 'Ruby'],
        'laravel': ['PHP'],
        'express': ['Express', 'Node.js', 'JavaScript'],
        
        // Database
        'postgresql': ['PostgreSQL'],
        'postgres': ['PostgreSQL'],
        'mysql': ['MySQL'],
        'mongodb': ['MongoDB'],
        'redis': ['Redis'],
        'sqlite': ['SQLite'],
        'supabase': ['Supabase', 'PostgreSQL'],
        
        // DevOps e Tools
        'docker': ['Docker'],
        'kubernetes': ['Kubernetes', 'Docker'],
        'k8s': ['Kubernetes', 'Docker'],
        'aws': ['AWS'],
        'azure': ['Azure'],
        'gcp': ['Google Cloud'],
        'vercel': ['Vercel'],
        'netlify': ['Netlify'],
        'heroku': ['Heroku'],
        
        // CI/CD
        'github-actions': ['GitHub Actions'],
        'gitlab-ci': ['GitLab CI'],
        'jenkins': ['Jenkins'],
        'circleci': ['CircleCI'],
        
        // Build Tools
        'webpack': ['Webpack'],
        'vite': ['Vite'],
        'rollup': ['JavaScript'],
        'parcel': ['JavaScript'],
        'cmake': ['CMake', 'C++'],
        'make': ['C++'],
        'gradle': ['Java'],
        'maven': ['Java'],
        'npm': ['Node.js', 'JavaScript'],
        'yarn': ['Node.js', 'JavaScript'],
        'pip': ['Python'],
        'cargo': ['Rust'],
        
        // Testing
        'jest': ['Jest', 'JavaScript'],
        'cypress': ['Cypress', 'JavaScript'],
        'selenium': ['JavaScript', 'Python', 'Java'],
        'pytest': ['Python'],
        'junit': ['Java'],
        
        // CSS/Styling
        'tailwind': ['Tailwind CSS'],
        'bootstrap': ['JavaScript'],
        'sass': ['Sass'],
        'scss': ['Sass'],
        'less': ['JavaScript'],
        
        // Specifici per gaming/streaming
        'game': ['C++'],
        'gaming': ['C++'],
        'stream': ['C++'],
        'streaming': ['C++'],
        'moonlight': ['C++'],
        'gamestream': ['C++'],
        'rtmp': ['C++'],
        'ffmpeg': ['C++'],
        'opencv': ['C++', 'Python'],
        'opengl': ['C++'],
        'vulkan': ['C++'],
        'directx': ['C++'],
        
        // Mobile
        'android': ['Java', 'Kotlin'],
        'ios': ['Swift'],
        'flutter': ['Flutter', 'Dart'],
        'react-native': ['React', 'JavaScript'],
        'xamarin': ['ASP.NET Core'],
        
        // Desktop
        'electron': ['JavaScript', 'Node.js'],
        'tauri': ['Rust', 'JavaScript'],
        'qt': ['C++'],
        'gtk': ['C++'],
        'winui': ['ASP.NET Core'],
        'wpf': ['ASP.NET Core'],
        
        // Web servers
        'nginx': ['Docker'],
        'apache': ['Docker'],
        'caddy': ['Docker'],
        
        // Package managers
        'homebrew': ['macOS'],
        'chocolatey': ['Windows'],
        'apt': ['Linux'],
        'yum': ['Linux'],
        'pacman': ['Linux'],
        'flatpak': ['Linux'],
        'snap': ['Linux'],
        'winget': ['Windows'],
      };
      
      // Combinare tutte le sources di informazione
      const allSources = [
        ...languages.map(l => l.toLowerCase()),
        primaryLanguage?.toLowerCase() || '',
        ...topics.map(t => t.toLowerCase()),
        ...nameWords,
        ...descWords.slice(0, 10) // Solo prime 10 parole della descrizione
      ].filter(Boolean);
      
      // Trovare matches usando mapping intelligente
      const matchedComponents = new Set<string>();
      
      for (const source of allSources) {
        // Check mapping intelligente
        if (intelligentMappings[source]) {
          for (const mappedName of intelligentMappings[source]) {
            const component = stackComponents.find(c => 
              c.name.toLowerCase() === mappedName.toLowerCase()
            );
            if (component) {
              matchedComponents.add(component.id);
            }
          }
        }
        
        // Check match diretto
        const directMatch = stackComponents.find(c => 
          c.name.toLowerCase() === source ||
          c.name.toLowerCase().includes(source) ||
          source.includes(c.name.toLowerCase())
        );
        if (directMatch) {
          matchedComponents.add(directMatch.id);
        }
      }
      
      console.log(`   Sources analizzate: ${allSources.slice(0, 10).join(', ')}...`);
      console.log(`   Stack components trovati: ${matchedComponents.size}`);
      
      return Array.from(matchedComponents);
      
    } catch (error) {
      console.warn('Errore nel suggerire stack components:', error);
      return [];
    }
  }
}

// Istanza singleton
export const githubImporter = new GitHubProjectImporter();

// Funzione helper per uso rapido
export async function importGitHubProject(
  repoUrl: string,
  options?: {
    autoApprove?: boolean;
    visibility?: boolean;
    customTags?: string[];
    stackComponents?: string[];
  }
): Promise<ImportResult> {
  return githubImporter.importProject(repoUrl, options);
}