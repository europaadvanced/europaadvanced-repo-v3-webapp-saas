// Inserts <base href="/ga-tenders/"> into public/ga-tenders/index.html
const fs = require('fs');
const path = require('path');

const target = path.join(process.cwd(), 'public', 'ga-tenders', 'index.html');

try {
  if (!fs.existsSync(target)) {
    console.log('[inject-base] skip: file not found:', target);
    process.exit(0);
  }

  let html = fs.readFileSync(target, 'utf8');

  // If a <base> already exists, do nothing
  if (/<base\s[^>]*href=/i.test(html)) {
    console.log('[inject-base] base tag already present');
    process.exit(0);
  }

  // Insert immediately after <head>
  html = html.replace(/<head([^>]*)>/i, '<head$1><base href="/ga-tenders/">');

  fs.writeFileSync(target, html);
  console.log('[inject-base] base tag inserted');
} catch (err) {
  console.error('[inject-base] error:', err);
  // Don’t hard-fail your build
  process.exit(0);
}
