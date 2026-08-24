import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const F=`${process.cwd()}/f8`;
const m=JSON.parse(readFileSync(`${F}/manifest.json`,"utf8"));
const p=k=>`${F}/${m[k]}`;
const seq=[]; const hold=(k,n)=>{for(let i=0;i<n;i++)seq.push(p(k));};

hold("sa0", 20);
for(let k=1;k<=4;k++) hold(`sa${k}`, k<4 ? 16 : 40);   // blouse fills in
for(let i=1;i<4;i++) hold(`sc${i}`, 40);                // then the colour changes
hold("sc0", 34);

for(let k=1;k<=4;k++) hold(`pa${k}`, k<4 ? 16 : 40);   // trousers fill in
for(let i=1;i<4;i++) hold(`pc${i}`, 40);
hold("pc0", 34);

hold("end", 96);

console.log(seq.length,"frames =",(seq.length/30).toFixed(1),"s");
execFileSync("./encode",["/Users/nadatlohi/Desktop/Shaklek/brand-assets/social/reel-grid-4up.mp4","30","1080","1920",...seq],{stdio:"inherit"});
