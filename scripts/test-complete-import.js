#!/usr/bin/env node

// Script per testare l'importazione completa migliorata
const { importProject } = require('./import-github-project.js');

async function testCompleteImport() {
  console.log('🧪 Test Importazione Completa Migliorata\n');
  
  // Test con LizardByte/Sunshine per verificare tutti i miglioramenti
  const testRepos = [
    {
      url: 'https://github.com/LizardByte/Sunshine',
      expectedComponents: ['C++', 'CMake', 'Docker', 'Python'],
      expectedTags: ['gaming', 'streaming', 'moonlight', 'cpp']
    }
  ];
  
  for (const repo of testRepos) {
    console.log(`🎮 Test: ${repo.url}`);
    console.log(`   Stack attesi: ${repo.expectedComponents.join(', ')}`);
    console.log(`   Tags attesi: ${repo.expectedTags.join(', ')}`);
    
    try {
      // Prima elimina il progetto se esiste già (per test pulito)
      console.log('🗑️  Pulizia progetto esistente (se presente)...');
      
      // Importa con tutte le funzionalità attivate
      const result = await importProject(repo.url, {
        autoApprove: true, // Auto-approvato per test
        visibility: true,
        customTags: ['test-import', 'complete-test'],
        stackComponents: [], // Lascia vuoto per test auto-detection
        autoDetectStack: true
      });
      
      if (result.success) {
        console.log(`✅ Importazione riuscita!`);
        console.log(`   Progetto ID: ${result.project_id}`);
        console.log(`   Messaggio: ${result.message}`);
        
        // Test aggiuntivi per verificare completezza
        await testImportCompleteness(result.project_id);
        
      } else {
        console.log(`❌ Importazione fallita: ${result.error}`);
      }
      
    } catch (error) {
      console.log(`❌ Errore durante test: ${error.message}`);
    }
    
    console.log(''); // Riga vuota tra test
  }
  
  console.log('🎉 Test completati!');
}

async function testImportCompleteness(projectId) {
  console.log('🔍 Verifica completezza importazione...');
  
  try {
    // Verifica che il progetto abbia tutti i dati
    const response = await fetch(`http://localhost:3000/api/projects/${projectId}`);
    
    if (!response.ok) {
      console.log('⚠️  Impossibile verificare progetto via API');
      return;
    }
    
    const project = await response.json();
    
    // Check lista
    const checks = [
      { name: 'Nome progetto', value: project.name, expected: true },
      { name: 'Descrizione', value: project.description, expected: true },
      { name: 'Repository URL', value: project.repo_url, expected: true },
      { name: 'Homepage URL', value: project.homepage_url, expected: false }, // Opzionale
      { name: 'Logo URL', value: project.logo_url, expected: false }, // Opzionale ma nice to have
      { name: 'Licenza', value: project.license, expected: true },
      { name: 'Stack Components', value: project.stack_components?.length > 0, expected: true },
      { name: 'Tags', value: project.tags?.length > 0, expected: true },
      { name: 'Contributors', value: project.contributors?.length > 0, expected: true },
      { name: 'Metriche', value: project.metrics, expected: true },
    ];
    
    console.log('   📋 Checklist completezza:');
    let passed = 0;
    let failed = 0;
    
    for (const check of checks) {
      const hasValue = check.value && check.value !== '' && check.value !== null;
      const status = hasValue ? '✅' : (check.expected ? '❌' : '⚠️ ');
      
      console.log(`   ${status} ${check.name}: ${hasValue ? '✓' : 'mancante'}`);
      
      if (check.expected) {
        if (hasValue) passed++;
        else failed++;
      }
    }
    
    console.log(`   📊 Risultato: ${passed}/${passed + failed} checks obbligatori passati`);
    
    if (failed === 0) {
      console.log('   🎉 Importazione COMPLETA!');
    } else {
      console.log(`   ⚠️  Importazione parziale (${failed} elementi mancanti)`);
    }
    
    // Mostra dettagli utili
    if (project.stack_components?.length > 0) {
      console.log(`   🛠️  Stack: ${project.stack_components.map(c => c.name).join(', ')}`);
    }
    
    if (project.contributors?.length > 0) {
      console.log(`   👥 Contributors: ${project.contributors.length} trovati`);
    }
    
    if (project.metrics) {
      console.log(`   📊 Metriche: ⭐${project.metrics.stars} 🍴${project.metrics.forks} 👥${project.metrics.contributors_count}`);
    }
    
  } catch (error) {
    console.log(`❌ Errore verifica completezza: ${error.message}`);
  }
}

// Eseguire test se chiamato direttamente
if (require.main === module) {
  testCompleteImport().catch(console.error);
}

module.exports = { testCompleteImport };