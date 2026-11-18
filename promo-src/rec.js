// Full-res (1080x1920) capture: page time is slowed 5x, every frame is a real DPR-3 screenshot.
const { chromium } = require('playwright'); const fs = require('fs');
const R = process.argv[2], only = process.argv[3] || '', RATE = 0.2;
const SLOW = `(()=>{const RATE=${RATE};const rn=performance.now.bind(performance),t0=rn(),d0=Date.now();
  performance.now=()=>t0+(rn()-t0)*RATE; Date.now=()=>d0+(rn()-t0)*RATE;
  const raf=window.requestAnimationFrame.bind(window); window.requestAnimationFrame=cb=>raf(()=>cb(performance.now()));
  const st=window.setTimeout, si=window.setInterval; window.setTimeout=(f,ms,...a)=>st(f,(ms||0)/RATE,...a); window.setInterval=(f,ms,...a)=>si(f,(ms||0)/RATE,...a);
  document.addEventListener('play',e=>{try{e.target.playbackRate=RATE}catch(_){}},true);})();`;
const smooth = (dist, dur) => `new Promise(r=>{const s=scrollY,D=${dist},t0=Date.now();const f=()=>{const k=Math.min(1,(Date.now()-t0)/${dur});const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;scrollTo({top:s+D*e,behavior:'instant'});k<1?setTimeout(f,16):r()};f()})`;
async function clip(b, name, url, { pre, run, ms, fresh, wait = 1500 }) {
  const ctx = await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
  const p = await ctx.newPage();
  if (!fresh || name === '5-photo') await p.addInitScript(() => sessionStorage.setItem('rrSeen', '1'));
  const cdp = await ctx.newCDPSession(p); await cdp.send('Animation.enable');
  if (!fresh) { await p.goto(url); await p.waitForTimeout(wait);
    await p.evaluate(async () => { document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager'); await Promise.all([...document.images].map(i => i.decode ? i.decode().catch(()=>{}) : 0)); });
    if (pre) await p.evaluate(pre); await p.waitForTimeout(900);
    await p.evaluate(SLOW); }  // slow down from here on
  else await p.addInitScript(SLOW);
  await cdp.send('Animation.setPlaybackRate', { playbackRate: RATE });
  const dir = `${R}/raw/${name}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  if (fresh) await p.goto(url, { waitUntil: 'commit' });
  if (run) p.evaluate(run).catch(() => {});
  const T0 = Date.now(), times = []; let i = 0;
  while ((Date.now() - T0) * RATE < ms) {
    const buf = await p.screenshot({ type: 'jpeg', quality: 93 }).catch(() => null);
    if (buf && buf.length > 20000) { times.push((Date.now() - T0) * RATE); fs.writeFileSync(`${dir}/${String(i++).padStart(4, '0')}.jpg`, buf); }
  }
  fs.writeFileSync(`${dir}/times.json`, JSON.stringify({ ms, t: times }));
  console.log(name, i, 'frames'); await ctx.close();
}
(async () => {
  const b = await chromium.launch(); const U = 'http://localhost:8765';
  if (!only || only.includes('1')) await clip(b, '1-intro', `${U}/index.html`, { ms: 6200, fresh: true });
  if (!only || only.includes('2')) await clip(b, '2-shatter', `${U}/index.html`, { ms: 5000, wait: 12000, pre: `scrollTo({top:document.querySelector('.shatter').offsetTop,behavior:'instant'})`, run: smooth(`(document.querySelector('.shatter').offsetHeight-innerHeight)`, 4200) });
  if (!only || only.includes('3')) await clip(b, '4-ai', `${U}/ai-production.html`, { ms: 4600, pre: `scrollTo({top:0,behavior:'instant'})`, run: `(async()=>{await new Promise(r=>setTimeout(r,1200)); await ${smooth('innerHeight*1.1', 2000)};})()` });
  if (!only || only.includes('4')) await clip(b, '5-photo', `${U}/photography.html`, { ms: 5400, fresh: true, run: `(async()=>{await new Promise(r=>setTimeout(r,3700)); await ${smooth("document.querySelector('.series').getBoundingClientRect().top-30", 1500)};})()` });
  if (!only || only.includes('5')) await clip(b, '2-art', `${U}/art-design.html`, { ms: 5600, pre: `scrollTo(0,0)`,
      run: `(async()=>{const h=document.querySelector('[data-torch]');const P=[[60,520],[150,300],[260,250],[230,380],[120,360],[180,330]];let t0=Date.now();
        const f=()=>{const k=Math.min(1,(Date.now()-t0)/5200)*(P.length-1);const i=Math.min(P.length-2,Math.floor(k)),u=k-i,e=u*u*(3-2*u);
          const x=P[i][0]+(P[i+1][0]-P[i][0])*e,y=P[i][1]+(P[i+1][1]-P[i][1])*e;h.dispatchEvent(new PointerEvent('pointermove',{clientX:x,clientY:y,bubbles:true}));if(k<P.length-1)setTimeout(f,16)};f();})()` });
  await b.close();
})();
