/**
 * E2E Test Reporter
 * Formats and prints test results, execution statistics,
 * failure logs, and manages exit codes (0 for pass, 1 for fail).
 */

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

export class TestReporter {
  constructor(suiteName = 'VIVU E2E Test Suite') {
    this.suiteName = suiteName;
    this.startTime = Date.now();
    this.results = [];
    this.suites = [];
  }

  startSuite(name) {
    this.suites.push({
      name,
      startTime: Date.now(),
      tests: []
    });
  }

  recordPass(suiteName, testName, durationMs = 0) {
    this.results.push({
      suite: suiteName,
      name: testName,
      status: 'PASS',
      durationMs,
      error: null
    });
  }

  recordFail(suiteName, testName, error, durationMs = 0) {
    this.results.push({
      suite: suiteName,
      name: testName,
      status: 'FAIL',
      durationMs,
      error: error?.message || String(error)
    });
  }

  recordSkip(suiteName, testName, reason = '') {
    this.results.push({
      suite: suiteName,
      name: testName,
      status: 'SKIP',
      durationMs: 0,
      error: reason
    });
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    const duration = Date.now() - this.startTime;

    return {
      total,
      passed,
      failed,
      skipped,
      duration,
      passRate: total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0',
      success: failed === 0
    };
  }

  getExitCode() {
    return this.results.some(r => r.status === 'FAIL') ? 1 : 0;
  }

  printSummary() {
    const summary = this.getSummary();
    const divider = '━'.repeat(80);

    console.log('\n' + ANSI.bold + ANSI.cyan + divider + ANSI.reset);
    console.log(`${ANSI.bold}  📊 E2E TEST SUMMARY: ${this.suiteName}${ANSI.reset}`);
    console.log(ANSI.cyan + divider + ANSI.reset);

    console.log(`  Total Tests  : ${ANSI.bold}${summary.total}${ANSI.reset}`);
    console.log(`  Passed       : ${ANSI.green}${ANSI.bold}${summary.passed}${ANSI.reset}`);
    console.log(`  Failed       : ${summary.failed > 0 ? ANSI.red : ANSI.green}${ANSI.bold}${summary.failed}${ANSI.reset}`);
    console.log(`  Skipped      : ${ANSI.yellow}${summary.skipped}${ANSI.reset}`);
    console.log(`  Pass Rate    : ${summary.success ? ANSI.green : ANSI.yellow}${ANSI.bold}${summary.passRate}%${ANSI.reset}`);
    console.log(`  Duration     : ${ANSI.dim}${summary.duration}ms${ANSI.reset}`);

    if (summary.failed > 0) {
      console.log('\n' + ANSI.bold + ANSI.red + '  ❌ FAILURES & DEFECTS DETECTED:' + ANSI.reset);
      const failures = this.results.filter(r => r.status === 'FAIL');
      failures.forEach((f, idx) => {
        console.log(`  ${idx + 1}) [${f.suite}] ${f.name}`);
        console.log(`     ${ANSI.dim}Error: ${f.error}${ANSI.reset}`);
      });
    }

    console.log(ANSI.cyan + divider + ANSI.reset + '\n');
    return summary;
  }
}
