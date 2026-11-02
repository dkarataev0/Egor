// Генератор logo-layers.svg: геометрия в координатах исходного JPG (332×306), текст в кривых (Manrope).
const ot=require('opentype.js'); const fs=require('fs'); const path=require('path');
const P=JSON.parse(fs.readFileSync(path.join(__dirname,'params.json'),'utf8'));
const load=(w)=>{const f=path.join(__dirname,'fonts','manrope','package','files',`manrope-cyrillic-${w}-normal.woff`); const b=fs.readFileSync(f); return ot.parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));};
const r=(n)=>Math.round(n*100)/100;
// Текст в кривых: кернинг выключен, трекинг подбирается так, чтобы чернила легли ровно между left и right.
// sx — лёгкое горизонтальное сжатие (оригинал уже стандартного Manrope).
function textPath(font,text,size,sx,left,right,baseline){
  const n=text.length;
  const w0=(()=>{const b=font.getPath(text,0,0,size,{kerning:false}).getBoundingBox(); return (b.x2-b.x1)*sx;})();
  const lsPx=n>1?(right-left-w0)/(n-1):0;           // трекинг в экранных пикселях
  const p=font.getPath(text,0,baseline,size,{letterSpacing:(lsPx/sx)/size,kerning:false});
  const b0=p.getBoundingBox();
  for (const c of p.commands) for (const k of ['x','x1','x2']) if (c[k]!==undefined) c[k]=left+(c[k]-b0.x1)*sx;
  return {d:p.toPathData(2), bbox:p.getBoundingBox(), ls:lsPx};
}
// То же слово, но каждая буква отдельным <path>: позиции идентичны textPath() и нужны для анимации трекинга.
function glyphPaths(font,text,size,sx,left,right,baseline){
  const n=text.length;
  const w0=(()=>{const b=font.getPath(text,0,0,size,{kerning:false}).getBoundingBox(); return (b.x2-b.x1)*sx;})();
  const lsPx=n>1?(right-left-w0)/(n-1):0;
  const opts={letterSpacing:(lsPx/sx)/size,kerning:false};
  const b0=font.getPath(text,0,baseline,size,opts).getBoundingBox();
  const res=[];
  font.forEachGlyph(text,0,baseline,size,opts,(gl,gx,gy,fs)=>{
    const p=gl.getPath(gx,gy,fs);
    for (const c of p.commands) for (const k of ['x','x1','x2']) if (c[k]!==undefined) c[k]=left+(c[k]-b0.x1)*sx;
    const bb=p.getBoundingBox(); res.push({d:p.toPathData(2),cx:(bb.x1+bb.x2)/2,empty:!p.commands.length});
  });
  return res;
}
const c=P.colors, g=P.geom;
const poly=(pts)=>'M'+pts.map(p=>p.map(r).join(' ')).join(' L')+' Z';
const out=[];
out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${P.viewBox.join(' ')}" width="${P.viewBox[2]*P.exportScale}" height="${P.viewBox[3]*P.exportScale}" role="img" aria-label="АртВитраж: стекло, алюминий, конструкции">`);
out.push(`<title>АртВитраж</title>`);
out.push(`<defs>
  <linearGradient id="gBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.glassBackTop}"/><stop offset=".55" stop-color="${c.glassBackMid}"/><stop offset=".82" stop-color="${c.glassBackLow}"/><stop offset="1" stop-color="${c.glassBackBottom}"/></linearGradient>
  <linearGradient id="gBackEdge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.edgeBack}"/><stop offset=".85" stop-color="${c.edgeBack}"/><stop offset="1" stop-color="${c.edgeBack}" stop-opacity="0"/></linearGradient>
  <linearGradient id="gMid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.glassMidTop}"/><stop offset=".6" stop-color="${c.glassMidMid}"/><stop offset="1" stop-color="${c.glassMidBottom}"/></linearGradient>
  <linearGradient id="gMidFrame" gradientUnits="userSpaceOnUse" x1="${g.mid.tl[0]}" y1="0" x2="${g.mid.tr[0]}" y2="0"><stop offset="0" stop-color="${c.midFrameL}"/><stop offset=".55" stop-color="${c.midFrameM}"/><stop offset="1" stop-color="${c.midFrameR}"/></linearGradient>
  <linearGradient id="gFront" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".5" stop-color="${c.glassFrontTint}" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity=".30"/></linearGradient>
</defs>`);
// 1. glass-back
const b=g.back;
out.push(`<g id="glass-back">
  <path d="${poly([b.tl,b.tr,b.br,b.bl])}" fill="url(#gBack)"/>
  <path d="M${b.bl[0]+0.65} ${b.bl[1]} L${b.tl[0]+0.65} ${b.tl[1]}" stroke="url(#gBackEdge)" stroke-width="1.4" fill="none" stroke-linecap="butt"/>
</g>`);
// 2. glass-mid: заливка + тонкая рамка
const m=g.mid;
out.push(`<g id="glass-mid">
  <path d="${poly([m.tl,m.tr,m.br,m.bl])}" fill="url(#gMid)"/>
  <path d="${poly([m.tl,m.tr,m.br,m.bl])}" fill="none" stroke="url(#gMidFrame)" stroke-width="${m.stroke}" stroke-linejoin="miter"/>
</g>`);
// 3. frame-front: только обводка
const f=g.front;
out.push(`<g id="frame-front">
  <path id="frame-front-outline" d="M${f.tl[0]} ${r((f.tl[1]+f.bl[1])/2)} L${[f.tl,f.tr,f.br,f.bl].map(p=>p.map(r).join(' ')).join(' L')} Z" fill="none" stroke="${c.frame}" stroke-width="${f.stroke}" stroke-linejoin="miter" stroke-miterlimit="6" pathLength="1"/>
</g>`);
// 4. glass-front: заливка внутри рамки (внутренний контур обводки)
const h=f.stroke/2, ins=g.frontInner;
out.push(`<g id="glass-front">
  <path d="${poly(ins)}" fill="url(#gFront)"/>
</g>`);
// тексты
const T=P.text;
const art=textPath(load(T.art.weight),'Арт',T.art.size,T.art.sx,T.art.left,T.art.right,T.baseline);
const vit=textPath(load(T.vit.weight),'Витраж',T.vit.size,T.vit.sx,T.vit.left,T.vit.right,T.baseline);
out.push(`<g id="text-art"><path d="${art.d}" fill="${c.text}"/></g>`);
out.push(`<g id="text-vitrazh"><path d="${vit.d}" fill="${c.text}"/></g>`);
// tagline: слова кривыми + точки отдельными кругами
const tg=P.tagline, tf=load(tg.weight);
let words='', dots='';
const mid=(tg.words[0].left+tg.words[tg.words.length-1].right)/2;
for (const w of tg.words){ const gl=glyphPaths(tf,w.text,tg.size,tg.sx,w.left,w.right,tg.baseline);
  words+=`<g id="tagline-${w.id}" fill="${c.tagline}">`+gl.map((q,i)=>`<path id="tagline-${w.id}-${i+1}" d="${q.d}" style="--dx:${r((q.cx-mid)*0.15)}"/>`).join('')+`</g>`; }
tg.dots.forEach((x,i)=>{ dots+=`<circle id="tagline-dot-${i+1}" cx="${x}" cy="${tg.dotY}" r="${tg.dotR}" fill="${c.tagline}"/>`; });
out.push(`<g id="tagline"><g id="tagline-words">${words}</g><g id="tagline-dots">${dots}</g></g>`);
out.push('</svg>');
fs.writeFileSync(path.join(__dirname,'logo-layers.svg'), out.join('\n'));
console.log('Арт ls',art.ls.toFixed(2),'bbox',JSON.stringify(art.bbox),'\nВитраж ls',vit.ls.toFixed(2),'bbox',JSON.stringify(vit.bbox));
