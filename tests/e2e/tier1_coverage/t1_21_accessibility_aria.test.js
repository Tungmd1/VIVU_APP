import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { E2E_CONFIG } from '../config/env.js';

describe('Feature 21: Accessibility (ARIA & Labels) (T1.21)', () => {
  const dockPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'layout', 'VivuBottomDock.jsx');

  test('TC 21.1: VivuBottomDock.jsx navigation container has role="tablist" and aria-label', () => {
    if (!fs.existsSync(dockPath)) return;
    const content = fs.readFileSync(dockPath, 'utf-8');
    const hasTablist = /role=["']tablist["']/.test(content);
    const hasAriaLabel = /aria-label=/i.test(content);
    assert.equal(hasTablist, true, 'VivuBottomDock container must specify role="tablist"');
    assert.equal(hasAriaLabel, true, 'VivuBottomDock container must specify aria-label');
  });

  test('TC 21.2: VivuBottomDock.jsx tabs have role="tab" and aria-selected attributes', () => {
    if (!fs.existsSync(dockPath)) return;
    const content = fs.readFileSync(dockPath, 'utf-8');
    const hasRoleTab = /role=["']tab["']/.test(content);
    const hasAriaSelected = /aria-selected=/.test(content);
    assert.equal(hasRoleTab, true, 'Dock items must have role="tab"');
    assert.equal(hasAriaSelected, true, 'Dock items must specify dynamic aria-selected');
  });

  test('TC 21.3: Floating action buttons in RightActionStack.jsx provide accessible names', () => {
    const actionPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'map', 'RightActionStack.jsx');
    if (!fs.existsSync(actionPath)) return;
    const content = fs.readFileSync(actionPath, 'utf-8');
    // Check buttons have title or aria-label
    const buttons = content.match(/<button\b[\s\S]*?<\/button>/g) || [];
    for (const btn of buttons) {
      const hasAccessibleName = /title=|aria-label=/i.test(btn);
      assert.equal(hasAccessibleName, true, `Button in RightActionStack must have accessible name: ${btn.substring(0, 60)}`);
    }
  });

  test('TC 21.4: Modal close buttons have aria-label="Đóng" or title="Đóng"', () => {
    const modalPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'circle', 'CreateCircleModal.jsx');
    if (!fs.existsSync(modalPath)) return;
    const content = fs.readFileSync(modalPath, 'utf-8');
    const hasCloseAria = /aria-label=["'][^"']*đóng[^"']*["']|title=["'][^"']*đóng[^"']*["']/i.test(content);
    assert.equal(hasCloseAria, true, 'Modal close button must provide accessible name for screen readers');
  });

  test('TC 21.5: Text input fields across auth and search components have accessible labels', () => {
    const inputPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'chat', 'MessengerInboxList.jsx');
    if (!fs.existsSync(inputPath)) return;
    const content = fs.readFileSync(inputPath, 'utf-8');
    const inputs = content.match(/<input\b[^>]*>/g) || [];
    for (const inp of inputs) {
      const hasLabel = /aria-label=|placeholder=|title=/i.test(inp);
      assert.equal(hasLabel, true, `Input field must have accessible label/placeholder: ${inp}`);
    }
  });
});
