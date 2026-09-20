import sharp from "sharp";
// Bring one frame's GARMENT and BACKDROP onto the set's values, separately.
//
// ⚠️ SEPARATELY IS THE WHOLE POINT. neutralise-backdrop.mjs applies one gain to
// the entire frame; that is right for a camera cast and wrong here, because one
// cell came out warm in BOTH the cloth (warmth 23 against the set's 15-17) and
// the sweep behind it (11 against 0), by different amounts. Correcting the
// frame as a whole fixed one and broke the other -- which is exactly what
// happened earlier today, twice: warming the garment washed the backdrop, then
// matching the backdrop washed the garment. Founder, both times, without
// measuring anything: "the short abaya looks more white than ivory", then "no
// no no you ruined the full picture".
//
// The figure's own horizontal span per row separates them, the same way
// prepare-masks.mjs finds a pale garment.
function rowSpan(data,w,y){
 let a=-1,b=-1;
 for(let x=0;x<w;x++){const i=(y*w+x)*3;
  const mx=Math.max(data[i],data[i+1],data[i+2]),mn=Math.min(data[i],data[i+1],data[i+2]);
  // ⚠️ THE WARMTH THRESHOLD MUST CLEAR THE BACKDROP'S OWN WARMTH. At >6 this
  // counted a backdrop measuring 11 as part of the figure, every row came back
  // full width, and the backdrop mean was NaN -- no pixels left to average. The
  // sweep in these frames runs 0-11 warm; the linen runs 15-23. 14 sits in the
  // gap.
  if((mx+mn)/2/255<0.88 || (data[i]-data[i+2])>14){ if(a<0)a=x; b=x; }}
 return [a,b];
}
export async function harmonise(inPath, outPath, {garmentWarmth, backdropWarmth}){
 const {data,info}=await sharp(inPath).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const {width:w,height:h}=info;
 const out=Buffer.from(data);
 const before={g:[0,0,0,0],b:[0,0,0,0]}, after={g:[0,0,0,0],b:[0,0,0,0]};
 // measure each region
 for(let y=0;y<h;y++){
  const [a,b]=rowSpan(data,w,y);
  for(let x=0;x<w;x++){
   const i=(y*w+x)*3;
   const inside = a>=0 && x>=a && x<=b;
   const mx=Math.max(data[i],data[i+1],data[i+2]),mn=Math.min(data[i],data[i+1],data[i+2]);
   const lit=(mx+mn)/2/255>=0.62;
   const t = inside ? (lit?before.g:null) : before.b;
   if(t){t[0]+=data[i];t[1]+=data[i+1];t[2]+=data[i+2];t[3]++;}
  }}
 // ⚠️ WARMTH IS MOVED BY SHIFTING RED AND BLUE APART OR TOGETHER, not by a
 // channel gain: a gain changes brightness too, and these frames already agree
 // on brightness. Half the delta each way keeps the mean luminance put.
 const shift=(cur,want)=>((want-cur)/2);
 const gShift=shift((before.g[0]-before.g[2])/before.g[3], garmentWarmth);
 const bShift=shift((before.b[0]-before.b[2])/before.b[3], backdropWarmth);
 for(let y=0;y<h;y++){
  const [a,b]=rowSpan(data,w,y);
  for(let x=0;x<w;x++){
   const i=(y*w+x)*3;
   const inside = a>=0 && x>=a && x<=b;
   const mx=Math.max(data[i],data[i+1],data[i+2]),mn=Math.min(data[i],data[i+1],data[i+2]);
   const lit=(mx+mn)/2/255>=0.62;
   let s=null;
   if(inside && lit) s=gShift; else if(!inside) s=bShift;
   if(s===null) continue;
   out[i]=Math.max(0,Math.min(255,Math.round(data[i]+s)));
   out[i+2]=Math.max(0,Math.min(255,Math.round(data[i+2]-s)));
   const t=(inside?after.g:after.b);
   t[0]+=out[i];t[1]+=out[i+1];t[2]+=out[i+2];t[3]++;
  }}
 await sharp(out,{raw:{width:w,height:h,channels:3}}).jpeg({quality:92,mozjpeg:true}).toFile(outPath);
 const f=a=>((a[0]-a[2])/a[3]).toFixed(0);
 return {garment:`${f(before.g)} -> ${f(after.g)}`, backdrop:`${f(before.b)} -> ${f(after.b)}`};
}
