#!/usr/bin/env node

const lighthouse = require('lighthouse/core/index.cjs');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// Конфигурация
const config = {
  port: 3000,
  url: 'http://localhost:3000',
  outputDir: './lighthouse-reports',
  budget: {
    performance: 85,
    accessibility: 90,
    'best-practices': 85,
    seo: 90,
    pwa: 80
  }
};

// Создаем директорию для отчетов
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

async function runLighthouse() {
  console.log('🚀 Запуск Lighthouse аудита...');
  
  // Запускаем Chrome
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
  });
  
  console.log(`🌐 Chrome запущен на порту ${chrome.port}`);
  
  try {
    // Настройки Lighthouse
    const options = {
      port: chrome.port,
      output: 'html',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
      formFactor: 'mobile',
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0
      }
    };

    // Запускаем аудит
    console.log(`📊 Аудит ${config.url}...`);
    const runnerResult = await lighthouse(config.url, options);
    
    // Генерируем имя файла с timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(config.outputDir, `lighthouse-report-${timestamp}.html`);
    
    // Сохраняем отчет
    fs.writeFileSync(reportPath, runnerResult.report);
    
    // Анализируем результаты
    const scores = runnerResult.lhr.categories;
    const results = {
      performance: Math.round((scores.performance?.score || 0) * 100),
      accessibility: Math.round((scores.accessibility?.score || 0) * 100),
      'best-practices': Math.round((scores['best-practices']?.score || 0) * 100),
      seo: Math.round((scores.seo?.score || 0) * 100),
      pwa: Math.round((scores.pwa?.score || 0) * 100)
    };
    
    console.log('\n📈 Результаты аудита:');
    console.log('='.repeat(50));
    Object.entries(results).forEach(([category, score]) => {
      const status = score >= config.budget[category] ? '✅' : '❌';
      console.log(`${status} ${category.toUpperCase()}: ${score}/100`);
    });
    
    // Проверяем бюджет
    console.log('\n🎯 Проверка бюджета:');
    console.log('='.repeat(50));
    let allPassed = true;
    Object.entries(results).forEach(([category, score]) => {
      const target = config.budget[category] || 0;
      const passed = score >= target;
      if (!passed) allPassed = false;
      console.log(`${passed ? '✅' : '❌'} ${category}: ${score} >= ${target}`);
    });
    
    console.log(`\n📄 Отчет сохранен: ${reportPath}`);
    console.log(`🌐 Откройте файл в браузере для детального просмотра`);
    
    if (!allPassed) {
      console.log('\n⚠️  Некоторые метрики не соответствуют бюджету!');
      process.exit(1);
    } else {
      console.log('\n✅ Все метрики соответствуют бюджету!');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при запуске Lighthouse:', error.message);
    process.exit(1);
  } finally {
    // Закрываем Chrome
    await chrome.kill();
    console.log('🔒 Chrome закрыт');
  }
}

// Запускаем если скрипт вызван напрямую
if (require.main === module) {
  runLighthouse().catch(console.error);
}

module.exports = { runLighthouse, config };
