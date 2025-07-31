import { supabase } from '@/lib/supabase';
import { GitHubScraper, scrapeMultipleRepos } from '@/lib/github-scraper';

export interface MetricsUpdateResult {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  errors: Array<{ project: string; error: string }>;
  rate_limit?: { remaining: number; resetAt: Date };
}

export class MetricsUpdater {
  private scraper: GitHubScraper;
  
  constructor() {
    this.scraper = new GitHubScraper();
  }
  
  /**
   * Aggiorna le metriche per tutti i progetti con repo GitHub
   */
  async updateAllProjectMetrics(options: {
    forceUpdate?: boolean; // Aggiorna anche se recente
    maxAge?: number; // Ore dopo cui aggiornare (default: 24)
    delayMs?: number; // Delay tra requests (default: 1000)
  } = {}): Promise<MetricsUpdateResult> {
    const {
      forceUpdate = false,
      maxAge = 24,
      delayMs = 1000
    } = options;
    
    if (!supabase) {
      throw new Error('Supabase non disponibile');
    }
    
    // Ottenere progetti che necessitano aggiornamento
    let query = supabase
      .from('projects')
      .select(`
        id,
        name,
        repo_url,
        metrics (updated_at)
      `)
      .not('repo_url', 'is', null)
      .eq('visibility', true)
      .like('repo_url', '%github.com%');
    
    const { data: projects, error: projectsError } = await query;
    
    if (projectsError) {
      throw new Error(`Errore recupero progetti: ${projectsError.message}`);
    }
    
    if (!projects || projects.length === 0) {
      return {
        total: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
        errors: []
      };
    }
    
    // Filtrare progetti che necessitano aggiornamento
    const now = new Date();
    const maxAgeMs = maxAge * 60 * 60 * 1000; // Convertire ore in ms
    
    const projectsToUpdate = forceUpdate ? projects : projects.filter(project => {
      const metrics = Array.isArray(project.metrics) ? project.metrics[0] : project.metrics;
      if (!metrics?.updated_at) {
        return true; // Mai aggiornato
      }
      
      const lastUpdate = new Date(metrics.updated_at);
      return (now.getTime() - lastUpdate.getTime()) > maxAgeMs;
    });
    
    console.log(`Aggiornamento metriche: ${projectsToUpdate.length}/${projects.length} progetti`);
    
    if (projectsToUpdate.length === 0) {
      return {
        total: projects.length,
        successful: 0,
        failed: 0,
        skipped: projects.length,
        errors: []
      };
    }
    
    // Preparare dati per scraping
    const reposToScrape = projectsToUpdate.map(p => ({
      id: p.id,
      repo_url: p.repo_url!,
      name: p.name
    }));
    
    // Fare scraping in batch
    const { successful, failed } = await scrapeMultipleRepos(reposToScrape, delayMs);
    
    // Aggiornare database con i risultati
    let dbUpdated = 0;
    const dbErrors: Array<{ project: string; error: string }> = [];
    
    for (const result of successful) {
      try {
        const { error: updateError } = await supabase
          .from('metrics')
          .upsert({
            project_id: result.id,
            stars: result.data.stars,
            forks: result.data.forks,
            open_issues: result.data.open_issues,
            contributors_count: result.data.contributors_count,
            last_commit_at: result.data.last_commit_at,
            last_release_at: result.data.last_release_at,
            first_commit_at: result.data.first_commit_at,
            language_stats: result.data.language_stats,
            updated_at: new Date().toISOString()
          });
        
        if (updateError) {
          const project = reposToScrape.find(p => p.id === result.id);
          dbErrors.push({
            project: project?.name || result.id,
            error: `Errore DB: ${updateError.message}`
          });
        } else {
          dbUpdated++;
          
          // Opzionale: aggiornare anche contributors
          await this.updateProjectContributors(result.id, result.data.contributors);
        }
        
      } catch (error) {
        const project = reposToScrape.find(p => p.id === result.id);
        dbErrors.push({
          project: project?.name || result.id,
          error: error instanceof Error ? error.message : 'Errore sconosciuto'
        });
      }
    }
    
    // Ottenere info sui rate limits
    const rateLimit = await this.scraper.getRateLimitInfo();
    
    return {
      total: projects.length,
      successful: dbUpdated,
      failed: failed.length + dbErrors.length,
      skipped: projects.length - projectsToUpdate.length,
      errors: [
        ...failed.map(f => ({ project: f.name, error: f.error })),
        ...dbErrors
      ],
      rate_limit: rateLimit
    };
  }
  
  /**
   * Aggiorna le metriche per un singolo progetto
   */
  async updateSingleProject(projectId: string): Promise<{
    success: boolean;
    error?: string;
    data?: any;
  }> {
    if (!supabase) {
      throw new Error('Supabase non disponibile');
    }
    
    // Ottenere il progetto
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, repo_url')
      .eq('id', projectId)
      .single();
    
    if (projectError || !project) {
      return { success: false, error: 'Progetto non trovato' };
    }
    
    if (!project.repo_url || !project.repo_url.includes('github.com')) {
      return { success: false, error: 'Progetto non ha URL GitHub valido' };
    }
    
    try {
      // Fare scraping
      const githubData = await this.scraper.scrapeRepository(project.repo_url);
      
      // Aggiornare database
      const { data: metrics, error: metricsError } = await supabase
        .from('metrics')
        .upsert({
          project_id: projectId,
          stars: githubData.stars,
          forks: githubData.forks,
          open_issues: githubData.open_issues,
          contributors_count: githubData.contributors_count,
          last_commit_at: githubData.last_commit_at,
          last_release_at: githubData.last_release_at,
          first_commit_at: githubData.first_commit_at,
          language_stats: githubData.language_stats,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (metricsError) {
        return { success: false, error: metricsError.message };
      }
      
      // Aggiornare contributors
      await this.updateProjectContributors(projectId, githubData.contributors);
      
      return { success: true, data: metrics };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      };
    }
  }
  
  /**
   * Aggiorna i contributors di un progetto
   */
  private async updateProjectContributors(
    projectId: string,
    contributors: Array<{
      github_username: string;
      avatar_url: string;
      contributions_count: number;
    }>
  ): Promise<void> {
    if (!supabase || contributors.length === 0) {
      return;
    }
    
    try {
      // Eliminare contributors esistenti da GitHub per questo progetto
      await supabase
        .from('contributors')
        .delete()
        .eq('project_id', projectId)
        .not('github_username', 'is', null);
      
      // Inserire nuovi contributors (massimo 50 per evitare troppi dati)
      const contributorsData = contributors.slice(0, 50).map(contributor => ({
        project_id: projectId,
        name: contributor.github_username,
        github_username: contributor.github_username,
        avatar_url: contributor.avatar_url,
        role: 'contributor' as const,
        contributions_count: contributor.contributions_count,
        is_active: true
      }));
      
      if (contributorsData.length > 0) {
        const { error } = await supabase
          .from('contributors')
          .insert(contributorsData);
        
        if (error) {
          console.warn(`Errore aggiornamento contributors per ${projectId}:`, error);
        }
      }
      
    } catch (error) {
      console.warn(`Errore aggiornamento contributors per ${projectId}:`, error);
    }
  }
  
  /**
   * Ottieni statistiche sui progetti che necessitano aggiornamento
   */
  async getUpdateStats(): Promise<{
    total_projects: number;
    with_github_repos: number;
    never_updated: number;
    outdated: number;
    recent: number;
  }> {
    if (!supabase) {
      throw new Error('Supabase non disponibile');
    }
    
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        repo_url,
        metrics (updated_at)
      `)
      .eq('visibility', true);
    
    if (error || !projects) {
      throw new Error(`Errore recupero progetti: ${error?.message}`);
    }
    
    const withGithubRepos = projects.filter(p => 
      p.repo_url && p.repo_url.includes('github.com')
    );
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    let neverUpdated = 0;
    let outdated = 0;
    let recent = 0;
    
    for (const project of withGithubRepos) {
      const metrics = Array.isArray(project.metrics) ? project.metrics[0] : project.metrics;
      
      if (!metrics?.updated_at) {
        neverUpdated++;
      } else {
        const lastUpdate = new Date(metrics.updated_at);
        if (lastUpdate < oneDayAgo) {
          outdated++;
        } else {
          recent++;
        }
      }
    }
    
    return {
      total_projects: projects.length,
      with_github_repos: withGithubRepos.length,
      never_updated: neverUpdated,
      outdated,
      recent
    };
  }
}

// Istanza singleton per uso globale
export const metricsUpdater = new MetricsUpdater();