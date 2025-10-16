// Inserts <base href="/ga-tenders/"> into public/ga-tenders/index.html
const fs = require('fs');
const p = 'public/ga-tenders/index.html';
if (fs.existsSync(p)) {
  let html = fs.readFileSync(p, 'utf8');
  if (!html.includes('<base ')) {
    html = html.replace('<head>', '<head><base href="/ga-tenders/">');
    fs.writeFileSync(p, html);
  }
}
