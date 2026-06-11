<<<<<<< HEAD
const url = 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup';
(async () => {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const find = ['id="Match_schedule"', 'id="Group_stage"'];
  for (const term of find) {
    const idx = html.indexOf(term);
    console.log('term', term, 'idx', idx);
    if (idx >= 0) {
      const end = html.indexOf('<h2', idx + 1)
      console.log('--- snippet ---')
      console.log(html.slice(idx, end > 0 ? end : idx + 25000).replace(/\n/g, ' '))
    }
  }
})();
=======
const url = 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup';
(async () => {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const find = ['id="Match_schedule"', 'id="Group_stage"'];
  for (const term of find) {
    const idx = html.indexOf(term);
    console.log('term', term, 'idx', idx);
    if (idx >= 0) {
      const end = html.indexOf('<h2', idx + 1)
      console.log('--- snippet ---')
      console.log(html.slice(idx, end > 0 ? end : idx + 25000).replace(/\n/g, ' '))
    }
  }
})();
>>>>>>> f84f3f17b3d1d09e667e64e5fdd030f9dd1d3ae4
