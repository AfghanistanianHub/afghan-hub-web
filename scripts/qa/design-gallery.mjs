import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
const dir='reports/visual';
if (!existsSync(dir)) process.exit(0);
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const report=existsSync(`${dir}/layout-checks-after.json`)?JSON.parse(readFileSync(`${dir}/layout-checks-after.json`,'utf8')):null;
const files=readdirSync(dir).filter(file=>file.endsWith('.jpg')).sort();
const groups=[...new Set(files.map(file=>file.replace(/-(before|after)-(1440|768|390|320)\.jpg$/,'')))];
const cards=groups.map(label=>`<section><h2>${escape(label)}</h2>${[1440,768,390,320].map(width=>`<h3>${width}px</h3><div class="pair">${['before','after'].map(phase=>{const file=`${label}-${phase}-${width}.jpg`;return files.includes(file)?`<figure><figcaption>${phase} · ${width}px · ${escape(phase==='before'?process.env.LOCAL_QA_COMPARE_SHA:report?.sourceRevision??'unknown')}</figcaption><a href="${file}"><img loading="lazy" src="${file}" alt="${escape(label)} ${phase} at ${width}px"></a></figure>`:'<p>Capture unavailable</p>';}).join('')}</div>`).join('')}</section>`).join('');
writeFileSync(`${dir}/index.html`,`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Afghan Hub design review</title><style>body{font:16px/1.5 system-ui;margin:24px;color:#302b35;background:#f8f5ee}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{margin:0;min-width:0}img{width:100%;height:auto;border:1px solid #d9d2c6}figcaption{overflow-wrap:anywhere;font-size:12px}section{border-top:1px solid #d9d2c6;margin-top:32px}a{color:#624291}@media(max-width:600px){.pair{grid-template-columns:1fr}}</style><h1>Afghan Hub cross-page review</h1><p>Real disposable loopback accounts. 100% zoom, DPR 1. Each capture names its source revision. Missing captures are unverified.</p><p><a href="layout-checks-after.json">Layout findings</a></p>${cards}</html>`);
console.log(`Gallery: ${files.length} images; ${groups.length} surfaces`);
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const dir=process.env.LOCAL_QA_VISUAL_DIR ?? 'reports/visual';
if (!existsSync(dir)) { console.log('No visual evidence captured; gallery not created.'); process.exit(0); }
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const reportFile=join(dir,'layout-checks-after.json');
const report=existsSync(reportFile)?JSON.parse(readFileSync(reportFile,'utf8')):null;
const files=readdirSync(dir).filter(file=>/^[a-z0-9-]+\.png$/.test(file));
const pairs=new Map();
for(const file of files) {
 const match=file.match(/^(.*)-(before|after)-(\d+)\.png$/);
 if (!match) continue;
 const [,label,phase,width]=match, key=`${label}-${width}`;
 const pair=pairs.get(key)??{label,width};pair[phase]=file;pairs.set(key,pair);
}
const baseline='dad64a27c09aebb32651149b5e33f8bf2534703f';
const cards=[...pairs.values()].sort((a,b)=>a.label.localeCompare(b.label)||Number(b.width)-Number(a.width)).map(pair=>`<section data-width="${escape(pair.width)}"><h2>${escape(pair.label)} · ${escape(pair.width)}px</h2><div class="pair">${['before','after'].map(phase=>`<figure><figcaption>${phase} · <code>${escape(phase==='before'?baseline:report?.sourceRevision??'source unavailable')}</code></figcaption>${pair[phase]?`<a href="${escape(pair[phase])}"><img loading="lazy" src="${escape(pair[phase])}" alt="${escape(pair.label)} ${phase} at ${escape(pair.width)} pixels"></a>`:'<p>Not captured</p>'}</figure>`).join('')}</div></section>`).join('');
writeFileSync(join(dir,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Afghan Hub design review</title><style>body{margin:0 auto;padding:24px;max-width:1500px;background:#f8f5ee;color:#302b35;font:16px/1.5 system-ui}h1{font-size:28px}code{overflow-wrap:anywhere;font-size:12px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{margin:0;min-width:0}img{width:100%;height:auto;border:1px solid #d9d2c6}section{border-top:1px solid #d9d2c6;margin-top:32px;padding-top:16px}label{display:inline-block;margin:8px}select{font:inherit;padding:8px}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><h1>Afghan Hub · source-tagged design review</h1><p>Real isolated browser captures. Viewport widths 1440, 768, 390 and 320; DPR 1; 100% zoom. Missing captures remain marked. This gallery is evidence for the revisions printed beside each image.</p><p>${report?'Layout report captured.':'Layout scenario did not complete; captures may be partial.'} <a href="layout-checks-after.json">Layout and keyboard observations</a></p><label>Viewport <select id="width"><option value="all">All</option>${[1440,768,390,320].map(width=>`<option>${width}</option>`).join('')}</select></label>${cards}<script>document.querySelector('#width').addEventListener('change',event=>{document.querySelectorAll('section').forEach(section=>section.hidden=event.target.value!=='all'&&section.dataset.width!==event.target.value)})</script></html>`);
console.log(`Gallery created: ${pairs.size} image groups; ${report?'complete layout report':'partial evidence'}.`);
