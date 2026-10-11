// needs Playwright: npm i -g playwright && npx playwright install chromium
const path = require('path');
let chromium; try { ({ chromium } = require('playwright')); } catch(e) { ({ chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright')); }
const GAME = 'file://' + path.resolve(__dirname, '..', 'index.html');
const OUTDIR = path.resolve(__dirname, 'out'); require('fs').mkdirSync(OUTDIR, {recursive:true});
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:412,height:890}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(GAME); await p.waitForTimeout(400);
  // star 10 resets level, then upgrade
  await p.evaluate(()=>{ S.stars=9; S.gs=Math.log10(3e6); S.level=7; buyStar(); });
  console.log('after 10th star', await p.evaluate(()=>[S.stars, S.level, S.starLv.join(), fmtX(), starBoostL()]));
  await p.evaluate(()=>{ S.gs=Math.log10(1e9); S.magnets=500; S.frags=10; });
  await p.click('.dock button[data-pane=gold]'); await p.click('#ptabs button[data-ptab=star]'); await p.click('#upstars'); await p.waitForTimeout(200);
  await p.screenshot({path:path.join(OUTDIR,'e-stars.png')});
  await p.locator('.modal .st.up').nth(3).click(); await p.waitForTimeout(100);
  await p.locator('.modal .ok').click(); await p.waitForTimeout(100);
  console.log('star ups', await p.evaluate(()=>[S.starLv.join(), fmtX(), S.magnets, S.frags, fmtS(S.gs,7)]));
  await p.screenshot({path:path.join(OUTDIR,'e-stars2.png')});
  await p.locator('.modal .x').click(); await p.click('#close');
  // double-tap convert
  await p.evaluate(()=>{ S.grid[0]=80; cells[0]._t=-1; drawCell(0); S.frags=0; });
  const c = p.locator('.cell').nth(0); await c.click(); await c.click(); await p.waitForTimeout(150);
  await p.screenshot({path:path.join(OUTDIR,'e-convert.png')});
  await p.locator('.modal .ok').click();
  console.log('converted', await p.evaluate(()=>[S.grid[0], S.frags, S.qstat.converts]));
  // tree
  await p.evaluate(()=>{ S.starLv=Array(10).fill(100); S.frags=5000; S.magnets=100000; S.beams=8000; S.gs=Math.log10(1e12); });
  await p.click('.dock button[data-pane=up]'); await p.click('#utabs button[data-utab=tree]'); await p.waitForTimeout(200);
  await p.screenshot({path:path.join(OUTDIR,'e-tree.png')});
  const n = await p.locator('#tree .upg .buy').count();
  for(let i=0;i<n;i++){ const bt=p.locator('#tree .upg .buy').nth(i); if(await bt.isEnabled()) await bt.click(); }
  console.log('tree owned', await p.evaluate(()=>[Object.keys(S.tree).length, S.frags, S.magnets, S.beams, spendReq(), fmtS(brickRateL()), magMult(), beamYield()]));
  await p.screenshot({path:path.join(OUTDIR,'e-tree2.png'), fullPage:false});
  await p.click('#close');
  // beams fall
  await p.evaluate(()=>{ S.beamT=59.95; });
  await p.waitForTimeout(400);
  const before = await p.evaluate(()=>S.beams);
  await p.locator('#storm .sitem').first().dispatchEvent('pointerdown');
  console.log('beam catch', before, await p.evaluate(()=>S.beams));
  // yard v3
  await p.click('.dock button[data-pane=gold]'); await p.click('#ptabs button[data-ptab=yard]'); await p.click('#yardsw button[data-yv="1"]');
  for(let i=0;i<10;i++) await p.click('#yardpile');
  console.log('yard3', await p.evaluate(()=>[S.yard3, S.yard3Taps, S.beams, magMult()]));
  await p.screenshot({path:path.join(OUTDIR,'e-yard3.png')});
  // quests
  await p.click('#ptabs button[data-ptab=quest]'); await p.waitForTimeout(200);
  await p.locator('#quests .quest .buy[data-a=start]').first().click();
  await p.evaluate(()=>{ const q=S.quests[0]; S.qstat[q.k]+=q.need; });
  await p.waitForTimeout(200);
  const mb = await p.evaluate(()=>S.magnets);
  await p.locator('#quests .quest').first().locator('.buy[data-a=claim]').click();
  console.log('quest claim', mb, await p.evaluate(()=>S.magnets));
  await p.screenshot({path:path.join(OUTDIR,'e-quest.png')});
  // prestige keeps it all
  await p.evaluate(()=>{ S.runBest=60; S.runScrap=12; });
  await p.click('#ptabs button[data-ptab=gs]'); await p.click('#prestige'); await p.locator('.modal .ok').click();
  console.log('post prestige', await p.evaluate(()=>[S.starLv[0], Object.keys(S.tree).length, S.beams, S.yard3, S.level, S.grid.filter(Boolean).length]));
  // reload persists
  await p.evaluate(()=>save()); await p.reload(); await p.waitForTimeout(300);
  console.log('reload', await p.evaluate(()=>[S.starLv[0], Object.keys(S.tree).length, S.quests.length]));
  // old save migration
  await p.evaluate(()=>{ const d=JSON.parse(localStorage.getItem(SAVE_KEY)); d.stars=14; d.starLv=[]; localStorage.setItem(SAVE_KEY, JSON.stringify(d)); });
  await p.reload(); await p.waitForTimeout(300);
  console.log('migrate', await p.evaluate(()=>[S.stars, S.starLv.join(), fmtX()]));
  console.log('errors', errs); await b.close(); })();
