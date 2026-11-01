const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9249;
const tmpDir = path.join(os.tmpdir(), 'chrome-cdp-test1-' + Date.now());

const chromeProcess = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${tmpDir}`,
  '--window-size=1280,800',
  'http://localhost:5173/'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2500));
  try {
    const listRes = await fetch(`http://127.0.0.1:${port}/json/list`).then(r => r.json());
    const vivuTarget = listRes.find(t => t.url && t.url.includes('5173')) || listRes[0];
    const ws = new WebSocket(vivuTarget.webSocketDebuggerUrl);

    let msgId = 1;
    const callbacks = new Map();

    const send = (method, params = {}) => {
      const id = msgId++;
      return new Promise((resolve, reject) => {
        callbacks.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && callbacks.has(data.id)) {
        const { resolve } = callbacks.get(data.id);
        callbacks.delete(data.id);
        resolve(data.result);
      }
    };

    ws.onopen = async () => {
      try {
        await send('Page.enable');
        await send('Runtime.enable');
        await new Promise(r => setTimeout(r, 2000));

        // Đăng nhập tài khoản test1@gmail.com
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test1@gmail.com', password: '123456' })
        }).then(r => r.json());

        console.log('Login test1 result:', loginRes.success ? 'OK' : 'Failed');

        // Nạp session vào localStorage của trình duyệt
        await send('Runtime.evaluate', {
          expression: `
            localStorage.setItem('vivu_custom_session', JSON.stringify(${JSON.stringify(loginRes.session)}));
            localStorage.setItem('vivu_user_real_location', JSON.stringify({
              lat: 16.03878,
              lng: 108.21923,
              accuracy: 15,
              cityName: 'Đà Nẵng',
              source: 'gps',
              isFallback: false,
              timestamp: Date.now()
            }));
            window.location.reload();
          `
        });

        // Đợi app reload và fetch profiles (3.5s heartbeat)
        await new Promise(r => setTimeout(r, 4500));

        // Click nút Fit All Peers nếu có
        await send('Runtime.evaluate', {
          expression: `
            const btn = document.getElementById('btn-fit-all-peers');
            if (btn) btn.click();
          `
        });
        await new Promise(r => setTimeout(r, 1500));

        // Chụp ảnh màn hình bản đồ thể hiện cả 2 thiết bị
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        const outPath = 'C:\\Users\\DELL\\.gemini\\antigravity-ide\\brain\\7f0ef489-2f18-4682-807c-2c77ce8db969\\cross_device_map_verified.png';
        fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
        console.log('Screenshot saved to:', outPath);

        // Kiểm tra số lượng marker trên mapbox canvas DOM
        const markersEval = await send('Runtime.evaluate', {
          expression: `
            const markers = document.querySelectorAll('.vivu-teardrop-marker');
            const ownerMarker = document.querySelector('.owner-bubble-wrapper');
            Array.from(markers).map(m => m.textContent.trim());
          `,
          returnByValue: true
        });
        console.log('Detected markers text on DOM:', markersEval.result?.value);

        ws.close();
        chromeProcess.kill();
        process.exit(0);
      } catch (err) {
        console.error('Error during CDP script:', err);
        ws.close();
        chromeProcess.kill();
        process.exit(1);
      }
    };
  } catch (err) {
    console.error('Error:', err);
    chromeProcess.kill();
    process.exit(1);
  }
}

run();
