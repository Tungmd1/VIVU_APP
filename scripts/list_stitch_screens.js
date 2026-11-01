const https = require('https');
const data = JSON.stringify({
  jsonrpc: '2.0',
  id: 10,
  method: 'tools/call',
  params: {
    name: 'list_screens',
    arguments: {
      projectId: '17179307997863714599'
    }
  }
});
const req = https.request('https://stitch.googleapis.com/mcp', {
  method: 'POST',
  headers: {
    'X-Goog-Api-Key': process.env.STITCH_API_KEY || '',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const json = JSON.parse(body);
    const content = JSON.parse(json.result.content[0].text);
    console.log('DANH SÁCH MÀN HÌNH STITCH VIVU:');
    (content.screens || []).forEach((s, idx) => {
      const screenId = s.name.split('/').pop();
      console.log((idx + 1) + '. ' + s.title + ' -> ' + screenId);
    });
  });
});
req.write(data);
req.end();

