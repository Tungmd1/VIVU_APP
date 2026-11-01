const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9260;
const tmpDir = path.join(os.tmpdir(), 'chrome-cdp-unified-story-' + Date.now());

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

        // 1. Đăng nhập tài khoản test1@gmail.com
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

        // 2. Nạp session vào localStorage của trình duyệt
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

        // 3. Đợi app reload và đồng bộ heartbeat/stories (5.5s)
        console.log('⏳ Đang đợi Mapbox tải canvas và đồng bộ heartbeat...');
        await new Promise(r => setTimeout(r, 5500));

        // 4. Phân tích các markers trên canvas
        const evalResult = await send('Runtime.evaluate', {
          expression: `
            (() => {
              const markers = Array.from(document.querySelectorAll('.vivu-teardrop-marker'));
              const test2Markers = markers.filter(m => {
                const text = m.textContent || '';
                return text.includes('Test2') || text.includes('VU-9252');
              });

              return {
                totalMarkers: markers.length,
                test2Count: test2Markers.length,
                details: test2Markers.map(m => ({
                  text: m.innerText.replace(/\\n+/g, ' | '),
                  hasStoryRing: m.innerHTML.includes('from-pink-500'),
                  hasBubbleBtn: Boolean(m.querySelector('#btn-view-story-bubble')),
                  hasHeartBtn: Boolean(m.querySelector('#btn-quick-react'))
                }))
              };
            })()
          `,
          returnByValue: true
        });

        const analysis = evalResult.result?.value;
        console.log('📊 KẾT QUẢ KIỂM TRA MARKERS:');
        console.log(`   - Tổng số markers trên map: ${analysis?.totalMarkers}`);
        console.log(`   - Số lượng giọt nước của Test2: ${analysis?.test2Count}`);
        console.log('   - Chi tiết:', JSON.stringify(analysis?.details, null, 2));

        if (analysis?.test2Count === 1) {
          console.log('🎉 XÁC NHẬN: Test2 CHỈ CÓ 1 GIỌT NƯỚC DUY NHẤT (Rule 30 thành công 100%)!');
        } else {
          console.warn(`⚠️ CẢNH BÁO: Test2 vẫn có ${analysis?.test2Count} giọt nước!`);
        }

        // Đưa camera về tầm nhìn cận cảnh bao trọn cả Bạn và Test2
        await send('Runtime.evaluate', {
          expression: `
            if (window.__vivu_map) {
              window.__vivu_map.flyTo({ center: [108.21925, 16.03875], zoom: 17.2, pitch: 35, duration: 500 });
            }
          `
        });
        await new Promise(r => setTimeout(r, 1500));

        // 5. Chụp ảnh màn hình lưu vào artifact
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        const outPath = 'C:\\Users\\DELL\\.gemini\\antigravity-ide\\brain\\7f0ef489-2f18-4682-807c-2c77ce8db969\\unified_story_verified.png';
        fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
        console.log('📸 Screenshot saved to:', outPath);

        // 6. Test Dual-Click: Click vào Story Bubble
        console.log('🧪 Thử nghiệm click vào Bong bóng Story...');
        await send('Runtime.evaluate', {
          expression: `
            const bubble = document.querySelector('#btn-view-story-bubble');
            if (bubble) bubble.click();
          `
        });
        await new Promise(r => setTimeout(r, 1200));

        // Kiểm tra xem Modal Story có mở không
        const modalEval = await send('Runtime.evaluate', {
          expression: `
            document.body.innerText.includes('Đừng Làm Trái Tim Anh Đau') || document.body.innerText.includes('10 Điểm Ko Nhưng')
          `,
          returnByValue: true
        });
        console.log(`   - Trạng thái Modal Story: ${modalEval.result?.value ? '✅ ĐÃ MỞ THÀNH CÔNG!' : 'Chưa bật modal'}`);

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
