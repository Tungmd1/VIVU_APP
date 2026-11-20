import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runFullAudit } from './helpers/staticAuditHelper.js';
import { TestReporter } from './helpers/testReporter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..', '..');

const args = process.argv.slice(2);
const tierArg = args.find(a => a.startsWith('--tier='))?.split('=')[1] || '1';
const fileArg = args.find(a => a.startsWith('--file='))?.split('=')[1] || null;
const isAudit = args.includes('--audit');

console.log('╔════════════════════════════════════════════════════════════════════════════╗');
console.log('║                   VIVU E2E TEST RUNNER & VERIFIER                          ║');
console.log('╚════════════════════════════════════════════════════════════════════════════╝');
console.log(`[Config] Target Tier: ${tierArg} | Specific File: ${fileArg || 'All'} | Audit Only: ${isAudit}`);

if (isAudit) {
  console.log('\n🔍 Running Static Compliance Audit...');
  const audit = runFullAudit();
  let hasFailures = false;

  console.log('\n--- 1. Leaflet OSM Tiles Audit (Feature 6) ---');
  if (audit.tileAudit.passed) {
    console.log('✅ PASS: Tile configuration uses OSM / CartoDB / ESRI, no Google Maps URLs');
  } else {
    hasFailures = true;
    console.log('❌ FAIL: Issues detected with map tiles:');
    audit.tileAudit.details.forEach(d => console.log('   - ' + d));
  }

  console.log('\n--- 2. Google Maps References Audit (Feature 7) ---');
  if (audit.googleAudit.passed) {
    console.log('✅ PASS: Zero forbidden Google Maps references found');
  } else {
    hasFailures = true;
    console.log(`❌ FAIL: Found ${audit.googleAudit.violations.length} Google Maps violations:`);
    audit.googleAudit.violations.forEach(v => console.log(`   - ${v.file}:${v.line} -> ${v.snippet}`));
  }

  console.log('\n--- 3. Non-Occluding Markers Audit (Feature 14) ---');
  if (audit.markerAudit.passed) {
    console.log('✅ PASS: Marker zIndex and dimensions hierarchy strictly verified');
  } else {
    hasFailures = true;
    console.log('❌ FAIL: Marker hierarchy issues:');
    audit.markerAudit.details.forEach(d => console.log('   - ' + d));
  }

  console.log('\n--- 4. Bootstrap Icons Migration Audit (Feature 20) ---');
  if (audit.iconsAudit.passed) {
    console.log(`✅ PASS: Zero raw emojis in UI buttons/tabs. Found ${audit.iconsAudit.bootstrapIconsCount} Bootstrap Icons`);
  } else {
    hasFailures = true;
    console.log(`❌ FAIL: Found ${audit.iconsAudit.violations.length} raw emoji icon violations:`);
    audit.iconsAudit.violations.forEach(v => console.log(`   - ${v.file}:${v.line} -> ${v.snippet}`));
  }

  console.log('\n--- 5. ARIA Accessibility Audit (Feature 21) ---');
  if (audit.ariaAudit.passed) {
    console.log('✅ PASS: Interactive elements and VivuBottomDock have valid ARIA labels');
  } else {
    hasFailures = true;
    console.log(`❌ FAIL: Found ${audit.ariaAudit.violations.length} ARIA violations:`);
    audit.ariaAudit.violations.forEach(v => console.log(`   - ${v.file}:${v.line} -> ${v.snippet}`));
  }

  console.log('\n--- 6. Reduced Motion Audit (Feature 22) ---');
  if (audit.motionAudit.passed) {
    console.log('✅ PASS: CSS and JS honor prefers-reduced-motion: reduce');
  } else {
    hasFailures = true;
    console.log('❌ FAIL: Reduced motion issues:');
    audit.motionAudit.details.forEach(d => console.log('   - ' + d));
  }

  console.log('\n--- 7. Mobile Chat Layout Audit (Feature 23) ---');
  if (audit.mobileAudit.passed) {
    console.log('✅ PASS: MessengerActiveRoom hides when inactive on mobile screens');
  } else {
    hasFailures = true;
    console.log('❌ FAIL: Mobile chat layout issues:');
    audit.mobileAudit.details.forEach(d => console.log('   - ' + d));
  }

  console.log('\n' + '━'.repeat(80));
  if (hasFailures) {
    console.log('❌ STATIC AUDIT RESULT: NON-COMPLIANT VIOLATIONS DETECTED');
    process.exit(1);
  } else {
    console.log('✅ STATIC AUDIT RESULT: 100% COMPLIANT');
    process.exit(0);
  }
}

// Collect test files to run
function getTestFiles() {
  const files = [];

  const tierDirs = [];
  if (tierArg === '1' || tierArg === 'all') {
    tierDirs.push(path.join(__dirname, 'tier1_coverage'));
  }
  if (tierArg === '2' || tierArg === 'all') {
    tierDirs.push(path.join(__dirname, 'tier2_boundary'));
  }
  if (tierArg === '3' || tierArg === 'all') {
    tierDirs.push(path.join(__dirname, 'tier3_cross_feature'));
  }
  if (tierArg === '4' || tierArg === 'all') {
    tierDirs.push(path.join(__dirname, 'tier4_real_world'));
  }

  for (const dir of tierDirs) {
    if (fs.existsSync(dir)) {
      const dirFiles = fs.readdirSync(dir)
        .filter(f => f.endsWith('.test.js'))
        .map(f => path.join(dir, f));
      files.push(...dirFiles);
    }
  }

  if (fileArg) {
    return files.filter(f => path.basename(f) === fileArg || f.includes(fileArg));
  }

  return files.sort();
}

const testFiles = getTestFiles();

if (testFiles.length === 0) {
  console.log(`[Warning] No test files found for Tier '${tierArg}'.`);
  process.exit(0);
}

console.log(`\nFound ${testFiles.length} test files to execute:\n`);
testFiles.forEach((f, idx) => console.log(`  ${idx + 1}. ${path.relative(ROOT_DIR, f)}`));
console.log('\n' + '━'.repeat(80));

const reporter = new TestReporter(`Tier ${tierArg} Test Suite`);

async function runTestFile(filePath) {
  const fileName = path.basename(filePath);
  const relPath = path.relative(ROOT_DIR, filePath);

  return new Promise((resolve) => {
    const startTime = Date.now();
    const child = spawn(process.execPath, ['--test', filePath], {
      cwd: ROOT_DIR,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        FORCE_COLOR: '1'
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => {
      stdout += d.toString();
      process.stdout.write(d);
    });

    child.stderr.on('data', (d) => {
      stderr += d.toString();
      process.stderr.write(d);
    });

    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      // Parse output for test count and pass/fail lines
      const passMatches = stdout.match(/ℹ pass (\d+)/);
      const failMatches = stdout.match(/ℹ fail (\d+)/);
      const passedCount = passMatches ? parseInt(passMatches[1], 10) : 0;
      const failedCount = failMatches ? parseInt(failMatches[1], 10) : 0;

      // Extract individual test cases
      const testLineRegex = /[✔✖]\s+(.*?)\s+\((\d+(?:\.\d+)?ms)\)/g;
      let m;
      let parsedAny = false;
      while ((m = testLineRegex.exec(stdout)) !== null) {
        parsedAny = true;
        const testName = m[1].trim();
        const testDuration = parseFloat(m[2]);
        const isPass = m[0].startsWith('✔');
        if (isPass) {
          reporter.recordPass(fileName, testName, testDuration);
        } else {
          reporter.recordFail(fileName, testName, new Error(`Test failed in ${fileName}`), testDuration);
        }
      }

      if (!parsedAny) {
        if (code === 0) {
          reporter.recordPass(fileName, fileName, duration);
        } else {
          reporter.recordFail(fileName, fileName, new Error(stderr || `Process exited with code ${code}`), duration);
        }
      }

      resolve({ code, duration, passedCount, failedCount });
    });
  });
}

async function runAll() {
  for (let i = 0; i < testFiles.length; i++) {
    const file = testFiles[i];
    console.log(`\n▶ [${i + 1}/${testFiles.length}] Running: ${path.basename(file)}`);
    await runTestFile(file);
  }

  reporter.printSummary();
  process.exit(reporter.getExitCode());
}

runAll().catch(err => {
  console.error('Fatal runner error:', err);
  process.exit(1);
});
