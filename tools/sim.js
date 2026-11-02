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
const noBot=runOnce(false);
console.log("no input:",JSON.stringify(noBot));
const res=[]; for(let i=0;i<15;i++) res.push(runOnce(true));
console.log("bot runs (m):",res.map(r=>r.m).join(" "));
console.log("bot secs:",res.map(r=>r.secs).join(" "));
console.log("saved:",store["wallhop.v1"]);
// Death diagnostics
for(let i=0;i<10;i++){
  els.play.onclick(); let prev=null;
  while(window.__wh().state==="play"){ const g=window.__wh();
    const side=g.pl.side, look=g.P*1.2+(250+g.dist*.024)*0.30;
    const danger=(s,from,to)=>g.objs.some(o=>o.k==="spike"&&o.side===s&&o.y<g.dist+g.P+to&&o.y+o.len>g.dist+from);
    const sawNear=g.objs.some(o=>o.k==="saw"&&Math.abs(o.y-(g.dist+g.P/2))< g.P*1.2+(250+g.dist*.024)*0.24);
    if(g.pl.jt>=1 && danger(side,-g.P*.2,look) && !sawNear) press();
    prev={dist:g.dist,jt:g.pl.jt,side:g.pl.side,x:g.pl.x}; step(); }
  const g=window.__wh();
  const near=g.objs.filter(o=>Math.abs((o.y+(o.len||0)/2)-g.dist)<g.P*6&&o.k!=="coin").map(o=>o.k+(o.k==="spike"?`(s${o.side} ${Math.round(o.y-g.dist)}..${Math.round(o.y+o.len-g.dist)})`:`(${o.move?"move":"static"} ${Math.round(o.y-g.dist)})`));
  console.log(Math.floor(g.dist/32)+"m", "pl side",prev.side,"jt",prev.jt.toFixed(2), near.join(" "));
}
