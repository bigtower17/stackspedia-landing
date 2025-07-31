import { NextRequest, NextResponse } from 'next/server';
import { githubImporter } from '@/lib/github-project-importer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      repo_url,
      repo_urls,
      auto_approve = false,
      visibility = true,
      custom_tags = [],
      stack_components = [],
      auto_detect_stack = true,
      delay_ms = 2000
    } = body;
    
    // Validazione input
    if (!repo_url && (!repo_urls || !Array.isArray(repo_urls))) {
      return NextResponse.json({
        success: false,
        error: 'Fornire repo_url o repo_urls (array)'
      }, { status: 400 });
    }
    
    // Importazione singola
    if (repo_url) {
      console.log(`🚀 Importazione singola: ${repo_url}`);
      
      const result = await githubImporter.importProject(repo_url, {
        autoApprove: auto_approve,
        visibility,
        customTags: custom_tags,
        stackComponents: stack_components,
        autoDetectStack: auto_detect_stack
      });
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: result.message,
          project_id: result.project_id
        });
      } else {
        return NextResponse.json({
          success: false,
          error: result.message
        }, { status: 400 });
      }
    }
    
    // Importazione multipla
    if (repo_urls && Array.isArray(repo_urls)) {
      console.log(`🚀 Importazione multipla: ${repo_urls.length} repositories`);
      
      const results = await githubImporter.importMultipleProjects(repo_urls, {
        autoApprove: auto_approve,
        visibility,
        customTags: custom_tags,
        stackComponents: stack_components,
        autoDetectStack: auto_detect_stack,
        delayMs: delay_ms
      });
      
      return NextResponse.json({
        success: true,
        message: `Importazione completata: ${results.successful.length} successi, ${results.failed.length} fallimenti`,
        stats: {
          total: repo_urls.length,
          successful: results.successful.length,
          failed: results.failed.length
        },
        results: {
          successful: results.successful,
          failed: results.failed
        }
      });
    }
    
  } catch (error) {
    console.error('Errore API importazione GitHub:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore del server'
    }, { status: 500 });
  }
}

// Endpoint per suggerire stack components
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const repoUrl = searchParams.get('repo_url');
    
    if (!repoUrl) {
      return NextResponse.json({
        success: false,
        error: 'Parametro repo_url obbligatorio'
      }, { status: 400 });
    }
    
    const suggestions = await githubImporter.suggestStackComponents(repoUrl);
    
    return NextResponse.json({
      success: true,
      suggested_components: suggestions
    });
    
  } catch (error) {
    console.error('Errore suggerimenti stack components:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore del server'
    }, { status: 500 });
  }
}