// Собирает logo-animated.html (интро 3,2 с) и logo-glint-loop.html (блик раз в 6 с) из logo-layers.svg.
const fs=require('fs'), path=require('path');
const svg=fs.readFileSync(path.join(__dirname,'logo-layers.svg'),'utf8');
const P=JSON.parse(fs.readFileSync(path.join(__dirname,'params.json'),'utf8'));
const vb=P.viewBox, g=P.geom, T=P.text, r=(n)=>Math.round(n*100)/100;
const defs=svg.match(/<defs>([\s\S]*?)<\/defs>/)[1];
function group(id){const start=svg.indexOf(`<g id="${id}">`); const re=/<g\b|<\/g>/g; re.lastIndex=start; let d=0,m; while((m=re.exec(svg))){d+=m[0]==='</g>'?-1:1; if(!d) return svg.slice(start,m.index+4);} }
const poly=(pts)=>'M'+pts.map(p=>p.map(r).join(' ')).join(' L')+' Z';
// маска «Витража»: мягкая кромка 14 ед., блок сдвигается слева направо
const vL=T.vit.left, vW=T.vit.right-T.vit.left+0.4, F=26;
const extra=`
  <linearGradient id="gFeather" x1="0" y1="0" x2="1" y2="0"><stop offset="${r(vW/(vW+F))}" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
  <mask id="mVit" maskUnits="userSpaceOnUse" x="${vL-4}" y="110" width="${vW+F+10}" height="70"><rect id="vit-reveal" x="${vL}" y="110" width="${r(vW+F)}" height="70" fill="url(#gFeather)"/></mask>
  <linearGradient id="gGlint" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".38" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity=".6"/><stop offset=".62" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <clipPath id="glassClip"><path d="${poly([g.back.tl,g.back.tr,g.back.br,g.back.bl])}"/><path d="${poly([g.mid.tl,g.mid.tr,g.mid.br,g.mid.bl])}"/><path d="${poly(g.frontInner)}"/></clipPath>`;
const t30=Math.tan(30*Math.PI/180), yMid=150;
const glint=`<g id="glint" clip-path="url(#glassClip)"><g id="glint-band"><rect x="-13" y="70" width="26" height="160" fill="url(#gGlint)" transform="translate(${r(t30*yMid)} 0) skewX(-30)"/></g></g>`;
let li=0;
let tag=group('tagline').replace(/<circle /g,'<circle class="td" ').replace(/<path id="tagline-([a-z-]+-\d+)" d="([^"]+)" style="--dx:([^"]+)"/g,(m,id,d,dx)=>`<path class="tl" id="tagline-${id}" d="${d}" style="--dx:${dx};--i:${li++}"`);
const body=[group('glass-back'),group('glass-mid'),glint,group('frame-front'),group('glass-front'),group('text-art'),`<g id="text-vitrazh-wrap" mask="url(#mVit)">${group('text-vitrazh')}</g>`,tag].join('\n');

const css=(mode)=>`
:root{--glide:cubic-bezier(0.33,0,0.1,1);--inout:cubic-bezier(0.65,0,0.35,1);--fade:cubic-bezier(0.25,0.1,0.25,1)}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{display:grid;place-items:center;background:#fff}
body.transparent{background:transparent}
.logo{display:block;width:min(92vw,var(--w,1200px));height:auto;overflow:visible;cursor:${mode==='intro'?'pointer':'default'}}
${mode==='intro'?`
/* Мягкое интро 4,4 с, затем статичный кадр. Движение, прозрачность и размытие идут отдельными кривыми,
   стартуют без рывка и долго «садятся», этапы перекрываются. */
.intro #frame-front-outline{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.1s var(--inout) 0s both}
.intro #glass-back{--sx:46px;--d:.35s;animation:glideX 1.25s var(--glide) var(--d) both,fadeIn .9s var(--fade) var(--d) both,blurOut 1.1s var(--fade) var(--d) both}
.intro #glass-mid{--sx:40px;--d:.50s;animation:glideX 1.25s var(--glide) var(--d) both,fadeIn .9s var(--fade) var(--d) both,blurOut 1.1s var(--fade) var(--d) both}
.intro #glass-front{--sx:28px;--d:.65s;animation:glideX 1.25s var(--glide) var(--d) both,fadeIn .9s var(--fade) var(--d) both,blurOut 1.1s var(--fade) var(--d) both}
.intro #text-art{animation:riseY 1s var(--glide) 1.3s both,fadeIn .8s var(--fade) 1.3s both}
.intro #vit-reveal{animation:reveal 1s var(--inout) 1.6s both}
.intro .tl{--d:calc(2.2s + var(--i)*.012s);animation:trackX 1.1s var(--glide) var(--d) both,fadeIn .6s var(--fade) var(--d) both}
.intro .td{transform-box:fill-box;transform-origin:center;animation:dotIn .7s var(--glide) var(--dd,3s) both,fadeIn .5s var(--fade) var(--dd,3s) both}
.intro #tagline-dot-1{--dd:3.05s}
.intro #tagline-dot-2{--dd:3.2s}
.intro #glint-band{animation:glint 1.1s var(--inout) 3.3s both}
@keyframes draw{to{stroke-dashoffset:0}}
@keyframes glideX{from{transform:translateX(var(--sx))}to{transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes blurOut{from{filter:blur(1.8px)}to{filter:none}}
@keyframes riseY{from{transform:translateY(3px)}to{transform:none}}
@keyframes reveal{from{transform:translateX(-${r(vW+F)}px)}to{transform:none}}
@keyframes trackX{from{transform:translateX(calc(var(--dx)*1px))}to{transform:none}}
@keyframes dotIn{from{transform:scale(.4)}to{transform:none}}
@keyframes glint{from{transform:translateX(-46px)}to{transform:translateX(143px)}}`:`
/* Вариант для сайта: логотип статичен, раз в 6 с по стёклам плавно проходит блик. */
.loop #glint-band{animation:glintLoop 6s var(--inout) 1.2s infinite}
@keyframes glintLoop{0%{transform:translateX(-46px)}23%,100%{transform:translateX(143px)}}`}
@media (prefers-reduced-motion:reduce){
  .logo *{animation:none!important}   /* сразу финальный кадр */
  #frame-front-outline{stroke-dasharray:none!important;stroke-dashoffset:0!important}
  #glint{display:none}
}`;
const html=(mode)=>`<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>АртВитраж: ${mode==='intro'?'анимированный логотип':'логотип с бликом'}</title>
<style>${css(mode)}</style>
</head>
<body>
<svg class="logo ${mode}" id="logo" viewBox="${vb.join(' ')}" role="img" aria-label="АртВитраж: стекло, алюминий, конструкции">
<title>АртВитраж</title>
<defs>${defs}${extra}</defs>
${body}
</svg>
<script>
/* Параметры для просмотра и рендера: ?bg=transparent  ?w=1400 */
const q=new URLSearchParams(location.search);
if(q.get('bg')==='transparent')document.body.classList.add('transparent');
if(q.get('w'))document.documentElement.style.setProperty('--w',q.get('w')+'px');
${mode==='intro'?`/* Клик по логотипу проигрывает интро заново */
const logo=document.getElementById('logo');
logo.addEventListener('click',()=>{logo.classList.remove('intro');void logo.getBoundingClientRect();logo.classList.add('intro');});`:''}
</script>
</body>
</html>
`;
const out=process.argv[2]||__dirname;
fs.writeFileSync(path.join(out,'logo-animated.html'),html('intro'));
fs.writeFileSync(path.join(out,'logo-glint-loop.html'),html('loop'));
console.log('html ok',fs.statSync(path.join(out,'logo-animated.html')).size,'bytes');
