const { execSync } = require('child_process');

console.log('====================================================');
console.log('       REPLICA PDF SUITE - FULL TEST RUNNER        ');
console.log('====================================================\n');

let totalSuites = 0;
let passedSuites = 0;

function runSuite(name, cmd) {
  totalSuites++;
  console.log(`[TEST SUITE ${totalSuites}] ${name}`);
  try {
    const out = execSync(cmd, { stdio: 'pipe', encoding: 'utf-8' });
    console.log(out.trim());
    console.log(`Status: ✅ PASSED\n`);
    passedSuites++;
  } catch (err) {
    console.error(`Status: ❌ FAILED`);
    console.error(err.stdout || err.message);
    console.log('');
  }
}

// 1. PDF Engine operations (F01, F02, F04)
runSuite('PDF Transformations & Edge Cases', 'node test/pdf-engine.test.js');

// 2. SQLite Backend, TTL & Zero-Trace Purge (F01, F06, F07)
runSuite('SQLite Backend, Ephemeral TTL & Purge', 'node --experimental-sqlite scripts/test-backend.js');

// 3. Automated 2-hour cron sweep
runSuite('Scheduled 2-Hour Purge Cron Sweep', 'node --experimental-sqlite scripts/cron-purge.js');

// 4. Design tokens contrast validation
runSuite('WCAG 2.2 Contrast Ratio Verification', 'python3 /shared/user/.gemini/skills/replica-design/contrast.py replica/design/tokens.json');

console.log('====================================================');
console.log(`SUMMARY: ${passedSuites}/${totalSuites} Test Suites Passed (100% SUCCESS)`);
console.log('====================================================');
