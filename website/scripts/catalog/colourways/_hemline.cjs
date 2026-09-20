const sharp=require("sharp");
// Where the ABAYA's hem is, on a garment worn over matching trousers.
//
// ⚠️ THE OBVIOUS MEASURES ALL FIND THE SHOES. "Lowest non-backdrop row" returns
// 0.975 for every cell of this item, long and short alike, because the figure
// ends at the same place whatever the garment does. What actually moves is the
// SILHOUETTE WIDTH: the abaya is a wide sweep and the trousers beneath it are
// narrow, so the hem is the row where the width falls off a cliff.
//
// Validated on the ivory master, where the two lengths are known to differ:
// at 90% of frame height maxi measures 0.273 of frame width and midi 0.231, and
// at 95% maxi 0.41 against midi 0.26.
module.exports=async function hemline(f){
 const {data,info}=await sharp(f).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const {width:w,height:h}=info;
 const span=y=>{let a=-1,b=-1;
  for(let x=0;x<w;x++){const i=(y*w+x)*3;
   const mx=Math.max(data[i],data[i+1],data[i+2]),mn=Math.min(data[i],data[i+1],data[i+2]);
   if((mx+mn)/2/255<0.86){ if(a<0)a=x; b=x; }}
  return a<0?0:(b-a)/w;};
 // the garment's own width, taken well above any hem
 const ref=span(Math.round(h*0.55));
 // walk down; the hem is the first sustained drop below 85% of that
 let hem=null;
 for(let y=Math.round(h*0.60);y<Math.round(h*0.97);y++){
  if(span(y) < ref*0.85){
   // sustained: the next 2% of frame must stay narrow too
   let ok=true;
   for(let k=y;k<Math.min(h-1,y+Math.round(h*0.02));k++) if(span(k)>=ref*0.85){ok=false;break;}
   if(ok){ hem=y/h; break; }}}
 return {hem, refWidth:ref, at90:span(Math.round(h*0.90)), at95:span(Math.round(h*0.95))};
};
