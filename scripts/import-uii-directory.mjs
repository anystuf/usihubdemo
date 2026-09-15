import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Parse only quoted data fields; never execute scripts from the source website.
const source = 'https://uii.ueh.edu.vn/en/innovation-pathway/uii-incubation-program/startup-directory/';
const html = await fetch(source).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); });
const rows = [...html.matchAll(/\{\s*n:\s*"[^\r\n]+/g)].map(([line]) => {
  const fields = Object.fromEntries([...line.matchAll(/(\w+):\s*"([^"\r\n]*)"/g)].map(m => [m[1], m[2]]));
  return fields;
});
const excluded = rows.filter(r => !/^\d\/20\d{2}$/.test(r.b));
const records = rows.filter(r => /^\d\/20\d{2}$/.test(r.b));
if (!records.length || new Set(records.map(r => r.n)).size !== records.length) throw new Error('Empty or duplicate source records');
const assets = new URL('../public/assets/uii-startups/', import.meta.url);
await mkdir(assets, { recursive: true });
const startups = [];
for (const r of records) {
  const id = r.n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let logo = '';
  if (r.logo) {
    const url = new URL(r.logo);
    if (url.origin !== 'https://uii.ueh.edu.vn') throw new Error('Unexpected image host');
    const response = await fetch(url);
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`Logo failed: ${r.n}`);
    await writeFile(new URL(`${id}.png`, assets), Buffer.from(await response.arrayBuffer()));
    logo = `./assets/uii-startups/${id}.png`;
  }
  startups.push({ id, name: r.n, location: r.l, description: r.d, cohort: r.b, industry: r.i, investmentStage: r.stage, logo, logoSource: r.logo, profileUrl: r.url === '#' ? '' : r.url });
}
const output = { source, retrievedAt: new Date().toISOString(), excluded: excluded.map(r => ({ name: r.n, reason: 'No UII-format cohort; affiliation not established by this directory entry.' })), startups };
await writeFile(new URL('../public/data/uiiDirectory.js', import.meta.url), `// Public UII directory snapshot. Refresh with node scripts/import-uii-directory.mjs\nexport const uiiDirectory = ${JSON.stringify(output, null, 2)};\n`);
console.log(`${startups.length} profiles; ${startups.filter(s => s.logo).length} logos; ${excluded.length} excluded. Assets: ${fileURLToPath(assets)}`);
