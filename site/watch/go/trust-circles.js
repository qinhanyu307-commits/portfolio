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
 // Cover only the original grey outlines; keep the photograph, labels and pink centre intact.
 function outlineCover(){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(art,0,top,width,height,0,0,width,height);
  const source=ctx.getImageData(0,0,width,height).data,cover=ctx.createImageData(width,height),data=cover.data;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const at=(y*width+x)*4,r=source[at],g=source[at+1],b=source[at+2],worldY=y+top;
   if(r<30||r>240||Math.max(r,g,b)-Math.min(r,g,b)>18)continue;

   const distances=circles.map(c=>Math.hypot(x-c.x,worldY-c.y)-c.r);
   if(!distances.some(distance=>Math.abs(distance)<8))continue;
   // Keep the type's edge pixels without retaining the surrounding static arc.
   if(x>=1280&&x<=1555&&worldY>=4765&&worldY<=4875){
    let nearType=false;
    for(let dy=-2;dy<=2&&!nearType;dy++)for(let dx=-2;dx<=2;dx++){const sample=((y+dy)*width+x+dx)*4;if(source[sample]>220&&source[sample+1]>220&&source[sample+2]>220){nearType=true;break;}}
    if(nearType)continue;
   }
   const pink=distances.every(distance=>distance<=0);
   data[at]=pink?251:17;data[at+1]=pink?171:17;data[at+2]=pink?206:17;data[at+3]=255;
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
  const start=new IntersectionObserver(entries=>{
   if(!entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>=.25))return;
   start.disconnect();stage.dataset.state='playing';stage.dataset.startedAt=String(performance.now());
   const animations=paths.map((path,index)=>path.animate([{strokeDashoffset:1,opacity:.35},{strokeDashoffset:0,opacity:1}],{duration:circles[index].duration,delay:circles[index].delay,easing:'cubic-bezier(.25,.1,.25,1)',fill:'both',iterations:1}));
   Promise.all(animations.map(animation=>animation.finished)).then(()=>{
    stage.dataset.state='complete';stage.dataset.finishedAt=String(performance.now());stage.classList.add('is-complete');animations.forEach(animation=>animation.cancel());
   });
  },{threshold:[0,.25]});start.observe(stage);
 }
 const ready=new IntersectionObserver(entries=>{if(!entries.some(entry=>entry.isIntersecting))return;ready.disconnect();mount().catch(()=>{/* The original illustration remains available if enhancement fails. */});},{rootMargin:'1200px'});ready.observe(part);
})();
