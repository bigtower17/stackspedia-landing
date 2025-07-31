// Script di test per il sistema di scraping GitHub
const { GitHubScraper } = require('../src/lib/github-scraper.ts');

async function testGitHubScraping() {
  console.log('🧪 Test sistema scraping GitHub\n');
  
  const scraper = new GitHubScraper();
  
  // Test 1: Verifica rate limits
  console.log('1️⃣ Controllo rate limits GitHub...');
  try {
    const rateLimit = await scraper.getRateLimitInfo();
    console.log(`   ✅ Rate limit: ${rateLimit.remaining} requests rimanenti`);
    console.log(`   ⏰ Reset: ${rateLimit.resetAt.toLocaleString()}\n`);
  } catch (error) {
    console.log(`   ❌ Errore rate limit: ${error.message}\n`);
  }
  
  // Test 2: Scraping di un repository di test
  console.log('2️⃣ Test scraping repository...');
  const testRepos = [
    'https://github.com/vercel/next.js',
    'https://github.com/microsoft/vscode',
    'https://github.com/facebook/react'
  ];
  
  for (const repoUrl of testRepos) {
    try {
      console.log(`   📦 Scraping: ${repoUrl}`);
      const data = await scraper.scrapeRepository(repoUrl);
      
      console.log(`   ⭐ Stars: ${data.stars.toLocaleString()}`);
      console.log(`   🍴 Forks: ${data.forks.toLocaleString()}`);
      console.log(`   🐛 Issues: ${data.open_issues.toLocaleString()}`);
      console.log(`   👥 Contributors: ${data.contributors_count}`);
      console.log(`   📅 Ultimo commit: ${new Date(data.last_commit_at).toLocaleDateString()}`);
      console.log(`   🏷️  Ultimo release: ${data.last_release_at ? new Date(data.last_release_at).toLocaleDateString() : 'N/A'}`);
      console.log(`   💻 Linguaggi: ${Object.keys(data.language_stats).slice(0, 3).join(', ')}`);
      console.log(`   ✅ Successo!\n`);
      
      // Delay per evitare rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ Errore: ${error.message}\n`);
    }
  }
  
  // Test 3: Test URL non validi
  console.log('3️⃣ Test gestione errori...');
  const invalidUrls = [
    'https://github.com/invalid/nonexistent',
    'https://notgithub.com/test/repo',
    'invalid-url'
  ];
  
  for (const invalidUrl of invalidUrls) {
    try {
      console.log(`   🔍 Test URL non valido: ${invalidUrl}`);
      await scraper.scrapeRepository(invalidUrl);
      console.log(`   ❌ Doveva fallire ma non è successo!\n`);
    } catch (error) {
      console.log(`   ✅ Errore gestito correttamente: ${error.message}\n`);
    }
  }
  
  console.log('🎉 Test completati!');
}

// Esegui i test
if (require.main === module) {
  testGitHubScraping().catch(console.error);
}

module.exports = { testGitHubScraping };