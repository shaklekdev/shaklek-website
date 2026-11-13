// Render one approved v3.js flat to a PNG: node render-flat.cjs <open|buttoned> <front|back> <out.png> [closures]
// v3.js uses import.meta in a CommonJS file, so it is loaded with that line swapped.
const fs=require("fs"),path=require("path"),Module=require("module");
const src=fs.readFileSync(path.join(__dirname,"v3.js"),"utf8").replace(/^const sharp=.*$/m,`const sharp=require(${JSON.stringify(path.join(__dirname,"../../../website/node_modules/sharp"))});`);
const m=new Module(path.join(__dirname,"v3.js"));m.paths=module.paths;m._compile(src,path.join(__dirname,"v3.js"));
const {flat,sharp}=m.exports;
const [,,kind,view,out,closures]=process.argv;
const W=900,H=1500;
const f=flat(0,0,1,{kind,back:view==="back",closures:Number(closures||4)});
sharp(Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/>${f.svg}</svg>`)).png().toFile(out).then(()=>console.log("wrote",out));
