import sharp from "sharp";
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0;const l=(mx+mn)/2,d=mx-mn;
 if(d){s=l>0.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?((g-b)/d+(g<b?6:0)):mx===g?((b-r)/d+2):((r-g)/d+4);h*=60;}return [h,s,l];}
const hd=(a,b)=>{const d=Math.abs(a-b)%360;return d>180?360-d:d;};
export async function measure(f){
 const {data,info}=await sharp(f).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const {width:w,height:h}=info; const faceCut=Math.round(h*0.15);
 let x=0,y=0,n=0;
 for(let py=faceCut;py<h;py++)for(let px=0;px<w;px++){const i=(py*w+px)*3;const [hu,s,l]=rgb2hsl(data[i],data[i+1],data[i+2]);
  if(l>0.40||s<0.25)continue;x+=Math.cos(hu*Math.PI/180);y+=Math.sin(hu*Math.PI/180);n++;}
 let hue=Math.atan2(y/n,x/n)*180/Math.PI; if(hue<0)hue+=360;
 const m=Buffer.alloc(w*h); let ss=0,ls=0,cn=0;
 for(let py=faceCut;py<h;py++)for(let px=0;px<w;px++){const i=(py*w+px)*3;const [hu,s,l]=rgb2hsl(data[i],data[i+1],data[i+2]);
  if(l>0.62||s<0.10||hd(hu,hue)>16)continue;m[py*w+px]=255;ss+=s;ls+=l;cn++;}
 const span=py=>{let a=-1,b=-1;for(let px=0;px<w;px++) if(m[py*w+px]){if(a<0)a=px;b=px;} return a<0?0:(b-a);};
 let top=h,bot=0;for(let py=0;py<h;py++){if(span(py)>0){if(py<top)top=py;bot=py;}}
 const len=bot-top, sh=span(top+Math.round(len*0.08));
 let widest=0,wy=0;for(let py=top;py<=bot;py++){const s=span(py);if(s>widest){widest=s;wy=py;}}
 let R=0,B=0,bn=0;
 for(let py=Math.round(h*0.04);py<Math.round(h*0.18);py++)for(let px=Math.round(w*0.02);px<Math.round(w*0.14);px++){const i=(py*w+px)*3;R+=data[i];B+=data[i+2];bn++;}
 return {hue,s:ss/cn,l:ls/cn,hem:bot/h,lenRatio:len/sh,wideRatio:widest/sh,widePos:(wy-top)/len,warmth:(R-B)/bn};
}
