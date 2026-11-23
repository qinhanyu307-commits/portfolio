export const isGalleryVideo=src=>/\.(mp4|webm)$/i.test(src);
// Catalog entries roll vertically; images within one entry flip horizontally.
export function galleryView(h,data,selected=0,slide=0,select=()=>{},change=()=>{},motion={}){
 const entries=data.entries,count=entries[selected]?.images.length||0;
 return h('section',{id:'recognitions',className:'recognition-gallery',ref:motion.ref,'aria-label':data.title},
  h('h2',{className:'recognition-heading'},data.title),
  h('div',{className:'recognition-grid'},
   h('div',{className:'recognition-directory',role:'listbox',tabIndex:0,'aria-label':'作品目录，使用滚轮或上下方向键切换','aria-activedescendant':entries.length?'recognition-option-'+selected:undefined,onKeyDown:motion.key},
    ...entries.map((row,i)=>h('div',{key:row.id,id:'recognition-option-'+i,className:'recognition-row',role:'option','aria-selected':i===selected,'data-active':i===selected},
     h('span',{className:'recognition-award','data-directory-wheel':true},row.award),
     h('div',{className:'recognition-details'},h('span',{className:'recognition-project','data-directory-wheel':true},row.project),h('span',{className:'recognition-date','data-directory-wheel':true},row.date)))),
    entries.length?null:h('p',{className:'recognition-empty'},'暂无目录')),
   h('div',{className:'recognition-preview'},
    h('div',{className:'recognition-frame',role:'region',tabIndex:0,'aria-label':'作品预览，点击左右箭头翻页',onKeyDown:motion.key},
     entries.length?h('div',{className:'recognition-track',style:{transform:'translate3d(0,'+(-100*selected)+'%,0)'}},...entries.map((entry,entryIndex)=>h('div',{className:'recognition-project-slide',key:entry.id,'aria-hidden':entryIndex!==selected},
      h('div',{className:'recognition-media-track',style:{transform:'translate3d('+(-100*(entryIndex===selected?slide:(motion.slides?.[entryIndex]||0)))+'%,0,0)'}},...(entry.images.length?entry.images:[null]).map((src,slideIndex)=>{
       const active=entryIndex===selected&&slideIndex===slide;
       return h('div',{className:'recognition-slide',key:src||'empty','aria-hidden':!active},src?(isGalleryVideo(src)?h('video',{className:'recognition-video',src,controls:active,muted:true,loop:true,playsInline:true,preload:active?'metadata':'none','aria-label':(entry.award||'作品')+' · 视频 '+(slideIndex+1),'data-current':active}):h('img',{className:'recognition-image',src,alt:(entry.award||'作品')+' · '+(slideIndex+1),draggable:false,'data-current':active,loading:Math.abs(entryIndex-selected)<=1?'eager':'lazy',decoding:'async'})):h('p',{className:'recognition-empty'},'此目录暂无作品'));
      }))))):h('p',{className:'recognition-empty'},'暂无作品'),
     count>0?h('div',{className:'recognition-controls'},
      h('button',{type:'button',disabled:count<2,'aria-label':'上一张图片',onClick:()=>change((slide-1+count)%count)},h('span',{className:'recognition-chevron recognition-chevron-left','aria-hidden':true})),
      h('button',{type:'button',disabled:count<2,'aria-label':'下一张图片',onClick:()=>change((slide+1)%count)},h('span',{className:'recognition-chevron recognition-chevron-right','aria-hidden':true}))):null),
    h('p',{className:'recognition-status','aria-live':'polite','aria-atomic':true},entries[selected]?[entries[selected].award,entries[selected].project,entries[selected].date].filter(Boolean).join(' · '):''))));
}

export function galleryPlayer(React,jsx,data){
 const [selection,setSelection]=React.useState({entry:0,slide:0});
 const {entry:selected,slide}=selection;
 const ref=React.useRef(null),current=React.useRef(selection);
 current.current=selection;
 const savedSlides=React.useRef({});savedSlides.current[selected]=slide;
 React.useEffect(()=>{
  const section=ref.current;if(!section)return;
  let total=0,lastWheel=0,lockedUntil=0,touch=null,wheelGesture=null;
  const next=direction=>{
   const entry=current.current.entry+direction;
   return entry>=0&&entry<data.entries.length?{entry,slide:0}:null;
  };
  // object-fit:contain leaves blank space inside the media element's box.
  // Block the wheel only over the painted image/video, not those margins.
  const overArtwork=event=>{
   if(event.target.closest('.recognition-controls button'))return true;
   const media=event.target.closest('.recognition-image,.recognition-video');
   if(!media)return false;
   const box=media.getBoundingClientRect(),width=media.naturalWidth||media.videoWidth,height=media.naturalHeight||media.videoHeight;
   if(!width||!height)return true;
   const scale=Math.min(box.width/width,box.height/height),w=width*scale,h=height*scale;
   const left=box.left+(box.width-w)/2,top=box.top+(box.height-h)/2;
   return event.clientX>=left&&event.clientX<=left+w&&event.clientY>=top&&event.clientY<=top+h;
  };
  // Each entry has an invisible rectangle around its title, metadata and gaps.
  // Size short entries consistently while keeping the middle column empty.
  const overDirectoryBox=point=>{
   const directory=section.querySelector('.recognition-directory'),column=directory.getBoundingClientRect();
   const range=document.createRange();
   for(const row of directory.querySelectorAll('.recognition-row')){
    const box=row.getBoundingClientRect();let textRight=box.left,textTop=box.top,textBottom=box.bottom;
    for(const text of row.querySelectorAll('[data-directory-wheel]')){
     const walker=document.createTreeWalker(text,NodeFilter.SHOW_TEXT);
     for(let node=walker.nextNode();node;node=walker.nextNode()){
      if(!node.textContent.trim())continue;
      range.selectNodeContents(node);
      for(const line of range.getClientRects()){textRight=Math.max(textRight,line.right);textTop=Math.min(textTop,line.top);textBottom=Math.max(textBottom,line.bottom);}
     }
    }
    const left=Math.max(column.left,box.left-4);
    const width=Math.min(column.right-left,Math.max(220,innerWidth*.225,textRight-left+20));
    if(point.clientX>=left&&point.clientX<=left+width&&point.clientY>=textTop-8&&point.clientY<=textBottom+8)return true;
   }
   return false;
  };
  const commit=value=>{current.current=value;setSelection(value);};
  const wheel=event=>{
   if(event.ctrlKey)return;
   if(overArtwork(event)){wheelGesture=null;event.preventDefault();event.stopPropagation();return;}
   // Mobile layouts omit Lenis and contain native body scroll chaining.
   const scrollPage=()=>{if(!window.__lenis&&Math.abs(event.deltaY)>=Math.abs(event.deltaX)){event.preventDefault();event.stopPropagation();window.scrollBy({top:event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1),behavior:'instant'});}};
   const now=performance.now();
   const continuing=wheelGesture&&now-wheelGesture.time<180&&Math.hypot(event.clientX-wheelGesture.x,event.clientY-wheelGesture.y)<16;
   const overBox=overDirectoryBox(event);
   if(!overBox&&!continuing){wheelGesture=null;total=0;scrollPage();return;}
   // Consume the wheel throughout an entry box, including its blank spaces.
   event.preventDefault();event.stopPropagation();
   if(!continuing){total=0;lockedUntil=0;window.__lenis?.scrollTo(window.scrollY,{immediate:true,force:true});}
   if(overBox)wheelGesture={x:event.clientX,y:event.clientY,time:now};else wheelGesture.time=now;
   const direction=Math.sign(event.deltaY);if(!direction)return;
   const value=next(direction);if(!value){total=0;return;}
   if(now<lockedUntil){lastWheel=now;return;}
   if(now-lastWheel>180||Math.sign(total)!==direction)total=0;
   lastWheel=now;total+=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
   if(Math.abs(total)<8)return;
   total=0;lockedUntil=now+360;commit(value);
  };
  const start=event=>{if(event.touches.length===1&&overDirectoryBox(event.touches[0]))touch={x:event.touches[0].clientX,y:event.touches[0].clientY,delta:0};};
  const move=event=>{if(!touch||event.touches.length!==1)return;const dx=event.touches[0].clientX-touch.x,dy=touch.y-event.touches[0].clientY;if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>12&&next(Math.sign(dy))){touch.delta=dy;event.preventDefault();}};
  const end=()=>{if(touch&&Math.abs(touch.delta)>40){const value=next(Math.sign(touch.delta));if(value)commit(value);}touch=null;};
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
 const change=value=>{const count=data.entries[selected]?.images.length||0;if(!count)return;const next={entry:selected,slide:Math.max(0,Math.min(count-1,value))};current.current=next;setSelection(next);};
 const key=event=>{
  if(!event.target.closest('.recognition-directory,video')&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();const count=data.entries[selected]?.images.length||0;if(count>1)change((slide+(event.key==='ArrowRight'?1:-1)+count)%count);return;}
  if(!event.target.closest('.recognition-directory')||!['ArrowUp','ArrowDown','PageUp','PageDown'].includes(event.key))return;
  const direction=['ArrowDown','PageDown'].includes(event.key)?1:-1,entry=selected+direction;
  if(entry<0||entry>=data.entries.length)return;
  event.preventDefault();const value={entry,slide:0};current.current=value;setSelection(value);
 };
 const h=(tag,props,...children)=>jsx(tag,{...props,...(children.length?{children:children.length===1?children[0]:children}:{})});
 return galleryView(h,data,selected,slide,undefined,change,{ref,key,slides:savedSlides.current});
}
