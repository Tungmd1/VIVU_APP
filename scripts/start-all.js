import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('=============================================================');
console.log('🚀 ĐANG KHỞI CHẠY ĐỒNG THỜI HỆ THỐNG VIVU (BACKEND & FRONTEND)...');
console.log('=============================================================\n');

// 1. Kiểm tra và đảm bảo dist đã được build
const distDir = path.resolve(projectRoot, 'frontend', 'dist');
if (!fs.existsSync(distDir) || !fs.existsSync(path.join(distDir, 'index.html'))) {
  console.log('[Setup] Chưa phát hiện bản build frontend/dist, đang tự động build lần đầu...');
  try {
    const isWin = process.platform === 'win32';
    const npmCmd = isWin ? 'npm.cmd' : 'npm';
    const buildProcess = spawn(npmCmd, ['--prefix', 'frontend', 'run', 'build'], {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    await new Promise((resolve) => buildProcess.on('close', resolve));
    console.log('[Setup] ✓ Đã build frontend/dist thành công!\n');
  } catch (err) {
    console.warn('[Setup Warning] Không thể tự động build frontend:', err.message);
  }
}

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';
const nodeCmd = process.execPath;

// 2. Khởi chạy Backend Server
console.log('[Khởi động] Đang chạy Backend API Server (Port 5000)...');
const backendProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve(projectRoot, 'backend'),
  stdio: 'pipe',
  shell: true
});

backendProcess.stdout.on('data', (d) => {
  const lines = d.toString().split('\n').filter(Boolean);
  lines.forEach(l => console.log(`\x1b[36m[Backend]\x1b[0m ${l}`));
});
backendProcess.stderr.on('data', (d) => {
  const lines = d.toString().split('\n').filter(Boolean);
  lines.forEach(l => console.error(`\x1b[31m[Backend Err]\x1b[0m ${l}`));
});

// 3. Khởi chạy Frontend Server (Port 5173 kèm WebSocket Proxy)
console.log('[Khởi động] Đang chạy Frontend Server (Port 5173)...');
const frontendProcess = spawn(nodeCmd, ['scripts/serve-frontend.js'], {
  cwd: projectRoot,
  stdio: 'pipe'
});

frontendProcess.stdout.on('data', (d) => {
  const lines = d.toString().split('\n').filter(Boolean);
  lines.forEach(l => console.log(`\x1b[32m[Frontend]\x1b[0m ${l}`));
});
frontendProcess.stderr.on('data', (d) => {
  const lines = d.toString().split('\n').filter(Boolean);
  lines.forEach(l => console.error(`\x1b[33m[Frontend Err]\x1b[0m ${l}`));
});

console.log('\n✨ HỆ THỐNG VIVU ĐÃ SẴN SÀNG:');
console.log('👉 Truy cập ứng dụng: \x1b[34mhttp://localhost:5173\x1b[0m');
console.log('👉 Backend API:       \x1b[34mhttp://localhost:5000/api/health\x1b[0m\n');

// 4. Xử lý tắt an toàn cả 2 tiến trình khi nhấn Ctrl+C
const cleanup = () => {
  console.log('\n[Đang tắt] Đang dừng an toàn các tiến trình VIVU...');
  try { backendProcess.kill(); } catch (_) {}
  try { frontendProcess.kill(); } catch (_) {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
