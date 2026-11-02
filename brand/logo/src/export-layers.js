const sharp=require('sharp'); const fs=require('fs'); const path=require('path');
const svg=fs.readFileSync(path.join(__dirname,'logo-layers.svg'),'utf8');
const out=process.argv[2];
const defs=svg.match(/<defs>[\s\S]*?<\/defs>/)[0];
const vb=svg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
function group(id){ // вырезает <g id="id">…</g> с учётом вложенных <g>
  const start=svg.indexOf(`<g id="${id}">`); let i=start, depth=0;
  const re=/<g\b|<\/g>/g; re.lastIndex=start; let m;
  while((m=re.exec(svg))){ depth+= m[0]==='</g>'?-1:1; if(depth===0){ return svg.slice(start,m.index+4); } }
}
const ids=['glass-back','glass-mid','frame-front','glass-front','text-art','text-vitrazh','tagline'];
(async()=>{
  for (const [i,id] of ids.entries()){
    for (const k of [2,4]){
      const w=vb[2]*k,h=vb[3]*k;
      const one=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" width="${vb[2]}" height="${vb[3]}">${defs}${group(id)}</svg>`;
      await sharp(Buffer.from(one),{density:72*k}).png().toFile(path.join(out,`layers-${k}x`,`${String(i+1).padStart(2,'0')}-${id}.png`));
    }
  }
  // собранный логотип с прозрачным фоном
  for (const k of [2,4]) await sharp(Buffer.from(svg.replace(/ width="[^"]+" height="[^"]+"/,` width="${vb[2]}" height="${vb[3]}"`)),{density:72*k}).png().toFile(path.join(out,`logo-${k}x.png`));
  console.log('layers ok');
})();
