// Fairness test: a planning bot searches stay/jump choices ~2s ahead with the game's own hitboxes.
// If no safe plan exists from a standing position, the generated layout was unfair.
const fs=require("fs");
const src=fs.readFileSync("tools/sim.js","utf8").split("// Death diagnostics")[0].split("const noBot=")[0];
eval(src);
const JD=.24, J=Math.ceil(JD*60), JF=JD*60;
function hit(g,x,dist,t){
  const px=x+3,pw=g.P-6,ph=g.P-6,pyT=g.PY+3, sy=wy=>g.PY+g.P-(wy-dist);
  for(const o of g.objs){
    if(o.k==="spike"){const top=sy(o.y+o.len),bot=sy(o.y); if(bot<pyT||top>pyT+ph) continue;
      const x0=o.side===0?g.WALL:g.W-g.WALL-g.SPIKE; if(px<x0+g.SPIKE&&px+pw>x0) return true;}
    else if(o.k==="saw"){const amp=Math.max(0,g.W/2-g.WALL-g.P-o.r-8); const sx=o.move?g.W/2+Math.sin(t*2.6+o.ph)*amp:g.W/2, syy=sy(o.y), r=o.r*.82;
      const nx=Math.max(px,Math.min(sx,px+pw)),ny=Math.max(pyT,Math.min(syy,pyT+ph)); if((sx-nx)**2+(syy-ny)**2<r*r) return true;}
  }
  return false;
}
function plan(g,HOR){
  const v=Math.min(600,250+g.dist*.024), sideX=s=>s===0?g.WALL:g.W-g.WALL-g.P, memo=new Map();
  const D=f=>g.dist+v*f/60, T=f=>g.t+f/60;
  function ok(f,side){
    if(f>=HOR) return true; const k=f*2+side; if(memo.has(k)) return memo.get(k);
    let r=false;
    // jump now
    let safe=true;
    for(let i=1;i<=J&&safe;i++){const e0=Math.min(1,i/JF),e=e0<.5?2*e0*e0:1-Math.pow(-2*e0+2,2)/2; const x=sideX(side)+(sideX(1-side)-sideX(side))*e; if(hit(g,x,D(f+i),T(f+i))) safe=false;}
    if(safe&&ok(f+J,1-side)) r="J";
    if(!r&&!hit(g,sideX(side),D(f+1),T(f+1))&&ok(f+1,side)) r="S";
    memo.set(k,r); return r;
  }
  return ok(0,g.pl.side);
}
let unfair=0, total=0; const heights=[];
for(let run=0;run<12;run++){
  els.play.onclick(); let frames=0;
  while(window.__wh().state==="play"&&frames<60*150){
    const g=window.__wh();
    if(g.pl.jt>=1){ const p=plan(g,130); if(p==="J") press(); if(!p){unfair++; const near=g.objs.filter(o=>o.k!=="coin"&&o.y<g.dist+600&&o.y+(o.len||0)>g.dist-50).map(o=>o.k+(o.k==="spike"?`(s${o.side} ${Math.round(o.y-g.dist)}..${Math.round(o.y+o.len-g.dist)})`:`(${o.move?"move":"static"} ${Math.round(o.y-g.dist)})`)); console.log("NO SAFE PLAN at",Math.floor(g.dist/32)+"m side",g.pl.side,near.join(" ")); for(let i=0;i<200&&window.__wh().state==="play";i++) step(); break;} }
    step(); frames++;
  }
  heights.push(Math.floor(window.__wh().dist/32)+(window.__wh().state==="play"?"+":"")); for(let i=0;i<60;i++) step(); if(window.__wh().state==="play") window.wallhopBack();
}
console.log("heights:",heights.join(" "),"unfair:",unfair);
