export interface GitHubRepoData {
  stars: number;
  forks: number;
  open_issues: number;
  contributors_count: number;
  last_commit_at: string;
  last_release_at: string | null;
  first_commit_at: string;
  language_stats: Record<string, number>;
  contributors: GitHubContributor[];
}

export interface GitHubContributor {
  github_username: string;
  avatar_url: string;
  contributions_count: number;
}

interface GitHubApiRepo {
  name: string;
  full_name: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  languages_url: string;
  contributors_url: string;
  pushed_at: string;
  created_at: string;
}

interface GitHubApiContributor {
  login: string;
  avatar_url: string;
  contributions: number;
}

interface GitHubApiRelease {
  published_at: string;
  name: string;
  tag_name: string;
}

export class GitHubScraper {
  private headers: HeadersInit;
  
  constructor() {
    this.headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'StackSpedia-Scraper'
    };
    
    // Aggiungere token se disponibile per aumentare i rate limits
    if (process.env.GITHUB_TOKEN) {
      this.headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
  }
  
  /**
   * Estrae owner e repo name da URL GitHub
   */
  private parseGitHubUrl(repoUrl: string): { owner: string; repo: string } {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('URL GitHub non valido');
    }
    
    const [, owner, repo] = match;
    const repoName = repo.replace(/\.git$/, ''); // Rimuovere .git se presente
    
    return { owner, repo: repoName };
  }
  
  /**
   * Fa una richiesta all'API GitHub con gestione errori
   */
  private async fetchFromGitHub<T>(url: string): Promise<T> {
    const response = await fetch(url, { headers: this.headers });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Repository non trovato');
      }
      if (response.status === 403) {
        throw new Error('Rate limit GitHub raggiunto');
      }
      if (response.status === 401) {
        throw new Error('Token GitHub non valido');
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    return response.json();
  }
  
  /**
   * Recupera tutti i dati di un repository GitHub
   */
  async scrapeRepository(repoUrl: string): Promise<GitHubRepoData> {
    const { owner, repo } = this.parseGitHubUrl(repoUrl);
    const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
    
    try {
      // 1. Info base repository
      const repoData = await this.fetchFromGitHub<GitHubApiRepo>(baseUrl);
      
      // 2. Linguaggi (parallel fetch)
      const languagesPromise = this.fetchFromGitHub<Record<string, number>>(`${baseUrl}/languages`)
        .catch(() => ({})); // Fallback vuoto se fallisce
      
      // 3. Contributors (primi 100, paginati)
      const contributorsPromise = this.fetchContributors(baseUrl);
      
      // 4. Ultimo release
      const releasesPromise = this.fetchFromGitHub<GitHubApiRelease[]>(`${baseUrl}/releases?per_page=1`)
        .catch(() => []); // Fallback vuoto se fallisce
      
      // Attendere tutte le richieste in parallelo
      const [languageStats, contributors, releases] = await Promise.all([
        languagesPromise,
        contributorsPromise,
        releasesPromise
      ]);
      
      const lastRelease = releases[0];
      
      return {
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        open_issues: repoData.open_issues_count,
        contributors_count: contributors.length,
        last_commit_at: repoData.pushed_at,
        last_release_at: lastRelease?.published_at || null,
        first_commit_at: repoData.created_at,
        language_stats: languageStats,
        contributors: contributors.map(c => ({
          github_username: c.login,
          avatar_url: c.avatar_url,
          contributions_count: c.contributions
        }))
      };
      
    } catch (error) {
      console.error(`Errore scraping repository ${owner}/${repo}:`, error);
      throw error;
    }
  }
  
  /**
   * Recupera i contributors con paginazione
   */
  private async fetchContributors(baseUrl: string): Promise<GitHubApiContributor[]> {
    const contributors: GitHubApiContributor[] = [];
    let page = 1;
    const perPage = 100;
    
    try {
      while (contributors.length < 500) { // Limite massimo per evitare troppi dati
        const pageContributors = await this.fetchFromGitHub<GitHubApiContributor[]>(
          `${baseUrl}/contributors?per_page=${perPage}&page=${page}`
        );
        
        if (pageContributors.length === 0) {
          break; // Non ci sono più contributors
        }
        
        contributors.push(...pageContributors);
        
        if (pageContributors.length < perPage) {
          break; // Ultima pagina
        }
        
        page++;
      }
    } catch (error) {
      console.warn('Errore nel recupero contributors:', error);
      // Restituire quello che abbiamo recuperato finora
    }
    
    return contributors;
  }
  
  /**
   * Verifica se un URL è di GitHub
   */
  static isGitHubUrl(url: string): boolean {
    return /github\.com\/[^\/]+\/[^\/]+/.test(url);
  }
  
  /**
   * Ottieni info sui rate limits
   */
  async getRateLimitInfo(): Promise<{ remaining: number; resetAt: Date }> {
    try {
      const response = await fetch('https://api.github.com/rate_limit', {
        headers: this.headers
      });
      
      const data = await response.json();
      
      return {
        remaining: data.rate.remaining,
        resetAt: new Date(data.rate.reset * 1000)
      };
    } catch (error) {
      console.error('Errore nel recupero rate limit:', error);
      return { remaining: 0, resetAt: new Date() };
    }
  }
}

// Funzione helper per uso rapido
export async function scrapeGitHubRepo(repoUrl: string): Promise<GitHubRepoData> {
  const scraper = new GitHubScraper();
  return scraper.scrapeRepository(repoUrl);
}

// Funzione per aggiornare batch di repositories con delay
export async function scrapeMultipleRepos(
  repoUrls: { id: string; repo_url: string; name: string }[],
  delayMs: number = 1000
): Promise<{ 
  successful: Array<{ id: string; data: GitHubRepoData }>; 
  failed: Array<{ id: string; name: string; error: string }>;
}> {
  const scraper = new GitHubScraper();
  const successful: Array<{ id: string; data: GitHubRepoData }> = [];
  const failed: Array<{ id: string; name: string; error: string }> = [];
  
  for (const repo of repoUrls) {
    try {
      // Delay tra le richieste per evitare rate limiting
      if (successful.length + failed.length > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      
      const data = await scraper.scrapeRepository(repo.repo_url);
      successful.push({ id: repo.id, data });
      
    } catch (error) {
      failed.push({
        id: repo.id,
        name: repo.name,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      });
    }
  }
  
  return { successful, failed };
}