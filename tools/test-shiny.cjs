// needs Playwright: npm i -g playwright && npx playwright install chromium
const path = require('path');
let chromium; try { ({ chromium } = require('playwright')); } catch(e) { ({ chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright')); }
const GAME = 'file://' + path.resolve(__dirname, '..', 'index.html');
const OUTDIR = path.resolve(__dirname, 'out'); require('fs').mkdirSync(OUTDIR, {recursive:true});
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:890}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(GAME); await p.waitForTimeout(400);
  await p.evaluate(()=>{ S.grid=[118,118,5,5,6,6,7,7,8,8,0,0,0,0,0,0,0,0,0,0]; S.shiny=Array(20).fill(0); S.shiny[0]=1; S.shiny[1]=1; addShiny(118); S.best=140; cells.forEach(c=>c._t=-1); drawGrid(false); });
  const p0 = await p.evaluate(()=>prodL());
  // manual merges quickly -> combo
  const cell = i => p.locator('.cell').nth(i);
  for(const [a,b2] of [[0,1],[2,3],[4,5],[6,7],[8,9]]){ await cell(a).dragTo(cell(b2)); }
  await p.waitForTimeout(100);
  console.log('after', await p.evaluate(()=>[S.grid.slice(0,10).join(), S.shiny.slice(0,10).join(), S.shinyBook.join(), S.bestCombo, S.magnets]), 'prod before', p0.toFixed(2));
  await p.screenshot({path:path.join(OUTDIR,'shiny-board.png')});
  // forced shiny spawn
  await p.evaluate(()=>{ Math.random=()=>0.001; spawnOne(); Math.random=()=>0.5; });
  console.log('spawned shiny', await p.evaluate(()=>[S.shiny.filter(Boolean).length, S.shinies]));
  await p.click('.dock button[data-pane=col]'); await p.waitForTimeout(300);
  await p.locator('#book .card').nth(110).scrollIntoViewIfNeeded(); await p.waitForTimeout(150);
  await p.screenshot({path:path.join(OUTDIR,'shiny-book.png')});
  await p.click('#close');
  await p.click('.dock button[data-pane=up]'); await p.click('#utabs button[data-utab=mag]'); await p.waitForTimeout(200);
  await p.screenshot({path:path.join(OUTDIR,'shiny-mups.png')});
  console.log('errors', errs); await b.close(); })();
