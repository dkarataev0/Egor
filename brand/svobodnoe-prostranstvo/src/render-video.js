const { chromium } = require('playwright');
const [,, out, W, H, fps, secs] = process.argv;
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:+W,height:+H}});
  await p.goto('file:///home/user/Egor/brand/svobodnoe-prostranstvo/hero/index.html');
  await p.waitForLoadState('load');
  await p.evaluate(()=>document.getAnimations().forEach(a=>a.pause()));
  const n=Math.round(fps*secs);
  for(let i=0;i<n;i++){
    const t=i*1000/fps - 300; // 0.3 с пустого фона в начале
    await p.evaluate(t=>document.getAnimations().forEach(a=>{a.currentTime=Math.max(0,t)}),t);
    if(t<0) await p.evaluate(()=>document.getAnimations().forEach(a=>a.currentTime=0));
    await p.screenshot({path:`${out}/f${String(i).padStart(4,'0')}.png`});
  }
  await b.close();
})();
