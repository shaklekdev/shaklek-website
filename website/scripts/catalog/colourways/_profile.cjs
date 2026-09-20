const sharp=require("sharp");
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0;const l=(mx+mn)/2,d=mx-mn;
 if(d){s=l>0.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?((g-b)/d+(g<b?6:0)):mx===g?((b-r)/d+2):((r-g)/d+4);h*=60;}return [h,s,l];}
const hd=(a,b)=>{const d=Math.abs(a-b)%360;return d>180?360-d:d;};
module.exports=async function profile(f){
 let pale=false;
 const {data,info}=await sharp(f).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const {width:w,height:h}=info;const fc=Math.round(h*0.15);
 // ⚠️ TWO STRATEGIES, PICKED BY WHAT IS ACTUALLY IN THE FRAME. The dark test
 // below finds a burgundy or navy garment by hue. On an IVORY or WHITE abaya it
 // finds nothing of the sort -- it locks onto whatever navy shirt is underneath
 // -- and every measurement came back Infinity or NaN. That is why four broken
 // pale frames shipped past a gate that was supposed to catch them, and why
 // every ivory cell since has been judged by eye. Same split as
 // prepare-masks.mjs, for the same reason.
 let x=0,y=0,n=0;
 for(let py=fc;py<h;py++)for(let px=0;px<w;px++){const i=(py*w+px)*3;const [hu,s,l]=rgb2hsl(data[i],data[i+1],data[i+2]);
  if(l>0.40||s<0.25)continue;x+=Math.cos(hu*Math.PI/180);y+=Math.sin(hu*Math.PI/180);n++;}
 let hue=Math.atan2(y/n,x/n)*180/Math.PI;if(hue<0)hue+=360;
 const m=Buffer.alloc(w*h);
 let dark=0;
 for(let py=fc;py<h;py++)for(let px=0;px<w;px++){const i=(py*w+px)*3;const [hu,s,l]=rgb2hsl(data[i],data[i+1],data[i+2]);
  if(l>0.62||s<0.10||hd(hu,hue)>16)continue;m[py*w+px]=255;dark++;}
 // A real garment fills 15-30% of these frames. Far less than that means the
 // hue test found something else, so fall back to warmth: the linen is warm and
 // the studio is cool, measured at R-B >= 3 with lightness >= 0.60.
 if(dark < w*h*0.08){
  m.fill(0); pale=true;
  for(let py=fc;py<h;py++)for(let px=0;px<w;px++){const i=(py*w+px)*3;
   const R=data[i],G=data[i+1],B=data[i+2];
   const mx=Math.max(R,G,B),mn=Math.min(R,G,B);
   if((mx+mn)/2/255<0.60) continue;
   if(R-B<3) continue;
   m[py*w+px]=255;}
 }
 const span=py=>{let a=-1,b=-1,c=0;for(let px=0;px<w;px++) if(m[py*w+px]){if(a<0)a=px;b=px;c++;} return a<0?0:(b-a);};
 const solid=py=>{let c=0;for(let px=0;px<w;px++) if(m[py*w+px]) c++; return c;};
 // ⚠️ A ROW COUNTS AS GARMENT ONLY IF IT IS AT LEAST 8% OF THE FRAME WIDE.
 // Without this, one thin strip of shadow at the hem extends the garment
 // downwards and the measurement inverts: the burgundy MIDI back read 3.80
 // against the MAXI back's 3.77, i.e. the short one measured longer than the
 // long one. That number is impossible, and a prompt built on it would have
 // told a midi cell how long to be using the maxi cell's proportion.
 const MIN = w * 0.08;
 let top=h,bot=0;for(let py=0;py<h;py++){if(solid(py)>MIN){if(py<top)top=py;bot=py;}}
 const len=bot-top, sh=span(top+Math.round(len*0.08));
 const at=p=>span(top+Math.round(len*p))/sh;
 let R=0,B=0,bn=0;
 for(let py=Math.round(h*0.04);py<Math.round(h*0.18);py++)for(let px=Math.round(w*0.02);px<Math.round(w*0.14);px++){const i=(py*w+px)*3;R+=data[i];B+=data[i+2];bn++;}
 return {lenRatio:len/sh, sleeve:at(0.35), hip:at(0.55), knee:at(0.75), hue, warmth:(R-B)/bn, pale, shoulderPx:sh};
};
