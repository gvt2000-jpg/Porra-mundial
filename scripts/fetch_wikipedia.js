const url = 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_qualification';
const res = await fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
});
const html = await res.text();
console.log('LENGTH', html.length);
const idx = html.indexOf('id="Qualified_teams"');
console.log('QUALIFIED TEAMS anchor index', idx);
if (idx >= 0) {
  const section = html.slice(idx, idx + 120000);
  console.log(section.slice(0, 1800));
  const flagPos = section.indexOf('flagicon');
  console.log('FLAGICON first pos', flagPos);
  if (flagPos >= 0) {
    console.log(section.slice(flagPos - 100, flagPos + 300));
  }
  const regex = /<th scope="row" data-sort-value="([^"]+)">([\s\S]*?)<\/th>/g;
  const teams = [];
  let m;
  while ((m = regex.exec(section)) !== null) {
    const sortValue = m[1].trim();
    const block = m[2];
    const labelMatch = block.match(/<a [^>]*>([^<]+)<\/a>/);
    const label = labelMatch ? labelMatch[1].trim() : null;
    teams.push({ sortValue, label });
    if (teams.length >= 120) break;
  }
  console.log('QUALIFIED TEAMS ROWS', teams.length);
  console.log(teams.slice(0, 80));
}
