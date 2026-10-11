// needs Playwright: npm i -g playwright && npx playwright install chromium
const path = require('path');
let chromium; try { ({ chromium } = require('playwright')); } catch(e) { ({ chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright')); }
const GAME = 'file://' + path.resolve(__dirname, '..', 'index.html');
const OUTDIR = path.resolve(__dirname, 'out'); require('fs').mkdirSync(OUTDIR, {recursive:true});
(async()=>{ const b=await chromium.launch();
 for (const scheme of ['light','dark']) {
  const p=await b.newPage({viewport:{width:420,height:880}, colorScheme:scheme});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(GAME); await p.waitForTimeout(400);
  await p.evaluate(()=>{ S.grid=[21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,37,49,50]; S.best=50; S.runBest=50; S.stars=3; S.gs=Math.log10(6200); S.scrap=12; S.runScrap=12; cells.forEach(c=>c._t=-1); drawGrid(false); });
  // drag-hover to show matches
  const a=await p.locator('.cell').nth(16).boundingBox();
  await p.mouse.move(a.x+a.width/2,a.y+a.height/2); await p.mouse.down(); await p.mouse.move(a.x+a.width/2+30,a.y+a.height/2-60,{steps:5});
  await p.waitForTimeout(200); await p.screenshot({path:`u-board-${scheme}.png`});
  console.log(scheme,'matches lit:', await p.locator('.cell.match').count());
  const c=await p.locator('.cell').nth(17).boundingBox(); await p.mouse.move(c.x+c.width/2,c.y+c.height/2,{steps:5}); await p.mouse.up();
  console.log('merged ->', await p.evaluate(()=>[S.grid[16],S.grid[17]]));
  await p.click('.dock button[data-pane=gold]'); await p.waitForTimeout(400); await p.screenshot({path:`u-gold-${scheme}.png`});
  await p.click('#ptabs button[data-ptab=star]'); await p.click('#upstars'); await p.click('.modal .ok'); await p.click('.modal .x'); console.log('stars', await p.evaluate(()=>[S.stars, S.gs]));
  await p.click('.dock button[data-pane=col]'); await p.waitForTimeout(300); await p.locator('.card').nth(28).click(); await p.waitForTimeout(300);
  await p.screenshot({path:`u-detail-${scheme}.png`});
  await p.locator('.modal .ok').click();
  await p.evaluate(()=>{S.scrap=Math.log10(5e6)}); await p.click('.dock button[data-pane=up]'); await p.click('#bulk'); await p.locator('#ups .buy').nth(0).click();
  console.log('buy max faster barrels lvl', await p.evaluate(()=>S.up.spawn));
  await p.screenshot({path:`u-up-${scheme}.png`});
  console.log('errors', errs); await p.close(); }
 await b.close(); })();
