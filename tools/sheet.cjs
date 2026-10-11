// needs Playwright: npm i -g playwright && npx playwright install chromium
const path = require('path');
let chromium; try { ({ chromium } = require('playwright')); } catch(e) { ({ chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright')); }
const GAME = 'file://' + path.resolve(__dirname, '..', 'index.html');
const OUTDIR = path.resolve(__dirname, 'out'); require('fs').mkdirSync(OUTDIR, {recursive:true});
const FROM=+process.argv[2]||111, OUT=process.argv[3]||'big6.png';
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1300,height:900}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
  await p.goto(GAME); await p.waitForTimeout(400);
  await p.evaluate((FROM)=>{ document.getElementById('app').style.display='none'; document.body.insertAdjacentHTML('beforeend','<div id="sheetx" style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;padding:10px;background:#3f5a3a"></div>');
    const g=document.getElementById('sheetx'); for(let t=FROM;t<=Math.min(MAX,FROM+14);t++){const d=document.createElement('div');d.style.cssText='background:#4c6b45;border-radius:4px;padding:6px;font:13px sans-serif;color:#fff;text-align:center';d.innerHTML=`<div style="width:200px;height:200px;margin:auto">${svgFor(t)}</div>#${t} ${nameOf(t)}`;g.appendChild(d);} }, FROM);
  await p.waitForTimeout(300); await p.screenshot({path:path.join(OUTDIR,OUT),fullPage:true});
  console.log('MAX', await p.evaluate(()=>MAX), 'errors', errs); await b.close(); })();
