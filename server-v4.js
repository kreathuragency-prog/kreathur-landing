const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3099;
const BASE = __dirname;
const MIME = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.svg':'image/svg+xml','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2'};
const server = http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  if (url === '/' || url === '') url = '/index-v4.html';
  const filePath = path.join(BASE, url);
  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404,{'Content-Type':'text/plain'}); res.end('404'); return; }
    const ct = MIME[ext] || 'application/octet-stream';
    const charset = ct.startsWith('text/') ? '; charset=utf-8' : '';
    res.writeHead(200, {'Content-Type': ct + charset, 'Cache-Control': 'no-cache'});
    res.end(data);
  });
});
server.listen(PORT, () => { console.log(`Kreathur V4 on http://localhost:${PORT}`); });
