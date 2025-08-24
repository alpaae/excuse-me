#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const { writeFileSync, mkdirSync } = require('fs');
const { join } = require('path');
const chromeLauncher = require('chrome-launcher');
const lighthouse = require('lighthouse');

const PORT = 3000;
const URL = `http://localhost:${PORT}`;
const OUTPUT_DIR = join(process.cwd(), 'lighthouse-reports');

// Создаем директорию для отчетов
try {
  mkdirSync(OUTPUT_DIR, { recursive: true });
} catch (error) {
  // Директория уже существует
}

// Конфигурация Lighthouse
const lighthouseConfig = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'pwa', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'mobile',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0
    },
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      disabled: false
    },
    emulatedUserAgent: 'Mozilla/5.0 (Linux; Android 10; Pixel 3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
  }
};

// Бюджет производительности
const budget = {
  performance: 85,
  pwa: {
    installable: true
  },
  accessibility: 90,
  'best-practices': 85,
  seo: 90
};

async function startServer() {
  console.log('🚀 Starting Next.js server...');
  
  return new Promise((resolve, reject) => {
    const server = spawn('npm', ['start'], {
      stdio: 'pipe',
      shell: true
    });
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      
      if (output.includes('Ready - started server on') || output.includes('Local:')) {
        console.log('✅ Server is ready!');
        setTimeout(() => resolve(server), 2000); // Даем время на полную инициализацию
      }
    });
    
    server.stderr.on('data', (data) => {
      console.error('Server error:', data.toString());
    });
    
    server.on('error', (error) => {
      console.error('Failed to start server:', error);
      reject(error);
    });
    
    // Таймаут на случай, если сервер не запустился
    setTimeout(() => {
      reject(new Error('Server startup timeout'));
    }, 30000);
  });
}

async function waitForServer() {
  console.log('⏳ Waiting for server to be ready...');
  
  for (let i = 0; i < 30; i++) {
    try {
      execSync(`curl -f ${URL}/api/health`, { stdio: 'ignore' });
      console.log('✅ Server health check passed!');
      return;
    } catch (error) {
      console.log(`⏳ Attempt ${i + 1}/30: Server not ready yet...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw new Error('Server health check failed after 60 seconds');
}

async function runLighthouse() {
  console.log('🔍 Launching Chrome...');
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
  });
  
  console.log('📊 Running Lighthouse audit...');
  const runnerResult = await lighthouse(URL, {
    port: chrome.port,
    ...lighthouseConfig
  });
  
  const report = runnerResult.lhr;
  const categories = report.categories;
  
  console.log('\n📈 Lighthouse Results:');
  console.log('=====================');
  
  let allPassed = true;
  
  // Проверяем Performance
  const performance = categories.performance.score * 100;
  console.log(`Performance: ${performance.toFixed(1)}/100 (target: ≥${budget.performance})`);
  if (performance < budget.performance) {
    console.log('❌ Performance below target!');
    allPassed = false;
  } else {
    console.log('✅ Performance target met!');
  }
  
  // Проверяем PWA
  const pwa = categories.pwa.score * 100;
  console.log(`PWA: ${pwa.toFixed(1)}/100 (target: installable)`);
  if (!categories.pwa.score || categories.pwa.score < 0.9) {
    console.log('❌ PWA not installable!');
    allPassed = false;
  } else {
    console.log('✅ PWA is installable!');
  }
  
  // Проверяем Accessibility
  const accessibility = categories.accessibility.score * 100;
  console.log(`Accessibility: ${accessibility.toFixed(1)}/100 (target: ≥${budget.accessibility})`);
  if (accessibility < budget.accessibility) {
    console.log('❌ Accessibility below target!');
    allPassed = false;
  } else {
    console.log('✅ Accessibility target met!');
  }
  
  // Проверяем Best Practices
  const bestPractices = categories['best-practices'].score * 100;
  console.log(`Best Practices: ${bestPractices.toFixed(1)}/100 (target: ≥${budget['best-practices']})`);
  if (bestPractices < budget['best-practices']) {
    console.log('❌ Best Practices below target!');
    allPassed = false;
  } else {
    console.log('✅ Best Practices target met!');
  }
  
  // Проверяем SEO
  const seo = categories.seo.score * 100;
  console.log(`SEO: ${seo.toFixed(1)}/100 (target: ≥${budget.seo})`);
  if (seo < budget.seo) {
    console.log('❌ SEO below target!');
    allPassed = false;
  } else {
    console.log('✅ SEO target met!');
  }
  
  console.log('\n=====================');
  
  if (allPassed) {
    console.log('🎉 All Lighthouse targets met!');
  } else {
    console.log('⚠️  Some Lighthouse targets not met!');
  }
  
  await chrome.kill();
  
  return { report, allPassed };
}

async function saveReport(report) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `lighthouse-report-${timestamp}.html`;
  const filepath = join(OUTPUT_DIR, filename);
  
  // Генерируем HTML отчет
  const html = await lighthouse.generateReport(report, 'html');
  writeFileSync(filepath, html);
  
  console.log(`📄 Report saved: ${filepath}`);
  
  // Если в CI, выводим путь для artifacts
  if (process.env.CI) {
    console.log(`::set-output name=report-path::${filepath}`);
    console.log(`::set-output name=report-filename::${filename}`);
  }
  
  return filepath;
}

async function main() {
  let server = null;
  
  try {
    // Запускаем сервер
    server = await startServer();
    
    // Ждем готовности сервера
    await waitForServer();
    
    // Запускаем Lighthouse
    const { report, allPassed } = await runLighthouse();
    
    // Сохраняем отчет
    await saveReport(report);
    
    // Завершаем с соответствующим кодом
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Lighthouse script failed:', error.message);
    process.exit(1);
  } finally {
    // Останавливаем сервер
    if (server) {
      console.log('🛑 Stopping server...');
      server.kill('SIGTERM');
    }
  }
}

if (require.main === module) {
  main();
}
