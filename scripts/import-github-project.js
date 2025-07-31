#!/usr/bin/env node

// Script per importare progetti GitHub in StackSpedia
// Uso: node scripts/import-github-project.js [URL_GITHUB]

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

async function importProject(repoUrl, options = {}) {
  const {
    autoApprove = false,
    visibility = true,
    customTags = [],
    stackComponents = []
  } = options;
  
  console.log(`🚀 Importazione progetto: ${repoUrl}`);
  console.log(`   Approvazione automatica: ${autoApprove ? '✅' : '❌'}`);
  console.log(`   Visibilità pubblica: ${visibility ? '✅' : '❌'}`);
  
  try {
    const response = await fetch(`${SITE_URL}/api/admin/import/github`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repo_url: repoUrl,
        auto_approve: autoApprove,
        visibility: visibility,
        custom_tags: customTags,
        stack_components: stackComponents
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
      if (result.project_id) {
        console.log(`   ID Progetto: ${result.project_id}`);
        console.log(`   URL: ${SITE_URL}/projects/${result.project_id}`);
      }
    } else {
      console.log(`❌ Errore: ${result.error}`);
    }
    
    return result;
    
  } catch (error) {
    console.error(`❌ Errore di rete: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function importMultipleProjects(repoUrls, options = {}) {
  console.log(`🚀 Importazione multipla: ${repoUrls.length} progetti`);
  
  try {
    const response = await fetch(`${SITE_URL}/api/admin/import/github`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repo_urls: repoUrls,
        ...options
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
      console.log(`   Totale: ${result.stats.total}`);
      console.log(`   Successi: ${result.stats.successful}`);
      console.log(`   Fallimenti: ${result.stats.failed}`);
      
      if (result.results.successful.length > 0) {
        console.log('\n📝 Progetti importati con successo:');
        result.results.successful.forEach(item => {
          console.log(`   ✅ ${item.url} → ${item.project_id}`);
        });
      }
      
      if (result.results.failed.length > 0) {
        console.log('\n❌ Progetti falliti:');
        result.results.failed.forEach(item => {
          console.log(`   ❌ ${item.url}: ${item.error}`);
        });
      }
    } else {
      console.log(`❌ Errore: ${result.error}`);
    }
    
    return result;
    
  } catch (error) {
    console.error(`❌ Errore di rete: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function getSuggestedComponents(repoUrl) {
  console.log(`🔍 Suggerimenti stack components per: ${repoUrl}`);
  
  try {
    const response = await fetch(`${SITE_URL}/api/admin/import/github?repo_url=${encodeURIComponent(repoUrl)}`);
    const result = await response.json();
    
    if (result.success) {
      console.log(`   Componenti suggeriti: ${result.suggested_components.length}`);
      result.suggested_components.forEach(id => {
        console.log(`   - ${id}`);
      });
      return result.suggested_components;
    } else {
      console.log(`❌ Errore: ${result.error}`);
      return [];
    }
    
  } catch (error) {
    console.error(`❌ Errore di rete: ${error.message}`);
    return [];
  }
}

// Esempi di progetti interessanti da importare
const EXAMPLE_PROJECTS = [
  'https://github.com/LizardByte/Sunshine',
  'https://github.com/microsoft/vscode',
  'https://github.com/vercel/next.js',
  'https://github.com/facebook/react',
  'https://github.com/tailwindlabs/tailwindcss',
  'https://github.com/supabase/supabase',
  'https://github.com/vitejs/vite',
  'https://github.com/sveltejs/svelte'
];

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📖 Script di importazione progetti GitHub per StackSpedia\n');
    console.log('Uso:');
    console.log('  node scripts/import-github-project.js [URL_GITHUB]');
    console.log('  node scripts/import-github-project.js --examples');
    console.log('  node scripts/import-github-project.js --suggest [URL_GITHUB]');
    console.log('\nEsempi:');
    console.log('  node scripts/import-github-project.js https://github.com/LizardByte/Sunshine');
    console.log('  node scripts/import-github-project.js --examples');
    console.log('  node scripts/import-github-project.js --suggest https://github.com/LizardByte/Sunshine');
    return;
  }
  
  // Comando per suggerimenti
  if (args[0] === '--suggest' && args[1]) {
    await getSuggestedComponents(args[1]);
    return;
  }
  
  // Comando per progetti di esempio
  if (args[0] === '--examples') {
    console.log('🚀 Importazione progetti di esempio...\n');
    
    await importMultipleProjects(EXAMPLE_PROJECTS, {
      auto_approve: false,
      visibility: true,
      custom_tags: ['example', 'featured'],
      delay_ms: 3000
    });
    return;
  }
  
  // Importazione singola
  const repoUrl = args[0];
  
  if (!repoUrl.includes('github.com')) {
    console.log('❌ Fornire un URL GitHub valido');
    return;
  }
  
  // Ottenere suggerimenti per stack components
  console.log('🔍 Ottenimento suggerimenti...');
  const suggestions = await getSuggestedComponents(repoUrl);
  
  // Importare il progetto con auto-detection completa
  await importProject(repoUrl, {
    autoApprove: false,
    visibility: true,
    customTags: ['imported'],
    stackComponents: suggestions,
    autoDetectStack: true
  });
}

// Eseguire lo script se chiamato direttamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  importProject,
  importMultipleProjects,
  getSuggestedComponents
};