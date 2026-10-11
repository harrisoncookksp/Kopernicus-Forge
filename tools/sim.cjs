const fs=require('fs');
// needs Playwright: npm i -g playwright && npx playwright install chromium
const path = require('path');
let chromium; try { ({ chromium } = require('playwright')); } catch(e) { ({ chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright')); }
const GAME = 'file://' + path.resolve(__dirname, '..', 'index.html');
const OUTDIR = path.resolve(__dirname, 'out'); require('fs').mkdirSync(OUTDIR, {recursive:true});
const html=fs.readFileSync(path.resolve(__dirname, '..', 'index.html'),'utf8').replace('setInterval(tick, 100);','');
fs.writeFileSync(path.join(OUTDIR,'simgame.html'),html);
const [HOURS, STALL] = [+process.argv[2], +process.argv[3]||300];
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage();
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file://'+path.join(OUTDIR,'simgame.html'));
  const out=await p.evaluate(([H,STALL])=>{
    drawCell=()=>{}; floatText=()=>{}; burst=()=>{}; showCombo=()=>{}; toast=()=>{}; render=()=>{}; save=()=>{}; closePane=()=>{};
    modal=o=>{ o.onOk&&o.onOk(); return document.createElement('div'); };
    dropStormItem=()=>{ if(Math.random()<.6){ addMagnets(stormGain()); S.qstat.storm++; } };
    dropFalling=(i,f)=>{ if(Math.random()<.6) f(); };
    Math.random=(()=>{let s=1;return()=>(s=(s*16807)%2147483647)/2147483647})();
    S.muted=true;
    const log=[], marks=[20,50,80,97,110,120,130,140], xm=[10.3,15,20,30,40,50,60,70,80]; let t=0,mt=0,bt=0,ct=0,lastNew=0,lastBest=S.runBest,runs=0;
    const h=()=>(t/3600).toFixed(1)+'h';
    function cheapest(defs,key,cur,slack=0){ for(let k=0;k<60;k++){ let best=null,bc=Infinity;
        for(const u of defs){const l=S[key][u.id]; if(blocked(u,l))continue; const c=costL(u,l); if(c<=walletL(cur)-slack&&c<bc){bc=c;best=u}}
        if(!best)break; buy(best,key); } }
    function buyAll(){
      if(S.stars<10 && S.gs >= starPriceL(S.stars)){ buyStar(); log.push(`      star ${S.stars} at ${h()}`); }
      const saveMag = TREE.some(([x,nodes])=>starX()>=x && nodes.some(n=>!S.tree[n[0]] && n[1]==='mag'));
      if(S.stars>=10 && !saveMag) for(let k=0;k<50 && canStarUp(weakestStar());k++) upStar(weakestStar());
      while(xm.length && starX()>=xm[0]) log.push(`      x${xm.shift()} stars at ${h()}`);
      for(const [x,nodes] of TREE) if(starX()>=x) for(const n of nodes) if(!S.tree[n[0]] && have(n[1],n[2])) { buyTree(n[0]); log.push(`        tree ${n[0]} at ${h()}`); }
      if(starX()>=BRICK_STARS && S.level>=spendReq()+3){ S.level=1; S.xp=0; S.brickSpends++; }
      cheapest(UPG,'up','scrap'); if(!saveMag) cheapest(MUPG,'mup','mag'); cheapest(BUPG,'bup','brick'); cheapest(GUPG,'gup','gold',1);
      if(questsOpen()){ fillQuests(); S.quests.forEach((q,i)=>{ if(q.start==null) questAct(i,'start'); else if(qProg(q)>=q.need) questAct(i,'claim'); }); }
      if(T('t75a')) while(S.beams>=S.yard3*2){ S.beams-=S.yard3; if(++S.yard3Taps>=10){S.yard3Taps=0;S.yard3++;} }
    }
    while(t<H*3600){
      step(0.25); t+=0.25; mt+=0.25; bt+=0.25; ct+=0.25;
      if(mt>=0.5){mt=0;autoMerge();}
      if(bt>=5){bt=0;buyAll();}
      // convert the lowest barrel when the board is full (a player farming fragments)
      if(ct>=3 && S.stars>=10){ ct=0; if(!S.grid.includes(0)){ let lo=0; S.grid.forEach((x,i)=>{ if(x<S.grid[lo]) lo=i; }); convertBarrel(lo); } }
      if(S.runBest>lastBest){lastBest=S.runBest;lastNew=t;}
      while(marks.length && S.best>=marks[0]) log.push(`${h()} first barrel #${marks.shift()}`);
      if(t-lastNew>STALL && pendingL()>=0){ runs++; const before=S.runBest; prestige(); S.muted=true; lastBest=S.runBest; lastNew=t;
        if(runs%10==0) log.push(`   prestige ${runs} at ${h()} best ${before} gs ${fmtL(S.gs)} x${fmtX()} frags ${S.frags.toFixed(1)} mag ${S.magnets} beams ${S.beams}`); }
    }
    log.push(`end ${h()} best ${S.best}, prestiges ${runs}, x${fmtX()} stars, level ${S.level}, magnets ${S.magnets}, frags ${S.frags.toFixed(1)}, beams ${S.beams}, tree ${Object.keys(S.tree).length}, yard ${S.yard}/${S.yard3}, bup ${JSON.stringify(S.bup)}`);
    return log;
  },[HOURS,STALL]);
  console.log(out.join('\n')); await b.close();
})();
