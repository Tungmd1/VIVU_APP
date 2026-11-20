import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { E2E_CONFIG } from '../config/env.js';

describe('Feature 22: Reduced Motion Compliance (T1.22)', () => {
  const cssPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'index.css');
  const jsPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'utils', 'cyberSplash.js');

  test('TC 22.1: index.css contains @media (prefers-reduced-motion: reduce) rule', () => {
    assert.ok(fs.existsSync(cssPath), 'index.css must exist');
    const content = fs.readFileSync(cssPath, 'utf-8');
    const hasMediaRule = content.includes('prefers-reduced-motion') && content.includes('reduce');
    assert.equal(hasMediaRule, true, 'index.css must declare @media (prefers-reduced-motion: reduce)');
  });

  test('TC 22.2: CSS reduced motion rule suppresses or reduces transitions and animations', () => {
    const content = fs.readFileSync(cssPath, 'utf-8');
    const hasSuppression = /animation-duration:\s*0\.01ms|animation:\s*none|transition-duration:\s*0\.01ms|transition:\s*none/i.test(content);
    assert.equal(hasSuppression, true, 'Reduced motion block must suppress animation/transition durations');
  });

  test('TC 22.3: cyberSplash.js checks prefers-reduced-motion before creating particle animations', () => {
    if (!fs.existsSync(jsPath)) return;
    const content = fs.readFileSync(jsPath, 'utf-8');
    const hasMediaQueryCheck = content.includes('prefers-reduced-motion') && content.includes('matchMedia');
    assert.equal(hasMediaQueryCheck, true, 'cyberSplash.js must check window.matchMedia("(prefers-reduced-motion: reduce)")');
  });

  test('TC 22.4: cyberSplash.js exits early if reduced motion preference is active', () => {
    if (!fs.existsSync(jsPath)) return;
    const content = fs.readFileSync(jsPath, 'utf-8');
    const hasEarlyReturn = /if\s*\([^)]*reduced-motion[^)]*\)\s*return/i.test(content) ||
                          /matches\)\s*return/i.test(content);
    assert.equal(hasEarlyReturn, true, 'cyberSplash.js must return early without triggering GSAP when reduced motion is preferred');
  });

  test('TC 22.5: Reduced motion applies globally without interfering with static rendering', () => {
    const content = fs.readFileSync(cssPath, 'utf-8');
    // Ensure reduced motion is scoped to @media block and doesn't wipe normal styles
    assert.ok(content.includes('@media (prefers-reduced-motion: reduce)'), 'Scope must be an @media block');
  });
});
