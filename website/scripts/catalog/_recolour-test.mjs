// A TRUE recolour: rotate the garment's hue, keep lightness and saturation.
// Nothing is regenerated, so every fold, crease and thread survives exactly.
import sharp from "sharp";
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);
  let h=0,s=0;const l=(mx+mn)/2;const d=mx-mn;
  if(d){s=l>0.5?d/(2-mx-mn):d/(mx+mn);
    h=mx===r?((g-b)/d+(g<b?6:0)):mx===g?((b-r)/d+2):((r-g)/d+4);h*=60;}
  return [h,s,l];}
function hsl2rgb(h,s,l){h=((h%360)+360)%360;
  const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;
  let r=0,g=0,b=0;
  if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}
  else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}
  return [Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255)];}
const hueDist=(a,b)=>{const d=Math.abs(a-b)%360;return d>180?360-d:d;};

export async function recolour(inPath,outPath,{srcHue=353,dstHue=212,window=40,maxL=0.55,minS=0.12,satScale=1}={}){
  const im=sharp(inPath);const {width:w,height:h}=await im.metadata();
  const {data}=await im.removeAlpha().raw().toBuffer({resolveWithObject:true});
  let touched=0;
  // ⚠️ FACE GUARD. Lipstick sits at almost the same hue as burgundy and is
  // dark enough to pass the lightness ceiling, so it recolours with the cloth
  // and she ends up with blue lips. The abaya's highest point is its collar,
  // which never reaches above ~17% of frame height in this framing, so
  // nothing above 15% is ever garment.
  const faceCut = Math.round(h * 0.15) * w * 3;
  for(let i=0;i<data.length;i+=3){
    if(i < faceCut) continue;
    const [hu,s,l]=rgb2hsl(data[i],data[i+1],data[i+2]);
    // Garment only: near the source hue, dark enough, saturated enough.
    // The lightness ceiling keeps lit skin out; the hue window keeps the
    // tan sandals and the ivory dress out.
    // ⚠️ TWO GUARDS, BOTH MANDATORY, BOTH FROM CLAUDE.md SECTION 5.
    // LIGHTNESS CEILING: fabric sits at l~0.20-0.27, lit skin at l~0.33+.
    // SKIN-BAND EXCLUSION: burgundy at h~353 has a window that wraps past
    // 360 into skin hues (~20-35), which turns faces, hands and the tan
    // sandals green. Without this the whole model recolours with the cloth.
    // ⚠️ THE SKIN BAND ONLY PROTECTS LIGHT PIXELS. Skin is lit and pale;
    // fabric in deep shadow drifts to a rust hue that lands in the same band,
    // and a blanket exclusion left rust specks all over the garment that were
    // plainly visible at product-page size. Skin sits above l~0.34, shadowed
    // cloth below it, so the lightness test separates them.
    const inSkinBand = hu >= 6 && hu <= 60;
    if(s>=minS && l<=maxL && !inSkinBand && hueDist(hu,srcHue)<=window){
      // ⚠️ SIGNED hue difference WITH WRAP. Plain (hu - srcHue) is wrong near
      // 0/360: a pixel at 5 deg is 12 deg from burgundy at 353, but the naive
      // subtraction gives -348, and a quarter of that lands the pixel in
      // GREEN. That is what speckled the first attempt.
      const dh = ((hu - srcHue + 540) % 360) - 180;
      const [r,g,b]=hsl2rgb(dstHue + dh*0.25, Math.min(1,s*satScale), l);
      data[i]=r;data[i+1]=g;data[i+2]=b;touched++;
    }
  }
  // ⚠️ SECOND PASS: DESPECKLE BY NEIGHBOURHOOD, NOT BY COLOUR.
  // Shadowed skin and shadowed burgundy overlap in hue AND lightness, so no
  // threshold separates them -- tightening to catch the rust specks turned
  // her neck, hands and sandals blue. But a leftover rust pixel surrounded by
  // navy is cloth, and one surrounded by skin is skin. Position settles what
  // colour cannot.
  const out=Buffer.from(data);
  const isRust=(i)=>{const [hu,s2,l2]=rgb2hsl(data[i],data[i+1],data[i+2]);
    return s2>0.10 && l2<0.60 && (hu>=330||hu<=45);};
  const isNavy=(i)=>{const [hu,s2,l2]=rgb2hsl(data[i],data[i+1],data[i+2]);
    return l2<0.60 && hu>150 && hu<260;};
  // ⚠️ NEVER DESPECKLE WHERE THE HANDS ARE. The shadows between her fingers
  // are dark, reddish and ringed by garment -- indistinguishable from a rust
  // speck by neighbourhood -- so the pass ate into her hand and turned the
  // finger gaps navy. Her hands hang in a narrow, predictable band in this
  // framing, and there are almost no specks there anyway.
  const handTop=Math.round(h*0.44), handBot=Math.round(h*0.62);
  for(let y=1;y<h-1;y++) for(let x=1;x<w-1;x++){
    if(y>=handTop && y<=handBot) continue;
    const i=(y*w+x)*3;
    if(!isRust(i)) continue;
    let navy=0, sum=[0,0,0], n=0;
    for(let dy=-12;dy<=12;dy+=2) for(let dx=-12;dx<=12;dx+=2){
      if(!dx&&!dy) continue;
      const ny=y+dy, nx=x+dx;
      if(ny<0||ny>=h||nx<0||nx>=w) continue;
      const j=(ny*w+nx)*3;
      if(isNavy(j)){navy++; sum[0]+=data[j];sum[1]+=data[j+1];sum[2]+=data[j+2];n++;}
    }
    // Surrounded by navy on nearly every side: it is cloth, not skin.
    if(navy>=60 && n){ out[i]=sum[0]/n; out[i+1]=sum[1]/n; out[i+2]=sum[2]/n; }
  }
  await sharp(out,{raw:{width:w,height:h,channels:3}}).jpeg({quality:94,mozjpeg:true}).toFile(outPath);
  return touched/(w*h);
}
