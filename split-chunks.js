const fs = require('fs');
const content = fs.readFileSync('index-inline.html', 'utf8');
const b64 = Buffer.from(content).toString('base64');
const chunkSize = 8000;
const chunks = [];
for (let i = 0; i < b64.length; i += chunkSize) {
  chunks.push(b64.substring(i, i + chunkSize));
}
for (let i = 0; i < chunks.length; i++) {
  fs.writeFileSync('b64_' + i + '.txt', chunks[i]);
}
console.log(chunks.length + ' b64 chunks created, total: ' + b64.length);
