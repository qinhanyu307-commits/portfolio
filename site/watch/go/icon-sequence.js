(() => {
 const part=document.getElementById('part-9'),art=part?.querySelector('img');if(!art)return;
 const icons=[
  {name:'首页',grey:[759,2571,80,77],selected:[201,3050,159,150],bg:[236,241,244]},
  {name:'展演',grey:[894,2579,86,74],selected:[645,3050,171,145],bg:[236,241,244]},
  {name:'圈子',grey:[1034,2579,95,72],selected:[199,2517,213,164],bg:[255,255,255]},
  {name:'票夹',grey:[1177,2579,81,75],selected:[1075,3050,161,147],bg:[236,241,244]},
  {name:'我的',grey:[1306,2575,80,80],selected:[1560,3045,159,156],bg:[236,241,244]}
 ];
 function crop(rect,transparent=false,bg){
  const [x,y,w,h]=rect,c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.drawImage(art,x,y,w,h,0,0,w,h);
  if(transparent){const data=ctx.getImageData(0,0,w,h);for(let i=0;i<data.data.length;i+=4){const p=data.data,alpha=Math.min(1,Math.max(0,(p[i]-p[i+1]-3)/22));if(!alpha){p[i+3]=0;continue;}for(let ch=0;ch<3;ch++)p[i+ch]=Math.max(0,Math.min(255,(p[i+ch]-bg[ch]*(1-alpha))/alpha));p[i+3]=Math.round(alpha*255);}ctx.putImageData(data,0,0);}
  return c.toDataURL('image/png');
 }
 async function mount(){
  await art.decode();if(part.querySelector('.icon-sequence'))return;
  const stage=document.createElement('div');stage.className='icon-sequence';stage.style.top=(2560/art.naturalHeight*100)+'%';stage.setAttribute('role','img');stage.setAttribute('aria-label','首页、展演、圈子、票夹、我的图标依次亮起为粉色选中态，再恢复灰色');
  const animations=[];
  icons.forEach((icon,index)=>{
   const [x,y,w,h]=icon.grey,item=document.createElement('span');item.className='icon-sequence-item';item.dataset.icon=icon.name;Object.assign(item.style,{left:(x-750)/650*100+'%',top:(y-2560)/110*100+'%',width:w/650*100+'%',height:h/110*100+'%'});
   const grey=document.createElement('img'),pink=document.createElement('img');grey.src=crop(icon.grey);pink.src=crop(icon.selected,true,icon.bg);grey.alt=pink.alt='';grey.className='icon-sequence-grey';pink.className='icon-sequence-pink';item.append(grey,pink);stage.append(item);
   const offsets=[0,.025,.15,.19,1],options={duration:8000,delay:index*1600,iterations:Infinity,easing:'linear',fill:'both'};
   animations.push(grey.animate(offsets.map((offset,i)=>({offset,opacity:[1,0,0,1,1][i]})),options));
   animations.push(pink.animate(offsets.map((offset,i)=>({offset,opacity:[0,1,1,0,0][i],transform:['scale(.94)','scale(1.06)','scale(1)','scale(.98)','scale(.94)'][i]})),options));
  });
  animations.forEach(a=>a.pause());part.classList.add('has-icon-sequence');part.append(stage);
  let visible=false;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>{const run=visible&&!document.hidden&&!reduced.matches;stage.dataset.state=run?'playing':'idle';const start=document.timeline.currentTime;for(const a of animations){if(run){a.play();a.startTime=start;}else{a.pause();a.currentTime=0;}}};
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();},{threshold:.4}).observe(stage);document.addEventListener('visibilitychange',update);reduced.addEventListener('change',update);update();
 }
 const observer=new IntersectionObserver(entries=>{if(!entries.some(e=>e.isIntersecting))return;observer.disconnect();mount().catch(()=>{});},{rootMargin:'1200px'});observer.observe(part);
})();
