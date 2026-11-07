// Pile recolour: move the garments off Shaklek's own four colours so the "rejected" clothes
// never read as ours. Burgundy -> olive, navy -> charcoal, ivory -> stone grey. White stays (generic).
// Tags (near-neutral, light) and string (tan, low sat) fall outside every window.
const sharp=require('sharp');const [src,out]=process.argv.slice(2);
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0,l=(mx+mn)/2;const d=mx-mn;
 if(d){s=l>0.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?((g-b)/d+(g<b?6:0)):mx===g?((b-r)/d+2):((r-g)/d+4);h*=60;}return [h,s,l];}
function hsl2rgb(h,s,l){h=((h%360)+360)%360/360;const f=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};
 if(!s)return [l,l,l].map(v=>Math.round(v*255));const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;return [f(p,q,h+1/3),f(p,q,h),f(p,q,h-1/3)].map(v=>Math.round(v*255));}
(async()=>{const {data,info}=await sharp(src).removeAlpha().raw().toBuffer({resolveWithObject:true});let nb=0,nn=0,ni=0;
 for(let i=0;i<data.length;i+=3){const px=(i/3)%info.width,py=Math.floor(i/3/info.width);const [h,s,l]=rgb2hsl(data[i],data[i+1],data[i+2]);let o=null;
  const burg=(h>=320||h<=12)&&s>0.18&&l<0.45, navy=h>=190&&h<=260&&s>0.05&&l<0.42, ivory=px>40&&px<350&&py>110&&py<400&&h>=25&&h<=60&&s>0.15&&l>0.70&&l<0.95;
  if(burg){o=hsl2rgb(62,Math.min(0.26,s*0.55),l*1.1);nb++;}
  else if(navy){o=hsl2rgb(30,0.04,l*1.05);nn++;}
  else if(ivory){o=hsl2rgb(205,0.08,l*0.93);ni++;}
  if(o){data[i]=o[0];data[i+1]=o[1];data[i+2]=o[2];}}
 console.log({burgundy:nb,navy:nn,ivory:ni});
 await sharp(data,{raw:{width:info.width,height:info.height,channels:3}}).png().toFile(out);})();
