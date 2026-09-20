import sharp from "sharp";
// Warm a pale garment back to the set's ivory, WITHOUT touching the backdrop.
//
// ⚠️ neutralise-backdrop.mjs applies ONE gain to the whole frame. That is right
// when the cast is the camera's, and wrong when the backdrop is much warmer
// than the garment: on the two short cells the backdrop was +16, so correcting
// it to neutral stripped the ivory out of the linen as well. Measured after:
// garment warmth 0 and +1, saturation 0.03-0.05, against +7/+9 and 0.13-0.17 on
// the long cells and +5/0.13 on a real ivory garment in the catalogue.
// Founder saw it without measuring: "the short abaya looks more white than ivory".
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0;const l=(mx+mn)/2,d=mx-mn;
 if(d){s=l>0.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?((g-b)/d+(g<b?6:0)):mx===g?((b-r)/d+2):((r-g)/d+4);h*=60;}return [h,s,l];}
function hsl2rgb(h,s,l){h=((h%360)+360)%360;const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;
 let r=0,g=0,b=0;
 if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}
 else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}
 return [(r+m)*255,(g+m)*255,(b+m)*255];}

// Target, measured off the two approved long cells.
const TARGET_H = 30, TARGET_S = 0.15;

export async function warmGarment(inPath, outPath){
 const {data,info}=await sharp(inPath).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const {width:w,height:h}=info;
 const faceCut=Math.round(h*0.15);
 // ⚠️ THE MASK IS THE PALE GARMENT ONLY. Lightness >= 0.80 keeps the navy set,
 // her skin and her shadow out; the backdrop is excluded by requiring the pixel
 // to sit INSIDE the figure's horizontal span, since the backdrop is just as
 // light. Found by column, per row, so a sleeve reaching outward still counts.
 const out=Buffer.from(data);
 let before=[0,0,0,0], after=[0,0,0,0];
 for(let y=faceCut;y<h;y++){
  // the figure's span on this row: first and last column that is NOT backdrop
  let a=-1,b=-1;
  for(let x=0;x<w;x++){const i=(y*w+x)*3;
   const mx=Math.max(data[i],data[i+1],data[i+2]),mn=Math.min(data[i],data[i+1],data[i+2]);
   const l=(mx+mn)/2/255, sat=mx===mn?0:(mx-mn)/(l>0.5?(2*255-mx-mn):(mx+mn));
   // not backdrop = either darker than the sweep, or warmer than it
   if(l<0.88 || (data[i]-data[i+2])>6){ if(a<0)a=x; b=x; }}
  if(a<0) continue;
  for(let x=a;x<=b;x++){
   const i=(y*w+x)*3;
   const [hu,s,l]=rgb2hsl(data[i],data[i+1],data[i+2]);
   if(l<0.80) continue;              // navy set, skin, shadow
   before[0]+=data[i];before[1]+=data[i+1];before[2]+=data[i+2];before[3]++;
   const [nr,ng,nb]=hsl2rgb(TARGET_H, Math.max(s,TARGET_S), l);
   out[i]=Math.round(nr);out[i+1]=Math.round(ng);out[i+2]=Math.round(nb);
   after[0]+=out[i];after[1]+=out[i+1];after[2]+=out[i+2];after[3]++;
  }
 }
 await sharp(out,{raw:{width:w,height:h,channels:3}}).jpeg({quality:92,mozjpeg:true}).toFile(outPath);
 const m=a=>`rgb(${(a[0]/a[3]).toFixed(0)},${(a[1]/a[3]).toFixed(0)},${(a[2]/a[3]).toFixed(0)}) warmth ${((a[0]-a[2])/a[3]).toFixed(0)}`;
 return {before:m(before), after:m(after), px:before[3]};
}
