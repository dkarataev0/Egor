// Детерминированный рендер с размытием движения: каждый кадр = среднее из S суб-кадров (затвор shutter·кадр).
// Усреднение по предумноженной альфе, поэтому прозрачный фон остаётся корректным.
const { chromium } = require('playwright'); const sharp=require('sharp'); const fs=require('fs');
const [,, html, outDir, vw, vh, w, fps, dur, transparent, sub='1', shutter='0.5'] = process.argv;
const S=+sub, N=Math.round(+dur * +fps);
(async()=>{
  fs.mkdirSync(outDir,{recursive:true});
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:+vw,height:+vh}});
  await p.goto(`file://${html}?w=${w}${transparent==='1'?'&bg=transparent':''}`); await p.waitForTimeout(400);
  await p.evaluate(()=>document.getAnimations().forEach(a=>a.pause()));
  const t0=Date.now();
  for (let f=0; f<N; f++){
    let acc=null, accA=null, W=0, H=0;
    for (let k=0; k<S; k++){
      const off = S>1 ? (k/(S-1)-0.5)*(+shutter)/(+fps) : 0;
      const t=Math.max(0, f/(+fps)+off)*1000;
      await p.evaluate(t=>document.getAnimations().forEach(a=>{a.currentTime=t}),t);
      const buf=await p.screenshot({omitBackground:transparent==='1'});
      if (S===1){ fs.writeFileSync(`${outDir}/f${String(f).padStart(4,'0')}.png`,buf); continue; }
      const {data,info}=await sharp(buf).ensureAlpha().raw().toBuffer({resolveWithObject:true});
      if(!acc){W=info.width;H=info.height;acc=new Float32Array(W*H*3);accA=new Float32Array(W*H);}
      for(let i=0,j=0,m=0;i<data.length;i+=4,j+=3,m++){const a=data[i+3]/255; acc[j]+=data[i]*a; acc[j+1]+=data[i+1]*a; acc[j+2]+=data[i+2]*a; accA[m]+=a;}
    }
    if (S>1){
      const out=Buffer.alloc(W*H*4);
      for(let i=0,j=0,m=0;m<W*H;i+=4,j+=3,m++){const a=accA[m]; if(a>0){out[i]=Math.round(acc[j]/a);out[i+1]=Math.round(acc[j+1]/a);out[i+2]=Math.round(acc[j+2]/a);} out[i+3]=Math.round(a/S*255);}
      await sharp(out,{raw:{width:W,height:H,channels:4}}).png({compressionLevel:3}).toFile(`${outDir}/f${String(f).padStart(4,'0')}.png`);
    }
    if (f%30===0) console.log(outDir.split('/').pop(),f+'/'+N,((Date.now()-t0)/1000).toFixed(0)+'s');
  }
  console.log('done',outDir.split('/').pop(),N,'frames',((Date.now()-t0)/1000).toFixed(0)+'s'); await b.close();
})();
