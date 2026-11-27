(() => {
 const part=document.getElementById('part-4'),art=part?.querySelector('img');if(!art)return;
 const top=4380,width=1920,height=1410,ns='http://www.w3.org/2000/svg';
 const circles=[
  {x:762.620,y:5037.848,r:541.458,start:157,end:450,delay:0,duration:3400},
  {x:1303.423,y:4932.403,r:262.673,start:-90,end:270,delay:400,duration:3200},
  {x:1312.658,y:5314.565,r:383.056,start:45,end:356,delay:1000,duration:3000}
 ];
 function pathFor(circle){
  const point=angle=>{const t=angle*Math.PI/180;return [circle.x+Math.cos(t)*circle.r,circle.y-top+Math.sin(t)*circle.r];};
  const arc=(angle,large)=>`A${circle.r} ${circle.r} 0 ${large} 1 ${point(angle).join(' ')}`;
  return `M${point(circle.start).join(' ')} `+(circle.end-circle.start>=360?arc(circle.start+180,0)+' '+arc(circle.end,0):arc(circle.end,1));
 }
 // Mask each complete outline band, including dark JPEG fringes, before drawing it again.
 function outlineCover(){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(art,0,top,width,height,0,0,width,height);
  const source=ctx.getImageData(0,0,width,height).data,cover=ctx.createImageData(width,height),data=cover.data;
  const background=source.slice((100*width+400)*4,(100*width+400)*4+3);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const at=(y*width+x)*4,worldY=y+top;
   let nearOutline=false,pink=true;
   for(const circle of circles){
    const dx=x-circle.x,dy=worldY-circle.y,squared=dx*dx+dy*dy;
    if(squared>(circle.r-12)**2&&squared<(circle.r+12)**2)nearOutline=true;
    if(squared>circle.r*circle.r)pink=false;
   }
   if(!nearOutline)continue;
   // Keep the type's edge pixels without retaining the surrounding static arc.
   if(x>=1280&&x<=1555&&worldY>=4765&&worldY<=4875){
    let nearType=false;
    for(let dy=-2;dy<=2&&!nearType;dy++)for(let dx=-2;dx<=2;dx++){const sample=((y+dy)*width+x+dx)*4;if(source[sample]>220&&source[sample+1]>220&&source[sample+2]>220){nearType=true;break;}}
    if(nearType)continue;
   }
   data[at]=pink?251:background[0];data[at+1]=pink?171:background[1];data[at+2]=pink?206:background[2];data[at+3]=255;
  }
  ctx.putImageData(cover,0,0);return canvas;
 }
 async function mount(){
  await art.decode();if(part.querySelector('.trust-circle-stage'))return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const stage=document.createElement('div');stage.className='trust-circle-stage';stage.style.top=(top/art.naturalHeight*100)+'%';stage.dataset.state='ready';stage.dataset.duration='4000';stage.setAttribute('aria-hidden','true');
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
  const paths=circles.map(circle=>{const path=document.createElementNS(ns,'path');for(const [key,value] of Object.entries({d:pathFor(circle),fill:'none',stroke:'#929292','stroke-width':3,pathLength:1,'stroke-dasharray':'1 1','stroke-dashoffset':1}))path.setAttribute(key,value);svg.append(path);return path;});
  stage.append(outlineCover(),svg);part.classList.add('has-trust-circles');part.append(stage);
  let armed=true,run=0,animations=[];
  const cancel=()=>{run++;animations.forEach(animation=>animation.cancel());animations=[];};
  const play=()=>{
   cancel();const currentRun=run;
   stage.classList.remove('is-complete');stage.dataset.state='playing';stage.dataset.startedAt=String(performance.now());delete stage.dataset.finishedAt;
   stage.dataset.playCount=String(Number(stage.dataset.playCount||0)+1);
   animations=paths.map((path,index)=>path.animate([{strokeDashoffset:1,opacity:.35},{strokeDashoffset:0,opacity:1}],{duration:circles[index].duration,delay:circles[index].delay,easing:'cubic-bezier(.25,.1,.25,1)',fill:'both',iterations:1}));
   Promise.all(animations.map(animation=>animation.finished)).then(()=>{
    if(currentRun!==run)return;
    stage.dataset.state='complete';stage.dataset.finishedAt=String(performance.now());stage.classList.add('is-complete');cancel();
   }).catch(()=>{/* Leaving the viewport cancels this run; the next visit starts fresh. */});
  };
  const visibility=new IntersectionObserver(entries=>{
   for(const entry of entries){
    if(!entry.isIntersecting){
     armed=true;
     if(stage.dataset.state==='playing'){cancel();stage.dataset.state='ready';}
    }else if(armed&&entry.intersectionRatio>=.25){armed=false;play();}
   }
  },{threshold:[0,.25]});visibility.observe(stage);
 }
 const ready=new IntersectionObserver(entries=>{if(!entries.some(entry=>entry.isIntersecting))return;ready.disconnect();mount().catch(()=>{/* The original illustration remains available if enhancement fails. */});},{rootMargin:'1200px'});ready.observe(part);
})();
