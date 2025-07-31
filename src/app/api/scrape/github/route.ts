import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface GitHubRepo {
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

interface GitHubContributor {
  login: string;
  avatar_url: string;
  contributions: number;
}

interface GitHubRelease {
  published_at: string;
  name: string;
  tag_name: string;
}

async function fetchGitHubData(repoUrl: string) {
  // Estrarre owner/repo da URL GitHub
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error('URL GitHub non valido');
  }
  
  const [, owner, repo] = match;
  const repoName = repo.replace(/\.git$/, ''); // Rimuovere .git se presente
  
  const baseUrl = `https://api.github.com/repos/${owner}/${repoName}`;
  
  // Headers per autenticazione (opzionale, ma aumenta i rate limits)
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'StackSpedia-Scraper'
  };
  
  // Aggiungere token se disponibile
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  
  try {
    // 1. Info base repository
    const repoResponse = await fetch(baseUrl, { headers });
    if (!repoResponse.ok) {
      throw new Error(`GitHub API error: ${repoResponse.status}`);
    }
    const repoData: GitHubRepo = await repoResponse.json();
    
    // 2. Linguaggi
    const languagesResponse = await fetch(`${baseUrl}/languages`, { headers });
    const languageStats = languagesResponse.ok ? await languagesResponse.json() : {};
    
    // 3. Contributors (primi 30)
    const contributorsResponse = await fetch(`${baseUrl}/contributors?per_page=30`, { headers });
    const contributors: GitHubContributor[] = contributorsResponse.ok ? await contributorsResponse.json() : [];
    
    // 4. Ultimo release
    const releasesResponse = await fetch(`${baseUrl}/releases?per_page=1`, { headers });
    const releases: GitHubRelease[] = releasesResponse.ok ? await releasesResponse.json() : [];
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
    console.error('Errore nel fetch GitHub:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Servizio non disponibile' },
        { status: 503 }
      );
    }

    const { project_id, repo_url } = await request.json();
    
    if (!project_id || !repo_url) {
      return NextResponse.json(
        { error: 'project_id e repo_url sono obbligatori' },
        { status: 400 }
      );
    }
    
    // Verificare che il progetto esista
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, repo_url')
      .eq('id', project_id)
      .single();
    
    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Progetto non trovato' },
        { status: 404 }
      );
    }
    
    // Fare scraping dei dati GitHub
    const githubData = await fetchGitHubData(repo_url);
    
    // Aggiornare o inserire le metriche
    const { data: metrics, error: metricsError } = await supabase
      .from('metrics')
      .upsert({
        project_id: project_id,
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
      console.error('Errore aggiornamento metriche:', metricsError);
      return NextResponse.json(
        { error: 'Errore aggiornamento metriche' },
        { status: 500 }
      );
    }
    
    // Opzionale: aggiornare anche i contributors
    if (githubData.contributors.length > 0) {
      // Prima eliminare i contributors esistenti da GitHub
      await supabase
        .from('contributors')
        .delete()
        .eq('project_id', project_id)
        .not('github_username', 'is', null);
      
      // Inserire i nuovi contributors da GitHub
      const contributorsData = githubData.contributors.map(contributor => ({
        project_id: project_id,
        name: contributor.github_username,
        github_username: contributor.github_username,
        avatar_url: contributor.avatar_url,
        role: 'contributor' as const,
        contributions_count: contributor.contributions_count,
        is_active: true
      }));
      
      const { error: contributorsError } = await supabase
        .from('contributors')
        .insert(contributorsData);
      
      if (contributorsError) {
        console.warn('Errore inserimento contributors:', contributorsError);
        // Non fallire se i contributors non vanno a buon fine
      }
    }
    
    return NextResponse.json({
      success: true,
      project: project.name,
      metrics: metrics,
      contributors_updated: githubData.contributors.length
    });
    
  } catch (error) {
    console.error('Errore API scraping GitHub:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    );
  }
}

// Endpoint per aggiornare tutti i progetti
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Servizio non disponibile' },
        { status: 503 }
      );
    }

    // Ottenere tutti i progetti con repo_url
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, repo_url')
      .not('repo_url', 'is', null)
      .eq('visibility', true);
    
    if (projectsError) {
      return NextResponse.json(
        { error: 'Errore recupero progetti' },
        { status: 500 }
      );
    }
    
    if (!projects || projects.length === 0) {
      return NextResponse.json({
        message: 'Nessun progetto con repo_url trovato',
        updated: 0
      });
    }
    
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];
    
    // Processare ogni progetto (con delay per evitare rate limiting)
    for (const project of projects) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 secondo di delay
        
        const githubData = await fetchGitHubData(project.repo_url);
        
        await supabase
          .from('metrics')
          .upsert({
            project_id: project.id,
            stars: githubData.stars,
            forks: githubData.forks,
            open_issues: githubData.open_issues,
            contributors_count: githubData.contributors_count,
            last_commit_at: githubData.last_commit_at,
            last_release_at: githubData.last_release_at,
            first_commit_at: githubData.first_commit_at,
            language_stats: githubData.language_stats,
            updated_at: new Date().toISOString()
          });
        
        successful++;
        
      } catch (error) {
        failed++;
        errors.push(`${project.name}: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
        console.error(`Errore aggiornamento ${project.name}:`, error);
      }
    }
    
    return NextResponse.json({
      message: 'Aggiornamento completato',
      total: projects.length,
      successful,
      failed,
      errors
    });
    
  } catch (error) {
    console.error('Errore API batch scraping:', error);
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    );
  }
}