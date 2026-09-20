const sharp=require(new URL("../../../website/node_modules/sharp", import.meta.url ?? "file://"+__filename).pathname);
const F="Helvetica,Arial,sans-serif";
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
const T=(x,y,t,o={})=>`<text x="${x}" y="${y}" font-family="${F}" font-size="${o.s||26}" font-weight="${o.w||"normal"}" fill="${o.c||"#111"}" text-anchor="${o.a||"start"}">${esc(t)}</text>`;

// ⚠️ THE OPEN ABAYA IS DRAWN OPEN. It was drawn once as a closed garment with a
// neckline, and the founder caught it: "why is the open abaya shown as closed
// and a neck form when there is no neck form". It has no closed neckline and no
// collar -- two front panels, a gap between them widening toward the hem, and
// the back neck curve visible between the shoulders.
function flat(ox,oy,K,{kind,back=false,wide=false,midi=false,closures=4}={}){
  const r=K/1.55;
  const cx=ox+450*K, shY=oy+150*K, shHalf=210*K, uaY=oy+470*K;
  const hemY=oy+(midi?1080:1380)*K, sideX=ox+225*K;
  const neckHalf=(kind==="open"?78:62)*K, neckDrop=46*K;
  const cuffOutX=ox+(wide?6:30)*K, cuffOutY=oy+600*K;
  const cuffInX=ox+(wide?150:105)*K, cuffInY=oy+(wide?770:730)*K;
  const m=x=>2*cx-x;
  const SW=5*r;
  let s="";
  // ⚠️ THE OPEN ABAYA SWEEPS -- the hem is wider than the chest. Checked against
  // the photograph: the side seam falls away from the body, it is not vertical.
  // The BUTTONED one is a straight column and its side seam IS vertical.
  const hemX = kind==="open" ? sideX-84*r : sideX;
  const sleeveSide=()=>`L ${cuffOutX} ${cuffOutY} L ${cuffInX} ${cuffInY} L ${sideX} ${uaY} L ${hemX} ${hemY}`;

  if(kind==="open" && !back){
    const gapTop=16*r, gapHem=54*r, topDrop=52*r;
    const left=`M ${cx-neckHalf} ${shY} L ${cx-shHalf} ${shY} ${sleeveSide()} L ${cx-gapHem} ${hemY} L ${cx-gapTop} ${shY+topDrop} Z`;
    const right=`M ${m(cx-neckHalf)} ${shY} L ${m(cx-shHalf)} ${shY} L ${m(cuffOutX)} ${cuffOutY} L ${m(cuffInX)} ${cuffInY} L ${m(sideX)} ${uaY} L ${m(hemX)} ${hemY} L ${m(cx-gapHem)} ${hemY} L ${m(cx-gapTop)} ${shY+topDrop} Z`;
    s+=`<path d="${left}" fill="#faf8f4" stroke="#111" stroke-width="${SW}" stroke-linejoin="round"/>`;
    s+=`<path d="${right}" fill="#faf8f4" stroke="#111" stroke-width="${SW}" stroke-linejoin="round"/>`;
    // back neck, seen between the shoulders. No collar, no stand.
    s+=`<path d="M ${cx-neckHalf} ${shY} Q ${cx} ${shY+46*r} ${cx+neckHalf} ${shY}" fill="none" stroke="#111" stroke-width="${4*r}"/>`;
    // the fold: deep at the neck, relaxing to nothing before the hem
    // ⚠️ THE BAND RUNS THE WHOLE LENGTH, TO THE HEM. Drawn once tapering away to
    // nothing, which the photograph contradicts: a distinct doubled band is
    // visible on each front edge right down to the floor. "Relaxing" means it
    // stops being pressed flat, NOT that it stops existing.
    const bandW=76*r;
    s+=`<path d="M ${cx-neckHalf-bandW*0.55} ${shY+10*r} L ${cx-gapTop-bandW} ${shY+topDrop+120*r} L ${cx-gapHem-bandW} ${hemY}" fill="none" stroke="#047857" stroke-width="${8*r}" stroke-linejoin="round"/>`;
    s+=`<path d="M ${m(cx-neckHalf-bandW*0.55)} ${shY+10*r} L ${m(cx-gapTop-bandW)} ${shY+topDrop+120*r} L ${m(cx-gapHem-bandW)} ${hemY}" fill="none" stroke="#047857" stroke-width="${8*r}" stroke-linejoin="round"/>`;
  } else {
    const outline=`M ${cx-neckHalf} ${shY} L ${cx-shHalf} ${shY} ${sleeveSide()} L ${m(hemX)} ${hemY} L ${m(sideX)} ${uaY} L ${m(cuffInX)} ${cuffInY} L ${m(cuffOutX)} ${cuffOutY} L ${m(cx-shHalf)} ${shY} L ${m(cx-neckHalf)} ${shY} Z`;
    s+=`<path d="${outline}" fill="#faf8f4" stroke="#111" stroke-width="${SW}" stroke-linejoin="round"/>`;
    if(back){
      s+=`<path d="M ${cx-neckHalf} ${shY} Q ${cx} ${shY+(kind==="open"?46:36)*r} ${cx+neckHalf} ${shY}" fill="none" stroke="#111" stroke-width="${5*r}"/>`;
      if(kind==="open") s+=`<path d="M ${cx-neckHalf-40*r} ${shY+6*r} Q ${cx} ${shY+46*r+54*r} ${cx+neckHalf+40*r} ${shY+6*r}" fill="none" stroke="#047857" stroke-width="${8*r}"/>`;
      // ⚠️ NO YOKE SEAM ON THE BUTTONED BACK. One drawn here once and the
      // founder caught it: the photograph shows ONE clean panel, no horizontal
      // line anywhere. Do not add a yoke because most shirts have one.
      else { /* one unbroken panel -- nothing to draw */ }
    } else {
      // ⚠️ ROUND NECKLINE, NOT A V. Drawn as a V once, from the wording of the
      // generation prompt rather than from the approved photograph, and the
      // founder caught it. The photo shows a round collarless neck opening with
      // a short straight SLIT at the centre front where the opening starts.
      s+=`<path d="M ${cx-neckHalf} ${shY} Q ${cx} ${shY+neckDrop*1.7} ${cx+neckHalf} ${shY}" fill="none" stroke="#111" stroke-width="${5*r}"/>`;
      const first=shY+neckDrop+105*r, last=closures===5?uaY+300*r:uaY+45*r;
      // ⚠️ A SMALL V OPENING BETWEEN THE NECKLINE AND THE FIRST CLOSURE.
      // Missed once. The two front edges separate into a narrow V just below
      // the round neck, widening slightly, and the FIRST BAR closes it. Below
      // that bar they meet as a single straight line to the hem.
      // ⚠️ THE V POINTS DOWN. Wide where it leaves the round neckline, tapering
      // to a POINT at the first closure bar. Drawn upside down once -- narrow at
      // the neck, widening downward -- which is a different garment.
      const vTop=shY+neckDrop*0.86, vHalf=26*r;   // = the lowest point of the neck curve, so the V starts AT the neckline
      s+=`<line x1="${cx-vHalf}" y1="${vTop}" x2="${cx}" y2="${first}" stroke="#111" stroke-width="${4*r}"/>`;
      s+=`<line x1="${cx+vHalf}" y1="${vTop}" x2="${cx}" y2="${first}" stroke="#111" stroke-width="${4*r}"/>`;
      // between the bars the two edges meet; BELOW THE LOWEST BAR they part.
      s+=`<line x1="${cx}" y1="${first}" x2="${cx}" y2="${last}" stroke="#111" stroke-width="${4*r}"/>`;
      // ⚠️ FOUR CLOSURES IS WORN OPEN, so below the lowest bar the two front
      // edges SEPARATE and stay apart to the hem -- in the photograph you can
      // see straight through to what is underneath. Drawn once as a single
      // closed centre line, which is the five-closure version, not this one.
      if(closures===5){
        s+=`<line x1="${cx}" y1="${last}" x2="${cx}" y2="${hemY}" stroke="#111" stroke-width="${4*r}"/>`;
      } else {
        s+=`<line x1="${cx-4*r}" y1="${last}" x2="${cx-34*r}" y2="${hemY}" stroke="#111" stroke-width="${4*r}"/>`;
        s+=`<line x1="${cx+4*r}" y1="${last}" x2="${cx+34*r}" y2="${hemY}" stroke="#111" stroke-width="${4*r}"/>`;
      }
      // ⚠️ THE BARS ARE SHORT. Measured off the photograph: the bar spans about
      // a fifth of the body width, not a third. They were drawn far too wide.
      for(let i=0;i<closures;i++){const y=first+i*(last-first)/(closures-1);
        s+=`<rect x="${cx-75*r}" y="${y-9*r}" width="${150*r}" height="${18*r}" rx="${9*r}" fill="#111"/><circle cx="${cx}" cy="${y}" r="${14*r}" fill="#111" stroke="#fff" stroke-width="2.5"/>`;}
    }
  }
  // seams, both kinds
  s+=`<line x1="${cx-shHalf}" y1="${shY}" x2="${sideX}" y2="${uaY}" stroke="#b00000" stroke-width="${7*r}"/><line x1="${m(cx-shHalf)}" y1="${shY}" x2="${m(sideX)}" y2="${uaY}" stroke="#b00000" stroke-width="${7*r}"/>`;
  const bw=`stroke="#0369a1" stroke-width="${6*r}" stroke-dasharray="${16*r} ${10*r}"`;
  s+=`<line x1="${cuffInX}" y1="${cuffInY}" x2="${sideX}" y2="${uaY}" ${bw}/><line x1="${m(cuffInX)}" y1="${cuffInY}" x2="${m(sideX)}" y2="${uaY}" ${bw}/>`;
  s+=`<line x1="${sideX}" y1="${uaY}" x2="${hemX}" y2="${hemY}" ${bw}/><line x1="${m(sideX)}" y1="${uaY}" x2="${m(hemX)}" y2="${hemY}" ${bw}/>`;
  if(kind==="open"){
    const cm=[(cuffOutX+cuffInX)/2,(cuffOutY+cuffInY)/2], am=[((cx-shHalf)+sideX)/2,(shY+uaY)/2];
    let vx=am[0]-cm[0], vy=am[1]-cm[1]; const L=Math.hypot(vx,vy)||1, d=66*r;
    vx=vx/L*d; vy=vy/L*d;
    s+=`<line x1="${cuffOutX+vx}" y1="${cuffOutY+vy}" x2="${cuffInX+vx}" y2="${cuffInY+vy}" stroke="#047857" stroke-width="${9*r}"/>`;
    s+=`<line x1="${m(cuffOutX+vx)}" y1="${cuffOutY+vy}" x2="${m(cuffInX+vx)}" y2="${cuffInY+vy}" stroke="#047857" stroke-width="${9*r}"/>`;
  }
  return {svg:s,cx,shY,uaY,hemY};
}
module.exports={flat,T,esc,sharp};
