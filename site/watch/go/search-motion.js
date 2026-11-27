(() => {
 const part=document.getElementById('part-1'),art=part?.querySelector('img');if(!art)return;
 const ns='http://www.w3.org/2000/svg',value='ZOUQI GO',basePink='#f58bb8',pressedPink='#df6fa5';
 const node=(tag,attributes={})=>{const e=document.createElementNS(ns,tag);for(const [key,v] of Object.entries(attributes))e.setAttribute(key,v);return e;};
 async function mount(){
  await art.decode();if(part.querySelector('.case-search-motion'))return;
  const stage=document.createElement('div');stage.className='case-search-motion';stage.style.top=(2480/art.naturalHeight*100)+'%';stage.dataset.phase='ready';stage.dataset.period='8000';stage.setAttribute('role','img');stage.setAttribute('aria-label','ZOUQI GO 搜索栏：逐字输入后 Search 按钮按压回弹');
  const svg=node('svg',{viewBox:'0 0 1720 130','aria-hidden':'true'});
  svg.append(node('rect',{width:1720,height:130,fill:'#000'}),node('rect',{x:13,y:21,width:1430,height:80,rx:40,fill:'#fff'}));
  const text=node('text',{class:'case-search-typed',x:728,y:72,fill:'#444','font-family':'Arial, Helvetica, sans-serif','font-size':34});text.textContent=value;svg.append(text);
  const caret=node('line',{class:'case-search-caret',x1:728,x2:728,y1:44,y2:79,stroke:'#444','stroke-width':2});svg.append(caret);
  const button=node('g',{class:'case-search-key'}),key=node('rect',{x:1475,y:21,width:218,height:80,rx:40,fill:basePink}),label=node('text',{x:1584,y:72,fill:'#fff','text-anchor':'middle','font-family':'Arial, Helvetica, sans-serif','font-size':34});label.textContent='Search';button.append(key,label);svg.append(button);
  stage.append(svg);part.classList.add('has-search-motion');part.append(stage);
  const startX=728-text.getComputedTextLength()/2;text.setAttribute('x',startX);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');text.textContent=reduced.matches?value:'';
  let timers=new Set(),animations=[],generation=0,playing=false,inView=false;
  const later=(callback,delay)=>{const token=generation,id=setTimeout(()=>{timers.delete(id);if(token===generation)callback();},delay);timers.add(id);};
  const cursor=()=>{const x=startX+text.getComputedTextLength()+4;caret.setAttribute('x1',x);caret.setAttribute('x2',x);};
  const clear=()=>{generation++;for(const timer of timers)clearTimeout(timer);timers.clear();animations.forEach(animation=>animation.cancel());animations=[];stage.classList.remove('is-typing');};
  const cycle=()=>{
   clear();stage.dataset.cycle=String(Number(stage.dataset.cycle||0)+1);stage.dataset.cycleStartedAt=String(performance.now());stage.dataset.phase='typing';stage.classList.add('is-typing');text.textContent=value[0];cursor();
   for(let length=2;length<=value.length;length++)later(()=>{text.textContent=value.slice(0,length);cursor();},(length-1)*300);
   later(()=>{
    stage.classList.remove('is-typing');stage.dataset.phase='pressing';stage.dataset.pressStartedAt=String(performance.now());
    animations=[button.animate([
     {transform:'translateY(0px) scale(1)',filter:'drop-shadow(0px 3px 3px #6b244333)'},
     {offset:.12,transform:'translateY(3px) scale(.97,.94)',filter:'drop-shadow(0px 0px 0px #0000)'},
     {offset:.28,transform:'translateY(0px) scale(1)',filter:'drop-shadow(0px 3px 3px #6b244333)'},
     {transform:'translateY(0px) scale(1)',filter:'drop-shadow(0px 3px 3px #6b244333)'}
    ],{duration:1820,easing:'ease-in-out',fill:'forwards'}),key.animate([{fill:basePink},{offset:.12,fill:pressedPink},{offset:.28,fill:basePink},{fill:basePink}],{duration:1820,easing:'ease-in-out',fill:'forwards'})];
    later(()=>{stage.dataset.phase='hold';},1820);
   },2400);
   later(cycle,8000);
  };
  const update=()=>{
   if(inView&&!document.hidden&&!reduced.matches){if(!playing){playing=true;stage.dataset.visit=String(Number(stage.dataset.visit||0)+1);stage.dataset.cycle='0';cycle();}}
   else if(playing||reduced.matches){playing=false;clear();stage.dataset.phase='ready';text.textContent=reduced.matches?value:'';cursor();}
  };
  cursor();const view=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting&&entries[0].intersectionRatio>=.6;update();},{threshold:[0,.6]});view.observe(stage);document.addEventListener('visibilitychange',update);reduced.addEventListener('change',update);
 }
 const ready=new IntersectionObserver(entries=>{if(!entries.some(entry=>entry.isIntersecting))return;ready.disconnect();mount().catch(()=>{/* Keep the original search-bar artwork if enhancement fails. */});},{rootMargin:'1000px'});ready.observe(part);
})();
