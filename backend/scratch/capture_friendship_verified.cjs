const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9255;
const tmpDir = path.join(os.tmpdir(), 'chrome-cdp-friends-' + Date.now());

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
        await new Promise(r => setTimeout(r, 1500));

        // Đăng nhập tài khoản test1@gmail.com
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test1@gmail.com', password: '123456' })
        }).then(r => r.json());

        const sessionObj = {
          user: {
            id: loginRes.user.id,
            email: loginRes.user.email,
            user_metadata: {
              full_name: loginRes.user.full_name,
              avatar_url: loginRes.user.avatar_url,
              user_code: loginRes.user.user_code
            }
          },
          access_token: loginRes.session?.access_token || `vivu-tok-${loginRes.user.id}`
        };

        // Nạp session vào localStorage của trình duyệt
        await send('Runtime.evaluate', {
          expression: `
            localStorage.setItem('vivu_local_auth_session', JSON.stringify(${JSON.stringify(sessionObj)}));
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

        // Đợi app reload và fetch bạn bè từ server (3.5s)
        await new Promise(r => setTimeout(r, 4500));

        // Click chuyển sang Tab "Bạn Bè" ở dock bên dưới
        await send('Runtime.evaluate', {
          expression: `
            const buttons = Array.from(document.querySelectorAll('button'));
            const friendsBtn = buttons.find(b => b.textContent && b.textContent.includes('Bạn Bè'));
            if (friendsBtn) friendsBtn.click();
          `
        });
        await new Promise(r => setTimeout(r, 2000));

        // Chụp ảnh màn hình Tab Bạn Bè
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        const outPath = 'C:\\Users\\DELL\\.gemini\\antigravity-ide\\brain\\7f0ef489-2f18-4682-807c-2c77ce8db969\\friendship_verified_tab.png';
        fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
        console.log('Friends Tab Screenshot saved to:', outPath);

        // Kiểm tra danh sách marker
        const markersEval = await send('Runtime.evaluate', {
          expression: `
            const markers = document.querySelectorAll('.vivu-teardrop-marker');
            Array.from(markers).map(m => m.textContent.trim());
          `,
          returnByValue: true
        });
        console.log('Markers on Friends Tab:', markersEval.result?.value);

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
