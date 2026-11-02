// Captures 1080x1920 Play Store screenshots of the real game in headless Chrome, using the planning bot to play.
const puppeteer=require("puppeteer-core"), fs=require("fs"), path=require("path");
const out=path.resolve(__dirname,"../../store/screenshots"); fs.mkdirSync(out,{recursive:true});
const planner=fs.readFileSync(path.resolve(__dirname,"../fair.js"),"utf8").split("function hit")[1].split("let unfair")[0];
(async()=>{
  const b=await puppeteer.launch({executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",headless:true,args:["--autoplay-policy=no-user-gesture-required"]});
  const p=await b.newPage(); await p.setViewport({width:432,height:768,deviceScaleFactor:2.5});
  const url="http://127.0.0.1:8799/index.html";
  await p.goto(url); await p.evaluate(()=>localStorage.setItem("wallhop.v1",JSON.stringify({best:347,coins:212,owned:["cube","ember","mint","bubble"],skin:"cube",muted:true})));
  await p.goto(url); await new Promise(r=>setTimeout(r,1500));
  await p.screenshot({path:out+"/1-menu.png"});
  await p.evaluate(src=>{
    const JD=.24,J=Math.ceil(JD*60),JF=JD*60; eval("function hit"+src);
    window.__bot=()=>{const g=window.__wh(); if(g.state==="play"&&g.pl.jt>=1&&plan(g,110)==="J") window.dispatchEvent(new KeyboardEvent("keydown",{code:"Space"})); requestAnimationFrame(window.__bot);};
    document.getElementById("play").click(); requestAnimationFrame(window.__bot);
  },planner);
  async function grab(name,ms){
    for(let tries=0;tries<25;tries++){
      await p.evaluate(()=>{ if(window.__wh().state!=="play"){ window.wallhopBack(); document.getElementById("play").click(); } });
      await new Promise(r=>setTimeout(r,ms));
      const st=await p.evaluate(()=>{const g=window.__wh(); return g.state==="play"&&g.objs.some(o=>o.k!=="coin"&&o.y>g.dist&&o.y<g.dist+500);});
      if(st){ await p.screenshot({path:out+"/"+name}); return; }
      await p.evaluate(()=>{ if(window.__wh().state==="play") window.wallhopBack(); });
    }
  }
  await p.evaluate(()=>window.wallhopBack());
  await grab("2-climb.png",2600); await p.evaluate(()=>window.wallhopBack());
  await grab("3-higher.png",3800);
  await p.evaluate(()=>{window.wallhopBack(); document.getElementById("openShop").click();});
  await new Promise(r=>setTimeout(r,800)); await p.screenshot({path:out+"/4-skins.png"});
  await b.close(); console.log(fs.readdirSync(out));
})();
