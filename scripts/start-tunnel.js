import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const cloudflaredPath = path.join(projectRoot, 'infra', 'cloudflared.exe');

console.log('=== KHỞI ĐỘNG CLOUDFLARE QUICK TUNNEL CHO VIVU ===');
console.log('Đích đến cục bộ: http://localhost:5173');

if (!fs.existsSync(cloudflaredPath)) {
  console.error('Không tìm thấy cloudflared.exe tại:', cloudflaredPath);
  process.exit(1);
}

const tunnelProcess = spawn(cloudflaredPath, [
  'tunnel',
  '--url',
  'http://localhost:5173',
  '--no-autoupdate'
], {
  windowsHide: true
});

let publicTunnelUrl = '';

const handleOutput = async (data) => {
  const text = data.toString();
  // Cloudflare in URL qua stderr
  const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
  if (match && !publicTunnelUrl) {
    publicTunnelUrl = match[0];
    console.log('\n=============================================================');
    console.log('🎉 ĐÃ KHỞI TẠO ĐƯỜNG LINK CÔNG KHAI HTTPS TOÀN CẦU THÀNH CÔNG:');
    console.log('👉 LINK CÔNG KHAI:', publicTunnelUrl);
    console.log('=============================================================\n');

    // Lưu vào file để các công cụ khác có thể đọc
    fs.writeFileSync(path.join(projectRoot, 'infra', 'tunnel_url.txt'), publicTunnelUrl, 'utf-8');

    // Đồng bộ URL vào Backend API
    try {
      await fetch('http://localhost:5000/api/tunnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: publicTunnelUrl })
      });
      console.log('✓ Đã đồng bộ Link công khai vào Backend API');
    } catch (e) {
      console.warn('Lỗi đồng bộ vào Backend:', e.message);
    }
  }
};

tunnelProcess.stdout.on('data', handleOutput);
tunnelProcess.stderr.on('data', handleOutput);

tunnelProcess.on('close', (code) => {
  console.log('Tunnel đã dừng. Mã thoát:', code);
});
