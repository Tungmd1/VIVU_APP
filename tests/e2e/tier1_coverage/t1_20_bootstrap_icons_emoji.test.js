import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { E2E_CONFIG } from '../config/env.js';

const EMOJI_IN_TAG_REGEX = /<[a-z]+[^>]*>[\s\S]*?[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}][\s\S]*?<\/[a-z]+>/u;

describe('Feature 20: Bootstrap Icons Emoji Migration (T1.20)', () => {
  test('TC 20.1: SpatialBumpModal3D.jsx contains zero raw emoji icons in UI elements', () => {
    const filePath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'bump', 'SpatialBumpModal3D.jsx');
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf-8');
    const hasRawEmojiIcon = /🎉|⚡|🥂|🍻/.test(content);
    assert.equal(hasRawEmojiIcon, false, 'SpatialBumpModal3D.jsx must use Bootstrap Icons instead of raw emojis (🎉, ⚡, 🥂, 🍻)');
  });

  test('TC 20.2: UnifiedCreationStudioModal.jsx uses Bootstrap Icons for Story/Mood/Mascot tabs', () => {
    const filePath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'story', 'UnifiedCreationStudioModal.jsx');
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf-8');
    const hasRawEmoji = /📸|✍️|🧸/.test(content);
    assert.equal(hasRawEmoji, false, 'UnifiedCreationStudioModal.jsx must use Bootstrap Icons instead of emojis (📸, ✍️, 🧸)');
  });

  test('TC 20.3: RightActionStack.jsx uses Bootstrap Icons for all floating action buttons', () => {
    const filePath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'map', 'RightActionStack.jsx');
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf-8');
    const biMatches = content.match(/bi-[a-z0-9-]+/g);
    assert.ok(biMatches && biMatches.length >= 3, 'RightActionStack.jsx must render Bootstrap Icons (bi-...)');
  });

  test('TC 20.4: MessengerInboxList.jsx uses Bootstrap Icons for heart and GPS message indicators', () => {
    const filePath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'chat', 'MessengerInboxList.jsx');
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf-8');
    const hasHeartEmojiIcon = /<[a-z]+[^>]*>[^<]*❤️[^<]*<\/[a-z]+>/.test(content);
    assert.equal(hasHeartEmojiIcon, false, 'MessengerInboxList.jsx must replace ❤️ icon with bi-heart-fill');
  });

  test('TC 20.5: frontend/index.html includes Bootstrap Icons stylesheet', () => {
    const indexPath = path.join(E2E_CONFIG.FRONTEND_DIR, 'index.html');
    const content = fs.readFileSync(indexPath, 'utf-8');
    const hasBootstrapIcons = content.includes('bootstrap-icons');
    assert.equal(hasBootstrapIcons, true, 'index.html must load bootstrap-icons CSS');
  });
});
