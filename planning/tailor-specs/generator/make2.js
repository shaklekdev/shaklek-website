const {flat,T,sharp}=require("./v3.js");
const HOME=process.env.HOME, PAD=80, W=2900;
// Photos 2 per row, large. Source is 843x1264 / 912x1173 -- that is the ceiling,
// so they are placed near native and simply given more of the page.
async function build({kind,title,sub,photos,photoLabels,flats,notes,spec,out}){
  const PW=Math.floor((W-PAD*2-70)/2), PH=Math.round(PW*1264/843);
  const cells=[];
  for(const p of photos) cells.push(await sharp(p).resize({width:PW,height:PH,fit:"contain",background:"#fff"}).sharpen().toBuffer());
  const pY=250, rows=Math.ceil(photos.length/2);
  const fY=pY+rows*(PH+70)+120;
  const A=flat(PAD+60,fY,1.45,{kind,...flats[0]});
  const B=flat(PAD+1440,fY,1.45,{kind,...flats[1]});
  const nY=A.hemY+80, nH=notes.length*46+40;
  const sY=nY+nH+80, H=sY+spec.length*44+90;
  const pos=i=>({x:PAD+(i%2)*(PW+70), y:pY+Math.floor(i/2)*(PH+70)});
  const svg=`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
${T(PAD,86,title,{s:52,w:"bold"})}
${T(PAD,134,sub,{s:27,c:"#444"})}
${T(PAD,200,"1 · THE GARMENT — photographs",{s:34,w:"bold"})}
${photoLabels.map((l,i)=>{const p=pos(i);return T(p.x,p.y-14,l,{s:26,w:"bold"})+`<rect x="${p.x}" y="${p.y}" width="${PW}" height="${PH}" fill="none" stroke="#ccc" stroke-width="2"/>`;}).join("")}
${T(PAD,fY-80,"2 · THE CUT — technical drawing",{s:34,w:"bold"})}
${T(PAD+60,fY-24,flats[0].label,{s:28,w:"bold"})}${T(PAD+1440,fY-24,flats[1].label,{s:28,w:"bold"})}
${A.svg}${B.svg}
<rect x="${PAD}" y="${nY}" width="${W-PAD*2}" height="${nH}" fill="#f6fbf8" stroke="#047857" stroke-width="3"/>
${notes.map((n,i)=>T(PAD+26,nY+48+i*46,n.t,{s:n.s||24,w:n.w,c:n.c})).join("")}
${T(PAD,sY-10,"3 · EVERY DETAIL",{s:34,w:"bold"})}
${spec.map((l,i)=>T(PAD,sY+44+i*44,l.t,{s:l.s||25,w:l.w,c:l.c})).join("")}
</svg>`;
  await sharp({create:{width:W,height:H,channels:3,background:"#fff"}})
    .composite([...cells.map((b,i)=>{const p=pos(i);return {input:b,left:p.x,top:p.y};}),{input:Buffer.from(svg),left:0,top:0}])
    .png().toFile(out+".png");
  await sharp(out+".png").jpeg({quality:96,mozjpeg:true}).toFile(HOME+"/Downloads/"+out.split("/").pop()+".jpg");
  await sharp(out+".png").resize({width:1150}).toFile(out+"-sm.png");
}
module.exports={build};
