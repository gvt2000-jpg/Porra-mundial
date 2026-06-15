const fs = require('fs');
const url = 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup';
(async () => {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const start = html.indexOf('<h2 id="Match_schedule">');
  console.log('start', start);
  if (start < 0) return;
  const end = html.indexOf('<h2', start + 1);
  const section = html.slice(start, end > 0 ? end : start + 80000);
  fs.writeFileSync('scripts/match_schedule_html.txt', section, 'utf8');
  console.log('wrote', section.length);
})();
