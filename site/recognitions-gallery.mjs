export const isGalleryVideo=src=>/\.(mp4|webm)$/i.test(src);
// Shared markup for server rendering and the hydrated wheel gallery.
export function galleryView(h,data,selected=0,slide=0,select=()=>{},change=()=>{},motion={}){
 const entries=data.entries;
 const media=entries.flatMap((entry,entryIndex)=>(entry.images.length?entry.images:[null]).map((src,slideIndex)=>({entry,entryIndex,slideIndex,src})));
 const position=media.findIndex(item=>item.entryIndex===selected&&item.slideIndex===slide);
 return h('section',{id:'recognitions',className:'recognition-gallery',ref:motion.ref,'aria-label':data.title},
  h('h2',{className:'recognition-heading'},data.title),
  h('div',{className:'recognition-grid','data-lenis-prevent':true},
   h('div',{className:'recognition-directory',role:'listbox',tabIndex:0,'aria-label':'作品目录，使用滚轮或上下方向键切换','aria-activedescendant':entries.length?'recognition-option-'+selected:undefined,onKeyDown:motion.key},
    ...entries.map((row,i)=>h('div',{key:row.id,id:'recognition-option-'+i,className:'recognition-row',role:'option','aria-selected':i===selected,'data-active':i===selected},
     h('span',{className:'recognition-award'},row.award),
     h('div',{className:'recognition-details'},h('span',{className:'recognition-project'},row.project),h('span',{className:'recognition-date'},row.date)))),
    entries.length?null:h('p',{className:'recognition-empty'},'暂无目录')),
   h('div',{className:'recognition-preview'},
    h('div',{className:'recognition-frame',role:'region',tabIndex:0,'aria-label':'作品预览，使用滚轮或上下方向键翻页',onKeyDown:motion.key},
     media.length?h('div',{className:'recognition-track',style:{transform:'translate3d(0,'+(-100*Math.max(0,position))+'%,0)'}},...media.map(({entry,entryIndex,slideIndex,src},i)=>h('div',{className:'recognition-slide',key:entry.id+'-'+slideIndex,'aria-hidden':i!==position},
      src?(isGalleryVideo(src)?h('video',{className:'recognition-video',src,controls:i===position,muted:true,loop:true,playsInline:true,preload:i===position?'metadata':'none','aria-label':(entry.award||'作品')+' · 视频 '+(slideIndex+1),'data-current':i===position}):h('img',{className:'recognition-image',src,alt:(entry.award||'作品')+' · '+(slideIndex+1),draggable:false,'data-current':i===position,loading:Math.abs(entryIndex-selected)<=1?'eager':'lazy',decoding:'async'})):h('p',{className:'recognition-empty'},'此目录暂无作品')))):h('p',{className:'recognition-empty'},'暂无作品')),
    h('p',{className:'recognition-status','aria-live':'polite','aria-atomic':true},entries[selected]?[entries[selected].award,entries[selected].project,entries[selected].date].filter(Boolean).join(' · '):''))));
}

export function galleryPlayer(React,jsx,data){
 const [selection,setSelection]=React.useState({entry:0,slide:0});
 const {entry:selected,slide}=selection;
 const ref=React.useRef(null),current=React.useRef(selection);
 current.current=selection;
 React.useEffect(()=>{
  const section=ref.current;if(!section)return;
  let total=0,lastWheel=0,lockedUntil=0,touch=null;
  const next=(direction,catalog=false)=>{
   const state=current.current,entries=data.entries;
   if(!entries.length)return null;
   if(!catalog){const count=entries[state.entry]?.images.length||1;
    if(direction>0&&state.slide<count-1)return {entry:state.entry,slide:state.slide+1};
    if(direction<0&&state.slide>0)return {entry:state.entry,slide:state.slide-1};
   }
   const entry=state.entry+direction;
   if(entry<0||entry>=entries.length)return null;
   return {entry,slide:!catalog&&direction<0?Math.max(0,entries[entry].images.length-1):0};
  };
  const commit=value=>{current.current=value;setSelection(value);};
  const wheel=event=>{
   if(event.ctrlKey||!event.target.closest('.recognition-grid')||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
   const bounds=section.getBoundingClientRect();if(bounds.top>innerHeight*.45||bounds.bottom<innerHeight*.55)return;
   const now=performance.now(),direction=Math.sign(event.deltaY);if(!direction)return;
   const catalog=!!event.target.closest('.recognition-directory'),value=next(direction,catalog);
   // At either end let the page continue scrolling naturally.
   if(!value){total=0;if(now<lockedUntil){event.preventDefault();event.stopPropagation();}return;}
   event.preventDefault();event.stopPropagation();
   if(now<lockedUntil){lastWheel=now;return;}
   if(now-lastWheel>160||Math.sign(total)!==direction)total=0;
   lastWheel=now;total+=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
   if(Math.abs(total)<40)return;
   total=0;lockedUntil=now+620;commit(value);
  };
  const start=event=>{if(event.touches.length===1&&!event.target.closest('video'))touch={x:event.touches[0].clientX,y:event.touches[0].clientY,catalog:!!event.target.closest('.recognition-directory'),delta:0};};
  const move=event=>{if(!touch||event.touches.length!==1)return;const dx=event.touches[0].clientX-touch.x,dy=touch.y-event.touches[0].clientY;if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>12&&next(Math.sign(dy),touch.catalog)){touch.delta=dy;event.preventDefault();}};
  const end=()=>{if(touch&&Math.abs(touch.delta)>40){const value=next(Math.sign(touch.delta),touch.catalog);if(value)commit(value);}touch=null;};
  section.addEventListener('wheel',wheel,{passive:false});
  const grid=section.querySelector('.recognition-grid');
  const cancel=()=>{touch=null;};
  grid.addEventListener('touchstart',start,{passive:true});grid.addEventListener('touchmove',move,{passive:false});grid.addEventListener('touchend',end);grid.addEventListener('touchcancel',cancel);
  return()=>{section.removeEventListener('wheel',wheel);grid.removeEventListener('touchstart',start);grid.removeEventListener('touchmove',move);grid.removeEventListener('touchend',end);grid.removeEventListener('touchcancel',cancel);};
 },[data]);
 // Only the selected visible video plays; changing entries pauses older clips.
 React.useEffect(()=>{
  const frame=ref.current?.querySelector('.recognition-frame');if(!frame)return;
  const videos=[...frame.querySelectorAll('video')],active=videos.find(video=>video.dataset.current==='true');
  for(const video of videos){video.pause();try{video.currentTime=0;}catch{}}
  if(!active)return;
  let visible=false,disposed=false;
  const play=()=>{if(visible&&!document.hidden&&!disposed){active.muted=true;active.play().catch(()=>{});}else active.pause();};
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;play();},{threshold:.1});observer.observe(frame);document.addEventListener('visibilitychange',play);
  return()=>{disposed=true;observer.disconnect();document.removeEventListener('visibilitychange',play);active.pause();};
 },[selected,slide]);
 const key=event=>{
  if(event.target.closest('video')||!['ArrowUp','ArrowDown','PageUp','PageDown'].includes(event.key))return;
  const direction=['ArrowDown','PageDown'].includes(event.key)?1:-1,catalog=!!event.target.closest('.recognition-directory');
  let entry=selected,media=slide;
  if(!catalog&&direction>0&&slide<(data.entries[selected]?.images.length||1)-1)media++;
  else if(!catalog&&direction<0&&slide>0)media--;
  else {entry+=direction;if(entry<0||entry>=data.entries.length)return;media=!catalog&&direction<0?Math.max(0,data.entries[entry].images.length-1):0;}
  event.preventDefault();const value={entry,slide:media};current.current=value;setSelection(value);
 };
 const h=(tag,props,...children)=>jsx(tag,{...props,...(children.length?{children:children.length===1?children[0]:children}:{})});
 return galleryView(h,data,selected,slide,undefined,undefined,{ref,key});
}
