// Headless test: runs the real game script with stubbed DOM, a fixed 60fps clock, and a look-ahead bot.
const fs=require("fs");
const html=fs.readFileSync(process.argv[2],"utf8");
const code=html.split("<script>")[1].split("</script>")[0];
function el(id){return {id,hidden:false,style:{},textContent:"",firstChild:{nodeValue:""},focus(){},append(){},setAttribute(){},onclick:null,
  addEventListener(){},getBoundingClientRect:()=>({width:390,height:844}),getContext:()=>ctxStub,innerHTML:"",className:""};}
const ctxStub=new Proxy({},{get:(t,k)=>k==="createLinearGradient"?()=>({addColorStop(){}}):(typeof k==="string"?(t[k]??(()=>{})):undefined),set:(t,k,v)=>(t[k]=v,true)});
const els={}; const listeners={};
global.document={getElementById:id=>els[id]||(els[id]=el(id)),createElement:()=>el("x"),addEventListener(){},hidden:false};
let rafCb=null; const store={};
global.window={devicePixelRatio:1,addEventListener:(t,f)=>{(listeners[t]=listeners[t]||[]).push(f)},AudioContext:undefined};
global.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v};
global.requestAnimationFrame=f=>{rafCb=f}; global.performance={now:()=>0}; global.navigator={};
global.setTimeout=(f)=>{f();return 0}; global.clearTimeout=()=>{};
new Function("window","document",code)(window,document);
let ts=0; const step=()=>{ts+=1000/60; const f=rafCb; rafCb=null; f&&f(ts);};
step();step();
const press=()=>listeners.keydown.forEach(f=>f({code:"Space",preventDefault(){}}));
function runOnce(bot){
  els.play.onclick(); let frames=0, maxM=0;
  while(frames<60*240){ // up to 4 minutes
    const g=window.__wh();
    if(g.state!=="play") break;
    if(bot){ // jump if the current wall is about to be hit by a spike within lookahead, and the other side is clear
      const side=g.pl.side, look=g.P*1.2+ (250+g.dist*.024)*0.30;
      const danger=(s,from,to)=>g.objs.some(o=>o.k==="spike"&&o.side===s&&o.y<g.dist+g.P+to&&o.y+o.len>g.dist+from);
      const sawNear=g.objs.some(o=>o.k==="saw"&&Math.abs(o.y-(g.dist+g.P/2))< g.P*1.2+(250+g.dist*.024)*0.24);
      if(g.pl.jt>=1 && danger(side,-g.P*.2,look) && !sawNear) press();
    }
    step(); frames++; maxM=Math.floor(window.__wh().dist/32);
  }
  for(let i=0;i<60;i++) step();
  return {m:maxM, secs:(frames/60).toFixed(1), state:window.__wh().state, deadShown:!els.dead.hidden, coins:window.__wh().save.coins};
}
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
