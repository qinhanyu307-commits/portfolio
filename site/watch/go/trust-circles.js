(() => {
 const part=document.getElementById('part-4'),art=part?.querySelector('img');if(!art)return;
 const ns='http://www.w3.org/2000/svg',width=1680,height=1355;
 const circles=[
  {x:642.62,y:624,r:541.458,start:157,end:450,delay:0,duration:3400},
  {x:1192.658,y:507,r:284.5,start:-90,end:270,delay:400,duration:3200},
  {x:1192.658,y:899.565,r:383.056,start:46,end:356,delay:1000,duration:3000}
 ];
 const node=(tag,attributes={})=>{const e=document.createElementNS(ns,tag);for(const [key,value] of Object.entries(attributes))e.setAttribute(key,value);return e;};
 function pathFor(circle){
  const point=angle=>{const t=angle*Math.PI/180;return [circle.x+Math.cos(t)*circle.r,circle.y+Math.sin(t)*circle.r];};
  const arc=(angle,large)=>`A${circle.r} ${circle.r} 0 ${large} 1 ${point(angle).join(' ')}`;
  return `M${point(circle.start).join(' ')} `+(circle.end-circle.start>=360?arc(circle.start+180,0)+' '+arc(circle.end,0):arc(circle.end,1));
 }
 function text(svg,value,x,y,size,weight=400){
  const e=node('text',{x,y,fill:'#f3f3f3','font-family':'Arial, Microsoft YaHei, sans-serif','font-size':size,'font-weight':weight});e.textContent=value;svg.append(e);
 }
 async function mount(){
  await art.decode();if(part.querySelector('.trust-circle-stage'))return;
  const stage=document.createElement('div');stage.className='trust-circle-stage';stage.style.top=(4415/art.naturalHeight*100)+'%';stage.dataset.state='ready';stage.dataset.duration='4000';
  const svg=node('svg',{viewBox:`0 0 ${width} ${height}`,role:'img','aria-label':'信息多维度透明化、建立视觉可信度、增强交易安全提醒，共同提升用户信任感'});
  svg.append(node('rect',{width,height,fill:'#000'}),node('rect',{width,height,rx:110,fill:'#121212'}));
  const defs=node('defs');circles.forEach((circle,index)=>{const clip=node('clipPath',{id:`trust-overlap-${index}`});clip.append(node('circle',{cx:circle.x,cy:circle.y,r:circle.r}));defs.append(clip);});svg.append(defs);
  const overlap=node('g',{'clip-path':'url(#trust-overlap-0)'}),middle=node('g',{'clip-path':'url(#trust-overlap-1)'}),fill=node('rect',{width,height,fill:'#fbabce','clip-path':'url(#trust-overlap-2)'});middle.append(fill);overlap.append(middle);svg.append(overlap);
  svg.append(node('path',{d:'M750 507C752 525 762 529 789 531C762 533 752 537 750 555C748 537 738 533 711 531C738 529 748 525 750 507',fill:'#444'}),node('path',{d:'M1455 812C1458 844 1467 849 1480 852C1467 855 1458 860 1455 892C1452 860 1443 855 1430 852C1443 849 1452 844 1455 812',fill:'#aaa'}));
  const paths=circles.map(circle=>{const path=node('path',{class:'trust-circle-outline',d:pathFor(circle),fill:'none',stroke:'#949494','stroke-width':3,pathLength:1,'stroke-dasharray':'1 1','stroke-dashoffset':1});svg.append(path);return path;});
  text(svg,'信息多维度透明化',423,667,36,700);text(svg,'Information Transparency',423,715,26);
  text(svg,'建立视觉可信度',1169,398,36,700);text(svg,'Visual Credibility',1169,440,26);
  text(svg,'提升用户',1017,636,36,700);text(svg,'信任感',1017,690,36,700);
  text(svg,'增强交易安全提醒',1130,990,36,700);text(svg,'Safety Reminder',1130,1037,26);
  stage.append(svg);part.classList.add('has-trust-circles');part.append(stage);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){paths.forEach(path=>path.setAttribute('stroke-dashoffset',0));stage.dataset.state='complete';return;}
  let armed=true,run=0,animations=[];
  const cancel=()=>{run++;animations.forEach(animation=>animation.cancel());animations=[];};
  const play=()=>{
   cancel();const currentRun=run;paths.forEach(path=>path.setAttribute('stroke-dashoffset',1));
   stage.dataset.state='playing';stage.dataset.startedAt=String(performance.now());delete stage.dataset.finishedAt;
   stage.dataset.playCount=String(Number(stage.dataset.playCount||0)+1);
   animations=paths.map((path,index)=>path.animate([{strokeDashoffset:1,opacity:.35},{strokeDashoffset:0,opacity:1}],{duration:circles[index].duration,delay:circles[index].delay,easing:'cubic-bezier(.25,.1,.25,1)',fill:'both',iterations:1}));
   Promise.all(animations.map(animation=>animation.finished)).then(()=>{
    if(currentRun!==run)return;
    paths.forEach(path=>path.setAttribute('stroke-dashoffset',0));stage.dataset.state='complete';stage.dataset.finishedAt=String(performance.now());cancel();
   }).catch(()=>{/* Leaving the viewport resets this run; the next visit starts fresh. */});
  };
  const visibility=new IntersectionObserver(entries=>{
   for(const entry of entries){
    if(!entry.isIntersecting){armed=true;if(stage.dataset.state==='playing'){cancel();stage.dataset.state='ready';}}
    else if(armed&&entry.intersectionRatio>=.25){armed=false;play();}
   }
  },{threshold:[0,.25]});visibility.observe(stage);
 }
 const ready=new IntersectionObserver(entries=>{if(!entries.some(entry=>entry.isIntersecting))return;ready.disconnect();mount().catch(()=>{/* Keep the existing illustration if enhancement fails. */});},{rootMargin:'1200px'});ready.observe(part);
})();
