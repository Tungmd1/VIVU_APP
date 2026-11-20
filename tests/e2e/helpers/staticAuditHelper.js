import fs from 'node:fs';
import path from 'node:path';
import { E2E_CONFIG } from '../config/env.js';

/**
 * Static Audit Helper
 * Performs AST and Regex static analysis on frontend files to verify
 * compliance with R1, R2, R4, R5 requirements without needing a browser runtime.
 */

// Regex patterns
const GOOGLE_MAPS_FORBIDDEN_REGEX = /(maps\.google\.com|google\.com\/maps|maps\.googleapis\.com|mt[0-3]?\.google\.com)/i;
const EMOJI_REGEX = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u;

// Whitelisted Google usages (Auth GIS, Fonts, STUN)
const WHITELISTED_GOOGLE_PATTERNS = [
  /accounts\.google\.com\/gsi/,
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
  /stun:stun\.l\.google\.com:19302/,
  /auth_provider\s*===?\s*['"]google['"]/
];

function getAllFiles(dir, extensions = ['.js', '.jsx', '.css', '.html']) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
          traverse(fullPath);
        }
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }

  traverse(dir);
  return results;
}

/**
 * Feature 6: Audit Leaflet tile endpoints in mapTileConstants.js
 */
export function auditTileEndpoints() {
  const filePath = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'map', 'mapTileConstants.js');
  if (!fs.existsSync(filePath)) {
    return {
      passed: false,
      hasGoogle: false,
      hasOsm: false,
      details: [`File not found: ${filePath}`]
    };
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const hasGoogle = GOOGLE_MAPS_FORBIDDEN_REGEX.test(content) || content.includes('GOOGLE_TILES');
  const hasOsm = content.includes('openstreetmap.org') || content.includes('cartocdn.com') || content.includes('arcgisonline.com');
  const hasAttribution = /attribution/i.test(content) || /OpenStreetMap/i.test(content);

  const passed = !hasGoogle && hasOsm;
  const details = [];
  if (hasGoogle) details.push('Contains Google tile endpoints or GOOGLE_TILES reference');
  if (!hasOsm) details.push('Missing OpenStreetMap / CartoDB / ESRI tile endpoints');
  if (!hasAttribution) details.push('Missing tile attribution string');

  return {
    passed,
    hasGoogle,
    hasOsm,
    hasAttribution,
    details
  };
}

/**
 * Feature 7: Audit elimination of Google Maps references across frontend
 */
export function auditGoogleReferences() {
  const frontendSrc = path.join(E2E_CONFIG.FRONTEND_DIR, 'src');
  const indexHtml = path.join(E2E_CONFIG.FRONTEND_DIR, 'index.html');
  const filesToScan = [...getAllFiles(frontendSrc), indexHtml];

  const violations = [];

  // Check if legacy GoogleMapView.jsx still exists
  const legacyMapFile = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'map', 'GoogleMapView.jsx');
  if (fs.existsSync(legacyMapFile)) {
    violations.push({
      file: 'src/components/map/GoogleMapView.jsx',
      line: 1,
      snippet: 'Legacy GoogleMapView.jsx file exists; should be refactored to VivuMapView.jsx'
    });
  }

  for (const file of filesToScan) {
    if (!fs.existsSync(file)) continue;
    const relPath = path.relative(E2E_CONFIG.FRONTEND_DIR, file);
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i];

      // Check if line matches forbidden Google Maps patterns
      if (GOOGLE_MAPS_FORBIDDEN_REGEX.test(lineText)) {
        // Check if it matches a whitelist pattern
        const isWhitelisted = WHITELISTED_GOOGLE_PATTERNS.some(wp => wp.test(lineText));
        if (!isWhitelisted) {
          violations.push({
            file: relPath,
            line: i + 1,
            snippet: lineText.trim()
          });
        }
      }
    }
  }

  return {
    passed: violations.length === 0,
    violations,
    scannedFilesCount: filesToScan.length
  };
}

/**
 * Feature 14: Non-occluding map markers specification audit
 */
export function auditNonOccludingMarkers() {
  const mapFiles = [
    path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'map', 'GoogleMapView.jsx'),
    path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'map', 'VivuMapView.jsx')
  ];

  let mapContent = '';
  for (const f of mapFiles) {
    if (fs.existsSync(f)) {
      mapContent = fs.readFileSync(f, 'utf-8');
      break;
    }
  }

  const details = [];
  // Specs from Feature 14:
  // User teardrop: 56x56, zIndexOffset: 1000
  // Peer marker: 44x44, zIndexOffset: 500-600
  // Saved place: 30x36 (or [30, 36]), zIndexOffset: 300
  const hasUserMarkerZIndex = /zIndexOffset:\s*1000/.test(mapContent);
  const hasSavedPlaceZIndex = /zIndexOffset:\s*300/.test(mapContent);
  const hasSavedPlaceSize = /\[30,\s*36\]/.test(mapContent) || /width:\s*30px/.test(mapContent);

  if (!hasSavedPlaceZIndex) details.push('Saved places marker zIndexOffset (300) not configured in map view');
  if (!hasSavedPlaceSize) details.push('Saved places marker size (30x36) not configured in map view');

  return {
    passed: hasUserMarkerZIndex && hasSavedPlaceZIndex && hasSavedPlaceSize,
    hasUserMarkerZIndex,
    hasSavedPlaceZIndex,
    hasSavedPlaceSize,
    details
  };
}

/**
 * Feature 20: Audit Bootstrap Icons vs raw emoji for UI icons
 */
export function auditBootstrapIconsUsage() {
  const componentsDir = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components');
  const targetFiles = [
    'bump/SpatialBumpModal3D.jsx',
    'story/UnifiedCreationStudioModal.jsx',
    'map/RightActionStack.jsx',
    'chat/MessengerInboxList.jsx'
  ];

  const violations = [];
  let bootstrapIconsCount = 0;

  for (const rel of targetFiles) {
    const fullPath = path.join(componentsDir, rel);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');

    // Count bi-... classes
    const biMatches = content.match(/bi-[a-z0-9-]+/g);
    if (biMatches) bootstrapIconsCount += biMatches.length;

    // Check lines for raw emojis in UI JSX tags
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Only flag JSX tags like <button>, <span>, <p> containing raw emoji
      if (EMOJI_REGEX.test(line) && (line.includes('<button') || line.includes('<span') || line.includes('text-['))) {
        violations.push({
          file: rel,
          line: i + 1,
          snippet: line.trim()
        });
      }
    }
  }

  return {
    passed: violations.length === 0,
    violations,
    bootstrapIconsCount
  };
}

/**
 * Feature 21: Audit ARIA labels and accessibility
 */
export function auditAriaAccessibility() {
  const dockFile = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'layout', 'VivuBottomDock.jsx');
  const violations = [];
  let dockCompliant = false;

  if (fs.existsSync(dockFile)) {
    const content = fs.readFileSync(dockFile, 'utf-8');
    const hasTablist = /role=["']tablist["']/.test(content);
    const hasTabs = /role=["']tab["']/.test(content);
    const hasAriaSelected = /aria-selected=/.test(content);

    dockCompliant = hasTablist && hasTabs && hasAriaSelected;
    if (!dockCompliant) {
      violations.push({
        file: 'src/components/layout/VivuBottomDock.jsx',
        line: 1,
        snippet: 'VivuBottomDock missing role="tablist", role="tab", or aria-selected'
      });
    }
  }

  // Audit icon-only buttons across components
  const componentsDir = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components');
  const jsxFiles = getAllFiles(componentsDir, ['.jsx']);

  for (const file of jsxFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const rel = path.relative(E2E_CONFIG.FRONTEND_DIR, file);

    // Regex to find buttons that contain <i className="bi ..."/> without aria-label or title
    const buttonRegex = /<button\b([^>]*?)>([\s\S]*?)<\/button>/g;
    let match;
    while ((match = buttonRegex.exec(content)) !== null) {
      const attrs = match[1];
      const inner = match[2].trim();

      // If button has no text and only contains an <i> or <svg>
      const hasOnlyIcon = /^<i\b[^>]*><\/i>$/.test(inner) || /^<svg\b[\s\S]*?<\/svg>$/.test(inner);
      const hasAriaLabel = /aria-label=/i.test(attrs);
      const hasTitle = /title=/i.test(attrs);

      if (hasOnlyIcon && !hasAriaLabel && !hasTitle) {
        violations.push({
          file: rel,
          line: 0,
          snippet: match[0].substring(0, 100)
        });
      }
    }
  }

  return {
    passed: violations.length === 0,
    dockCompliant,
    violations
  };
}

/**
 * Feature 22: Audit prefers-reduced-motion compliance
 */
export function auditReducedMotion() {
  const cssFile = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'index.css');
  const jsFile = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'utils', 'cyberSplash.js');

  let cssHasReducedMotion = false;
  if (fs.existsSync(cssFile)) {
    const cssContent = fs.readFileSync(cssFile, 'utf-8');
    cssHasReducedMotion = cssContent.includes('prefers-reduced-motion') && cssContent.includes('reduce');
  }

  let jsHasReducedMotionCheck = false;
  if (fs.existsSync(jsFile)) {
    const jsContent = fs.readFileSync(jsFile, 'utf-8');
    jsHasReducedMotionCheck = jsContent.includes('prefers-reduced-motion') && jsContent.includes('matchMedia');
  }

  const passed = cssHasReducedMotion && jsHasReducedMotionCheck;
  const details = [];
  if (!cssHasReducedMotion) details.push('index.css missing @media (prefers-reduced-motion: reduce)');
  if (!jsHasReducedMotionCheck) details.push('cyberSplash.js missing prefers-reduced-motion check before triggering GSAP animation');

  return {
    passed,
    cssHasReducedMotion,
    jsHasReducedMotionCheck,
    details
  };
}

/**
 * Feature 23: Audit mobile responsive chat layout
 */
export function auditMobileChatLayout() {
  const activeRoomFile = path.join(E2E_CONFIG.FRONTEND_DIR, 'src', 'components', 'chat', 'MessengerActiveRoom.jsx');
  if (!fs.existsSync(activeRoomFile)) {
    return {
      passed: false,
      hasResponsiveHide: false,
      details: [`File not found: ${activeRoomFile}`]
    };
  }

  const content = fs.readFileSync(activeRoomFile, 'utf-8');
  // Check whether MessengerActiveRoom hides when no conversation is active on mobile
  const hasResponsiveHide = /hidden\s+md:flex/.test(content) || /activeConversationId\s*\?\s*['"][^'"]*flex['"]\s*:\s*['"][^'"]*hidden/.test(content);

  const details = [];
  if (!hasResponsiveHide) {
    details.push('MessengerActiveRoom.jsx missing responsive class condition (e.g. activeConversationId ? "flex" : "hidden md:flex")');
  }

  return {
    passed: hasResponsiveHide,
    hasResponsiveHide,
    details
  };
}

/**
 * Run full static audit and produce aggregated report
 */
export function runFullAudit() {
  const tileAudit = auditTileEndpoints();
  const googleAudit = auditGoogleReferences();
  const markerAudit = auditNonOccludingMarkers();
  const iconsAudit = auditBootstrapIconsUsage();
  const ariaAudit = auditAriaAccessibility();
  const motionAudit = auditReducedMotion();
  const mobileAudit = auditMobileChatLayout();

  return {
    tileAudit,
    googleAudit,
    markerAudit,
    iconsAudit,
    ariaAudit,
    motionAudit,
    mobileAudit,
    allPassed: tileAudit.passed && googleAudit.passed && markerAudit.passed &&
               iconsAudit.passed && ariaAudit.passed && motionAudit.passed && mobileAudit.passed
  };
}
