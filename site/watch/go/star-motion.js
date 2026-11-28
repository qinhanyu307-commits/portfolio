(() => {
 const part=document.getElementById('part-10'),art=part?.querySelector('img');if(!art)return;
 const left=1180,top=130,width=180,height=230;
 async function mount(){
  await art.decode();if(part.querySelector('.case-star-motion'))return;
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');ctx.drawImage(art,left,top,width,height,0,0,width,height);
  const data=ctx.getImageData(0,0,width,height),clear=ctx.createImageData(width,height);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const i=(y*width+x)*4,inside=y<170||x<100;
   if(!inside){data.data[i+3]=0;continue;}
   // Leave the small metal sphere outside the star layer, completely unchanged.
   clear.data[i+3]=255;
   const alpha=Math.max(data.data[i],data.data[i+1],data.data[i+2])/255;
   if(alpha){for(let c=0;c<3;c++)data.data[i+c]=Math.min(255,data.data[i+c]/alpha);}
   data.data[i+3]=Math.round(alpha*255);
  }
  ctx.putImageData(clear,0,0);const erased=canvas.toDataURL('image/png');ctx.putImageData(data,0,0);const star=canvas.toDataURL('image/png');
  const stage=document.createElement('div');stage.className='case-star-motion';stage.style.top=top/art.naturalHeight*100+'%';stage.setAttribute('role','img');stage.setAttribute('aria-label','金属星星按参考视频节奏缩小、放大回弹并循环');
  const cover=document.createElement('img'),sprite=document.createElement('img');cover.src=erased;sprite.src=star;cover.alt=sprite.alt='';sprite.className='case-star-sprite';stage.append(cover,sprite);part.classList.add('has-star-motion');part.append(stage);
  // Reference loop: hold, contract, overshoot and settle. Approximately 17 frames at 30 fps.
  const animation=sprite.animate([
   {offset:0,transform:'scale(1)'},{offset:.35,transform:'scale(1)'},
   {offset:.47,transform:'scale(.852)'},{offset:.59,transform:'scale(.815)'},
   {offset:.71,transform:'scale(.889)'},{offset:.82,transform:'scale(1.074)'},
   {offset:.94,transform:'scale(1.148)'},{offset:1,transform:'scale(1)'}
  ].map(frame=>({...frame,easing:'ease-in-out'})),{duration:567,iterations:Infinity,easing:'linear',fill:'both'});animation.pause();
  let visible=false;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>{const running=visible&&!document.hidden&&!reduced.matches;stage.dataset.state=running?'playing':'idle';if(running){animation.currentTime=0;animation.play();}else{animation.pause();animation.currentTime=0;}};
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();},{threshold:.3}).observe(stage);document.addEventListener('visibilitychange',update);reduced.addEventListener('change',update);update();
 }
 const ready=new IntersectionObserver(entries=>{if(!entries.some(e=>e.isIntersecting))return;ready.disconnect();mount().catch(()=>{});},{rootMargin:'1200px'});ready.observe(part);
})();
