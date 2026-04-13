const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3010;
const BASE = __dirname;

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
};

const server = http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  if (url === '/' || url === '') url = '/kreathur-all-in-one.html';

  const filePath = path.join(BASE, url);
  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Try index.html fallback
      if (url !== '/kreathur-all-in-one.html') {
        const fallback = path.join(BASE, 'kreathur-all-in-one.html');
        fs.readFile(fallback, (err2, data2) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(data2);
          }
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
      return;
    }
    const contentType = MIME[ext] || 'application/octet-stream';
    const charset = contentType.startsWith('text/') ? '; charset=utf-8' : '';
    res.writeHead(200, {
      'Content-Type': contentType + charset,
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  KREATHUR AGENCY — Server running`);
  console.log(`  http://localhost:${PORT}\n`);
});
