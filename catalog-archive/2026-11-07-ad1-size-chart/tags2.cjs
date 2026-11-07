// Tag centres and long-axis angles read off 3x gridded close-ups (tg-all.jpg), corner by corner,
// after the automatic detector failed twice. Centre = middle of the tag body, nudged away from the hole.
const sharp=require('sharp');const [src,out]=process.argv.slice(2);
const T=[[625.3,302,82,'XS'],[214.3,426.7,-37,'M'],[633.7,483.7,40.8,'L'],[659.3,653.8,-70,'S'],[393,771.7,27.2,'XL'],[126,908.7,92.5,'M'],[211.3,986,91,'S'],[447.3,913,-4.5,'L'],[594.7,1136.3,-58.5,'XS']];
let svg='';for(const [x,y,r,l] of T)svg+=`<text x="${x}" y="${y}" transform="rotate(${r} ${x} ${y})" text-anchor="middle" dominant-baseline="central" font-family="Helvetica" font-weight="bold" font-size="16" fill="#1c1c1c" opacity="0.85">${l}</text>`;
sharp(src).composite([{input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="768" height="1344">${svg}</svg>`)}]).png().toFile(out);
