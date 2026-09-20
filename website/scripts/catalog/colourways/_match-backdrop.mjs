import sharp from "sharp";
// Match one frame's BACKDROP to another's, leaving the garment alone.
//
// ⚠️ THIS IS THE INVERSE OF neutralise-backdrop.mjs AND BOTH ARE NEEDED. That
// one applies a single gain to the whole frame, which is right when the cast is
// the camera's. Here the garment is already correct and only the sweep behind
// her is wrong: the two short cells sat on a flat cold white while the two long
// ones sat on a warm-grey sweep, and the founder read the SHORTS as "more white
// than ivory" even after the linen itself measured identical -- warmth 7 on
// both. The cloth was never the problem; the wall behind it was.
//
// The backdrop is everything OUTSIDE the figure's own horizontal span on each
// row, which is how prepare-masks finds a pale garment too.
function span(data,w,y){
 let a=-1,b=-1;
 for(let x=0;x<w;x++){const i=(y*w+x)*3;
  const mx=Math.max(data[i],data[i+1],data[i+2]),mn=Math.min(data[i],data[i+1],data[i+2]);
  const l=(mx+mn)/2/255;
  if(l<0.88 || (data[i]-data[i+2])>6){ if(a<0)a=x; b=x; }}
 return [a,b];
}
async function backdropMean(file){
 const {data,info}=await sharp(file).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const {width:w,height:h}=info;
 let R=0,G=0,B=0,n=0;
 for(let y=0;y<h;y++){
  const [a,b]=span(data,w,y);
  for(let x=0;x<w;x++){ if(a>=0 && x>=a && x<=b) continue;
   const i=(y*w+x)*3; R+=data[i];G+=data[i+1];B+=data[i+2];n++; }}
 return {rgb:[R/n,G/n,B/n], data, w, h};
}
export async function matchBackdrop(inPath, referencePath, outPath){
 const ref = await backdropMean(referencePath);
 const src = await backdropMean(inPath);
 const gain = ref.rgb.map((t,i)=>t/src.rgb[i]);
 const {data,w,h} = src;
 const out = Buffer.from(data);
 for(let y=0;y<h;y++){
  const [a,b]=span(data,w,y);
  for(let x=0;x<w;x++){ if(a>=0 && x>=a && x<=b) continue;
   const i=(y*w+x)*3;
   for(let c=0;c<3;c++) out[i+c]=Math.min(255,Math.round(data[i+c]*gain[c]));}}
 await sharp(out,{raw:{width:w,height:h,channels:3}}).jpeg({quality:92,mozjpeg:true}).toFile(outPath);
 const f=a=>`rgb(${a[0].toFixed(0)},${a[1].toFixed(0)},${a[2].toFixed(0)}) warmth ${(a[0]-a[2]).toFixed(0)}`;
 return {from:f(src.rgb), to:f(ref.rgb), gain:gain.map(g=>g.toFixed(3)).join(",")};
}
