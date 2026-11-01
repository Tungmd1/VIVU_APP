const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const esbuild = require('../frontend/node_modules/esbuild-wasm');

async function build() {
  console.log('[Build] Starting esbuild-wasm bundling...');
  const frontendDir = path.resolve(__dirname, '../frontend');
  const distDir = path.resolve(frontendDir, 'dist');
  const assetsDir = path.resolve(distDir, 'assets');
  const assetsFontsDir = path.resolve(assetsDir, 'fonts');
  const distFontsDir = path.resolve(distDir, 'fonts');

  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  if (!fs.existsSync(assetsFontsDir)) {
    fs.mkdirSync(assetsFontsDir, { recursive: true });
  }
  if (!fs.existsSync(distFontsDir)) {
    fs.mkdirSync(distFontsDir, { recursive: true });
  }

  // Copy Bootstrap Icons font files (woff & woff2) to dist/assets/fonts and dist/fonts
  const bsFontsSourceDir = path.resolve(frontendDir, 'node_modules/bootstrap-icons/font/fonts');
  if (fs.existsSync(bsFontsSourceDir)) {
    const fontFiles = fs.readdirSync(bsFontsSourceDir);
    for (const fontFile of fontFiles) {
      const srcFile = path.join(bsFontsSourceDir, fontFile);
      fs.copyFileSync(srcFile, path.join(assetsFontsDir, fontFile));
      fs.copyFileSync(srcFile, path.join(distFontsDir, fontFile));
    }
    console.log(`[Build] Copied ${fontFiles.length} Bootstrap Icons font files to assets/fonts and dist/fonts`);
  }

  const outJs = path.join(assetsDir, 'index-BOF8WbQc.js');
  const outCss = path.join(assetsDir, 'index-CnGff0oW.css');

  try {
    // 1. Compile Tailwind CSS
    console.log('[Build] Compiling Tailwind CSS utilities...');
    const tailwindOut = path.join(assetsDir, 'tailwind.css');
    try {
      execSync('npx.cmd -y tailwindcss@3.4.17 -i src/index.css --config tailwind.config.cjs -o dist/assets/tailwind.css --minify', {
        cwd: frontendDir,
        stdio: 'pipe'
      });
      console.log('[Build] Tailwind CSS compiled successfully!');
    } catch (e) {
      console.warn('[Build] Warning during Tailwind compilation:', e.message);
    }

    // 2. Assemble complete CSS bundle
    let tailwindCss = '';
    if (fs.existsSync(tailwindOut)) {
      tailwindCss = fs.readFileSync(tailwindOut, 'utf8');
    }

    const bootstrapCssPath = path.resolve(frontendDir, 'node_modules/bootstrap-icons/font/bootstrap-icons.css');
    let bootstrapCss = fs.existsSync(bootstrapCssPath) ? fs.readFileSync(bootstrapCssPath, 'utf8') : '';
    if (bootstrapCss) {
      // Add robust font fallback URLs for both local relative, dist absolute, and CDN
      bootstrapCss = bootstrapCss.replace(
        'url("./fonts/bootstrap-icons.woff2?e34853135f9e39acf64315236852cd5a") format("woff2")',
        'url("./fonts/bootstrap-icons.woff2") format("woff2"), url("/assets/fonts/bootstrap-icons.woff2") format("woff2"), url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.2/font/fonts/bootstrap-icons.woff2") format("woff2")'
      );
    }

    const mapboxCssPath = path.resolve(frontendDir, 'node_modules/mapbox-gl/dist/mapbox-gl.css');
    const mapboxCss = fs.existsSync(mapboxCssPath) ? fs.readFileSync(mapboxCssPath, 'utf8') : '';

    const assembledCss = [
      '/* Tailwind & F1 Hero Compiled Theme */',
      tailwindCss,
      '/* Mapbox GL CSS */',
      mapboxCss,
      '/* Bootstrap Icons CSS */',
      bootstrapCss
    ].join('\n\n');

    fs.writeFileSync(outCss, assembledCss, 'utf8');
    console.log(`[Build] Assembled CSS written to index-CnGff0oW.css (${assembledCss.length} bytes)`);

    // 3. Bundle JavaScript
    await esbuild.build({
      entryPoints: [path.resolve(frontendDir, 'src/main.jsx')],
      bundle: true,
      outfile: outJs,
      format: 'esm',
      target: 'esnext',
      jsx: 'automatic',
      conditions: ['style'],
      minify: false,
      sourcemap: false,
      define: {
        'process.env.NODE_ENV': '"production"',
        'import.meta.env.VITE_GOOGLE_CLIENT_ID': '""',
        'import.meta.env.VITE_GOOGLE_API_KEY': '""',
        'import.meta.env.VITE_SUPABASE_URL': '""',
        'import.meta.env.VITE_SUPABASE_ANON_KEY': '""',
        'import.meta.env.VITE_API_BASE_URL': '""',
        'import.meta.env.VITE_FACEBOOK_APP_ID': '""',
      },
      loader: {
        '.png': 'dataurl',
        '.jpg': 'dataurl',
        '.jpeg': 'dataurl',
        '.svg': 'dataurl',
        '.woff': 'dataurl',
        '.woff2': 'dataurl',
        '.ttf': 'dataurl',
        '.css': 'empty', // CSS is handled directly above
      },
    });

    console.log('[Build] esbuild-wasm bundle completed successfully!');
    console.log('[Build] Finished! index-BOF8WbQc.js and index-CnGff0oW.css updated.');
  } catch (err) {
    console.error('[Build Error]:', err);
    process.exit(1);
  }
}

build();
