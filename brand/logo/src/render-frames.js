// Детерминированный рендер: ставим currentTime всем CSS-анимациям и снимаем кадр.
const { chromium } = require('playwright'); const fs=require('fs');
const [,, html, outDir, vw, vh, w, fps, dur, transparent] = process.argv;
(async()=>{
  fs.mkdirSync(outDir,{recursive:true});
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:+vw,height:+vh}});
  await p.goto(`file://${html}?w=${w}${transparent==='1'?'&bg=transparent':''}`); await p.waitForTimeout(400);
  await p.evaluate(()=>document.getAnimations().forEach(a=>a.pause()));
  const N=Math.round(+dur * +fps); const t0=Date.now();
  for (let f=0; f<N; f++){
    const t=(f/+fps)*1000;
    await p.evaluate(t=>document.getAnimations().forEach(a=>{a.currentTime=t}),t);
    await p.screenshot({path:`${outDir}/f${String(f).padStart(4,'0')}.png`,omitBackground:transparent==='1'});
    if (f%30===0) console.log(outDir.split('/').pop(),f+'/'+N,((Date.now()-t0)/1000).toFixed(0)+'s');
  }
  console.log('done',outDir.split('/').pop(),N,'frames',((Date.now()-t0)/1000).toFixed(0)+'s'); await b.close();
})();
