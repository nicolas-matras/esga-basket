// Decompacte un bundle Claude Design : template (DOM), manifest (assets), donnees de demo
import fs from 'node:fs';
import zlib from 'node:zlib';

const chemin = process.argv[2];
const sortie = process.argv[3];
const brut = fs.readFileSync(chemin, 'utf8');

function extraireScript(type) {
  const re = new RegExp(`<script[^>]*type="${type}"[^>]*>([\\s\\S]*?)</script>`, 'i');
  const m = brut.match(re);
  return m ? m[1] : null;
}

fs.mkdirSync(sortie, { recursive: true });

// 1. Template : chaine JSON contenant tout le DOM
const tpl = extraireScript('__bundler/template');
if (tpl) {
  let dom;
  try { dom = JSON.parse(tpl.trim()); } catch { dom = tpl.trim(); }
  if (typeof dom !== 'string') dom = JSON.stringify(dom, null, 2);
  fs.writeFileSync(`${sortie}/dom.html`, dom);
  console.log(`dom.html : ${dom.length} caracteres`);
}

// 2. Manifest : assets en base64, parfois gzip
const man = extraireScript('__bundler/manifest');
if (man) {
  const manifest = JSON.parse(man.trim());
  fs.writeFileSync(`${sortie}/manifest.json`, JSON.stringify(manifest, null, 2));
  const entrees = Array.isArray(manifest) ? manifest : Object.entries(manifest).map(([k, v]) => ({ path: k, ...v }));
  console.log(`manifest : ${entrees.length} entrees`);
  fs.mkdirSync(`${sortie}/assets`, { recursive: true });
  for (const e of entrees) {
    const nom = (e.path || e.name || 'sans-nom').replace(/[\/]/g, '_');
    const donnees = e.content ?? e.data ?? e.base64;
    if (typeof donnees !== 'string') { console.log(`  ! ${nom} : pas de contenu`); continue; }
    let buf = Buffer.from(donnees, 'base64');
    if (e.compressed === true) {
      try { buf = zlib.gunzipSync(buf); } catch (err) { console.log(`  ! ${nom} : gunzip echoue (${err.code})`); }
    }
    fs.writeFileSync(`${sortie}/assets/${nom}`, buf);
    console.log(`  ${nom} : ${buf.length} octets  type=${e.type || e.mimeType || '?'}  compressed=${!!e.compressed}`);
  }
}

// 3. Donnees de demo
const dc = extraireScript('text/x-dc');
if (dc) { fs.writeFileSync(`${sortie}/demo.txt`, dc.trim()); console.log(`demo.txt : ${dc.trim().length} caracteres`); }

// 4. Ressources externes + ordre des pages
for (const t of ['__bundler/ext_resources', '__bundler/page_order']) {
  const s = extraireScript(t);
  if (s) { const f = t.split('/')[1]; fs.writeFileSync(`${sortie}/${f}.json`, s.trim()); console.log(`${f}.json : ${s.trim().slice(0, 400)}`); }
}
