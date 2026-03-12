#!/usr/bin/env node

/**
 * Script de test pour vérifier que l'API Gemini prend bien en compte le contexte de l'entreprise
 * Usage: node scripts/test-gemini-context.js
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    log('❌ Fichier .env non trouvé', 'red');
    return null;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        process.env[key] = value;
      }
    }
  }
  
  return process.env.GEMINI_API_KEY;
}

async function testContextAwareness() {
  log('\n🧪 Test de prise en compte du contexte entreprise par Gemini AI\n', 'bright');
  log('━'.repeat(80), 'cyan');
  
  // Charger la clé API
  const apiKey = loadEnvFile();
  
  if (!apiKey) {
    log('❌ Clé API Gemini non trouvée', 'red');
    process.exit(1);
  }
  
  log(`✅ Clé API chargée: ${apiKey.substring(0, 10)}...`, 'green');
  
  // Initialiser Gemini
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' });
  
  // Définir deux contextes d'entreprise très différents
  const contexts = [
    {
      name: 'Test 1: Startup Tech',
      profile: {
        name: 'TechStart',
        industry: 'SaaS B2B',
        size: 'startup',
        stage: 'early_stage',
        businessModel: 'Abonnement mensuel SaaS',
        marketPosition: 'Nouveau entrant sur un marché concurrentiel',
        targetMarket: 'PME françaises du secteur retail',
        currentGoals: ['Acquérir les 100 premiers clients', 'Lever une seed'],
        mainChallenges: ['Financement limité', 'Équipe réduite (3 personnes)', 'Concurrence établie']
      }
    },
    {
      name: 'Test 2: Grande Entreprise Industrielle',
      profile: {
        name: 'IndustryCorp',
        industry: 'Industrie manufacturière',
        size: 'enterprise',
        stage: 'mature',
        businessModel: 'Vente de machines industrielles et contrats de maintenance',
        marketPosition: 'Leader européen établi depuis 30 ans',
        targetMarket: 'Grandes entreprises industrielles internationales',
        currentGoals: ['Transformation digitale', 'Expansion en Asie', 'Réduction empreinte carbone'],
        mainChallenges: ['Résistance au changement', 'Legacy systems', 'Réglementations environnementales']
      }
    }
  ];
  
  // Ambition commune pour les deux contextes
  const ambition = {
    title: 'Augmenter le chiffre d\'affaires de 50%',
    description: 'Croître significativement nos revenus sur les 12 prochains mois',
    category: 'revenue'
  };
  
  log('\n📊 Ambition testée (identique pour les deux contextes):', 'blue');
  log(`   Titre: "${ambition.title}"`, 'cyan');
  log(`   Description: "${ambition.description}"`, 'cyan');
  
  // Tester avec chaque contexte
  for (const context of contexts) {
    log(`\n${'═'.repeat(80)}`, 'magenta');
    log(`\n${context.name}`, 'bright');
    log('─'.repeat(80), 'cyan');
    
    log('\n📋 Profil d\'entreprise:', 'blue');
    log(`   • Nom: ${context.profile.name}`, 'cyan');
    log(`   • Secteur: ${context.profile.industry}`, 'cyan');
    log(`   • Taille: ${context.profile.size}`, 'cyan');
    log(`   • Stade: ${context.profile.stage}`, 'cyan');
    log(`   • Modèle: ${context.profile.businessModel}`, 'cyan');
    log(`   • Position: ${context.profile.marketPosition}`, 'cyan');
    log(`   • Marché cible: ${context.profile.targetMarket}`, 'cyan');
    log(`   • Objectifs: ${context.profile.currentGoals.join(', ')}`, 'cyan');
    log(`   • Défis: ${context.profile.mainChallenges.join(', ')}`, 'cyan');
    
    // Construire le prompt avec le contexte
    const prompt = `En tant qu'expert en stratégie d'entreprise et coach en OKR, analysez cette ambition et donnez 3-5 conseils concrets pour l'améliorer :

Ambition : "${ambition.title}"
Description : "${ambition.description}"
Catégorie : ${ambition.category}

CONTEXTE ENTREPRISE (IMPORTANT - Tenez compte de ces informations pour personnaliser vos conseils) :
- Nom de l'entreprise : ${context.profile.name}
- Secteur d'activité : ${context.profile.industry}
- Taille de l'entreprise : ${context.profile.size}
- Stade de développement : ${context.profile.stage}
- Modèle économique : ${context.profile.businessModel}
- Position sur le marché : ${context.profile.marketPosition}
- Marché cible : ${context.profile.targetMarket}
- Objectifs actuels : ${context.profile.currentGoals.join(', ')}
- Défis principaux : ${context.profile.mainChallenges.join(', ')}

Donnez vos conseils sous forme de liste numérotée, en étant spécifique et actionnable. 
IMPORTANT : Adaptez vos conseils au contexte spécifique de cette entreprise (secteur, taille, stade, défis).
Concentrez-vous sur :
1. La clarté et la mesurabilité de l'ambition
2. L'alignement avec le contexte business et les objectifs de l'entreprise
3. La faisabilité compte tenu du stade et de la taille de l'entreprise
4. Les métriques de succès adaptées au secteur
5. Les étapes clés pour l'atteindre en tenant compte des défis identifiés`;
    
    log('\n⏳ Envoi de la requête à Gemini...', 'yellow');
    
    try {
      const startTime = Date.now();
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const duration = Date.now() - startTime;
      
      log(`✅ Réponse reçue en ${duration}ms`, 'green');
      log('\n📝 Conseils de Gemini:', 'bright');
      log('━'.repeat(80), 'cyan');
      log(text, 'reset');
      log('━'.repeat(80), 'cyan');
      
      // Analyser si le contexte est pris en compte
      log('\n🔍 Analyse de la prise en compte du contexte:', 'blue');
      
      const contextKeywords = {
        startup: ['startup', 'seed', 'financement', 'équipe réduite', 'premiers clients', 'mvp', 'product-market fit'],
        enterprise: ['transformation', 'legacy', 'international', 'asie', 'carbone', 'réglementation', 'changement'],
        industry: ['industrie', 'manufacturière', 'machines', 'maintenance'],
        saas: ['saas', 'abonnement', 'b2b', 'pme', 'retail']
      };
      
      const lowerText = text.toLowerCase();
      let contextScore = 0;
      let foundKeywords = [];
      
      if (context.name.includes('Startup')) {
        contextKeywords.startup.forEach(keyword => {
          if (lowerText.includes(keyword)) {
            contextScore++;
            foundKeywords.push(keyword);
          }
        });
        contextKeywords.saas.forEach(keyword => {
          if (lowerText.includes(keyword)) {
            contextScore++;
            foundKeywords.push(keyword);
          }
        });
      } else {
        contextKeywords.enterprise.forEach(keyword => {
          if (lowerText.includes(keyword)) {
            contextScore++;
            foundKeywords.push(keyword);
          }
        });
        contextKeywords.industry.forEach(keyword => {
          if (lowerText.includes(keyword)) {
            contextScore++;
            foundKeywords.push(keyword);
          }
        });
      }
      
      if (contextScore > 0) {
        log(`   ✅ Contexte pris en compte (score: ${contextScore})`, 'green');
        log(`   📌 Mots-clés contextuels trouvés: ${foundKeywords.join(', ')}`, 'cyan');
      } else {
        log(`   ⚠️  Peu de références au contexte spécifique`, 'yellow');
      }
      
    } catch (error) {
      log(`❌ Erreur: ${error.message}`, 'red');
    }
    
    // Pause entre les tests
    if (context !== contexts[contexts.length - 1]) {
      log('\n⏸️  Pause de 2 secondes avant le prochain test...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  log('\n' + '═'.repeat(80), 'magenta');
  log('\n✅ Tests terminés!', 'green');
  log('\n💡 Conclusion:', 'bright');
  log('   Comparez les deux réponses ci-dessus.', 'cyan');
  log('   Si Gemini prend bien en compte le contexte, les conseils devraient être:', 'cyan');
  log('   • Pour la startup: Focus sur acquisition, MVP, financement, croissance rapide', 'cyan');
  log('   • Pour l\'entreprise: Focus sur transformation, international, processus, scale', 'cyan');
  log('\n' + '━'.repeat(80), 'cyan');
}

// Exécution
testContextAwareness().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

