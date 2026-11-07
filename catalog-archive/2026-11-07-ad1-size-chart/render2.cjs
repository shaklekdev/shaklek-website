const sharp=require('sharp');const B=process.argv[2];
const R='/Users/nadatlohi/dev/Shaklek',S='/private/tmp/claude-501/-Users-nadatlohi-dev-Shaklek/504b0b5e-6062-478a-bd46-48b6cc1655f2/scratchpad';
const W=1080,H=1920,FPS=30;let n=0;
const save=b=>sharp(b).png({compressionLevel:1}).toFile(`${B}/f/${String(n++).padStart(4,'0')}.png`);
// one grade for every shot: a touch desaturated and warm, so footage from different sources matches
async function cover(src,zoom,dim,fy=0.5){const m=await sharp(src).metadata();const sc=Math.max(W/m.width,H/m.height)*zoom;
 const rw=Math.round(m.width*sc),rh=Math.round(m.height*sc);
 return sharp(src).resize(rw,rh).extract({left:Math.round((rw-W)/2),top:Math.round((rh-H)*fy),width:W,height:H})
  .modulate({saturation:0.78}).recomb([[1.04,0,0],[0,1.0,0],[0,0,0.93]]).linear(dim,0).png().toBuffer();}
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const fade=(buf,a)=>sharp(buf).composite([{input:Buffer.from([255,255,255,Math.round(255*a)]),raw:{width:1,height:1,channels:4},tile:true,blend:'dest-in'}]).png().toBuffer();
const fr=(nm,c)=>[...Array(c).keys()].map(i=>`${S}/clipf/${nm}-${String(i).padStart(3,'0')}.jpg`);
(async()=>{
 const pile=`${B}/pile-tagged.png`, T=f=>`${B}/txt/${f}.png`;
 // 1. slot, fast
 const sizes=['XS','S','M','L','XL'],N=30,TH=340,order=['XS','XL','L','S','M'];
 const seq=[];let r=7;const rnd=()=>{r=(r*1103515245+12345)%2147483648;return r;};
 for(let k=0;k<5;k++){if(k)for(let j=0;j<5;j++){let c;do{c=sizes[rnd()%5]}while(c===seq[seq.length-1]||c===order[k]);seq.push(c);}seq.push(order[k]);}
 while(seq.length<N)seq.push(sizes[rnd()%5]);
 const strip=await sharp({create:{width:W,height:TH*N,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(seq.map((c,i)=>({input:T('s-'+c),left:0,top:i*TH}))).raw().toBuffer();
 const stops=[0,6,12,18,24],roll=Math.round(0.24*FPS),hold=Math.round(0.16*FPS);const pos=[...Array(Math.round(0.35*FPS)).fill(0)];
 for(let k=1;k<5;k++){for(let i=1;i<=roll;i++)pos.push(stops[k-1]+(stops[k]-stops[k-1])*ease(i/roll));pos.push(...Array(hold).fill(stops[k]));}
 const winTop=880,total=pos.length+Math.round(1.8*FPS);
 const win=async(p,v)=>{let w=sharp(strip,{raw:{width:W,height:TH*N,channels:4}}).extract({left:0,top:Math.round(p*TH),width:W,height:TH});return (v>0.05?w.blur(Math.min(30,1+v*20)):w).png().toBuffer();};
 for(let i=0;i<total;i++){const bg=await cover(pile,1+0.05*i/total,0.42);const p=i<pos.length?pos[i]:24;const v=i&&i<pos.length?Math.abs(pos[i]-pos[i-1]):0;
  const L=[{input:T('head'),left:0,top:winTop-200},{input:await win(p,v),left:0,top:winTop}];
  if(i>=pos.length)L.push({input:await fade(T('c1body'),Math.min(1,(i-pos.length+1)/6)),left:0,top:winTop+TH-140});
  await save(await sharp(bg).composite(L).png().toBuffer());}
 // 2. sewing + line
 // sewing: darker, film grain and vignette so it reads as old footage, not a render
 const grains=[];for(let g=0;g<6;g++){const buf=Buffer.alloc(W*H*4);for(let k=0;k<W*H;k++){const v=128+Math.round((Math.random()+Math.random()+Math.random()-1.5)*70);buf[k*4]=buf[k*4+1]=buf[k*4+2]=Math.max(0,Math.min(255,v));buf[k*4+3]=80;}
  grains.push(await sharp(buf,{raw:{width:W,height:H,channels:4}}).blur(0.6).png().toBuffer());}
 const vig=await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><radialGradient id="v" cx="0.5" cy="0.5" r="0.75"><stop offset="0.45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.75"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#v)"/></svg>`)).png().toBuffer();
 for(const [i,f] of fr('sew',54).entries()){const bg=await sharp(await cover(f,1.04,0.48)).modulate({saturation:0.55}).recomb([[1.06,0.03,0],[0.02,1.0,0],[0,0.03,0.86]]).png().toBuffer();
  await save(await sharp(bg).composite([{input:grains[i%6],blend:'overlay'},{input:vig},{input:T('c2'),left:0,top:Math.round((H-900)/2)}]).png().toBuffer());}
 // 3. linen + line
// linen card removed 2026-11-07: the end card already says 100% linen
 if(0)for(const [i,f] of fr('weave',45).entries())await save(await sharp(await cover(f,1.04,0.66)).composite([{input:T('linen'),left:0,top:Math.round((H-900)/2)}]).png().toBuffer());
 // 4+5. walking in slow motion (clean 1.6s only, before the sleeve glitch), logo on top
 const logo=await sharp(`${R}/branding/source/shaklek-logo-white-on-dark.svg`,{density:300}).resize(460).png().toBuffer();const lm=await sharp(logo).metadata();
 const wf=fr('walk',48);const WF=96;
 for(let i=0;i<WF;i++){const f=wf[Math.min(47,Math.floor(i/2))];const a=Math.max(0,Math.min(1,(i-20)/12));
  const bg=await sharp(await cover(f,1.02,0.84-0.2*a)).modulate({saturation:0.6}).recomb([[1.05,0.02,0],[0.01,1.0,0],[0,0.02,0.9]]).png().toBuffer();
  const L=a>0?[{input:await fade(logo,a),left:Math.round((W-lm.width)/2),top:300},{input:await fade(T(process.env.END||'end'),a),left:0,top:Math.round((H-420)/2)}]:[];
  await save(await sharp(bg).composite(L).png().toBuffer());}
 console.log(n,'frames',(n/FPS).toFixed(1)+'s');})();
