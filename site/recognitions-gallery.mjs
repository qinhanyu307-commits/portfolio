export const isGalleryVideo=src=>/\.(mp4|webm)$/i.test(src);
// Shared markup for the initial HTML and the interactive React component.
export function galleryView(h,data,selected=0,slide=0,select=()=>{},change=()=>{},motion={}){
 const entries=data.entries,item=entries[selected],images=item?.images||[],index=Math.min(slide,Math.max(0,images.length-1));
 return h('section',{id:'recognitions',className:'recognition-gallery',ref:motion.ref,'aria-label':data.title},
  h('h2',{className:'recognition-heading'},data.title),
  h('div',{className:'recognition-grid'},
   h('div',{className:'recognition-preview'},
    h('div',{className:'recognition-frame',tabIndex:0,role:'region','aria-label':'作品预览','data-dragging':!!motion.dragging,'data-can-slide':images.length>1,onPointerDown:motion.down,onPointerMove:motion.move,onPointerUp:motion.up,onPointerCancel:motion.cancel,onLostPointerCapture:event=>{if(event.target===event.currentTarget)motion.cancel?.();},onKeyDown:e=>{if(!e.target.closest('video')&&images.length>1&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();change((index+(e.key==='ArrowRight'?1:-1)+images.length)%images.length);}}},
     images.length?h('div',{className:'recognition-track',key:item.id,style:{transform:'translate3d('+(-100*(motion.position??index))+'%,0,0)'}},...images.map((src,i)=>h('div',{className:'recognition-slide',key:src+'-'+i,'aria-hidden':i!==index},isGalleryVideo(src)?h('video',{className:'recognition-video',src,controls:i===index,muted:true,loop:true,playsInline:true,preload:i===index?'metadata':'none','aria-label':(item.award||'作品')+' · 视频 '+(i+1),'data-current':i===index}):h('img',{className:'recognition-image',src,alt:i===index?(item.award||'作品')+' · '+(i+1):'',draggable:false,'data-current':i===index,loading:i===index?'eager':'lazy',decoding:'async'})))):h('p',{className:'recognition-empty'},item?'此目录暂无作品':'暂无作品'),
     images.length>0?h('div',{className:'recognition-controls'},
      h('button',{type:'button',disabled:images.length<2,'aria-label':'上一张图片',onClick:()=>change((index-1+images.length)%images.length)},h('span',{className:'recognition-chevron recognition-chevron-left','aria-hidden':true})),
      h('button',{type:'button',disabled:images.length<2,'aria-label':'下一张图片',onClick:()=>change((index+1)%images.length)},h('span',{className:'recognition-chevron recognition-chevron-right','aria-hidden':true}))):null),
    images.length>0?h('div',{className:'recognition-thumbs',key:item.id,'data-dragging':!!motion.dragging,'aria-label':'选择预览图片'},...images.map((src,i)=>h('button',{key:src+'-'+i,type:'button','aria-label':'查看第 '+(i+1)+' 张图片','aria-pressed':i===index,style:{'--gallery-weight':Math.max(0,1-Math.abs(i-(motion.position??index)))},onClick:()=>change(i)},isGalleryVideo(src)?h('video',{src:src+'#t=0.01',muted:true,playsInline:true,preload:'metadata','aria-hidden':true}):h('img',{src,alt:'',loading:'lazy'}),isGalleryVideo(src)?h('span',{className:'recognition-video-badge','aria-hidden':true}):null))):null),
   h('div',{className:'recognition-directory','aria-label':'作品目录'},
    ...entries.map((row,i)=>h('button',{key:row.id,type:'button',className:'recognition-row','aria-pressed':i===selected,onClick:()=>select(i)},
     h('span',{className:'recognition-award'},row.award),h('span',{className:'recognition-project'},row.project),h('span',{className:'recognition-date'},row.date))),
    entries.length?null:h('p',{className:'recognition-empty'},'暂无目录'))));
}

// Keep the main slide, selected thumbnail and strip position in one state.
export function galleryPlayer(React,jsx,data){
 const [selected,setSelected]=React.useState(0),[slide,setSlide]=React.useState(0),[motion,setMotion]=React.useState({dragging:false,position:0});
 const ref=React.useRef(null),gesture=React.useRef(null),images=data.entries[selected]?.images||[];
 const position=motion.dragging?motion.position:slide;
 const change=value=>{setSlide(value);setMotion({dragging:false,position:value});};
 const cancel=()=>{gesture.current=null;setMotion({dragging:false,position:slide});};
 const down=event=>{
  if(images.length<2||event.button!==0||event.target.closest('button,video'))return;
  gesture.current={id:event.pointerId,x:event.clientX,y:event.clientY,width:event.currentTarget.clientWidth,start:slide,axis:null};
 };
 const move=event=>{
  const g=gesture.current;if(!g||g.id!==event.pointerId)return;
  const dx=event.clientX-g.x,dy=event.clientY-g.y;if(!g.axis){if(Math.max(Math.abs(dx),Math.abs(dy))<6)return;if(Math.abs(dy)>Math.abs(dx)){gesture.current=null;return;}g.axis='x';event.currentTarget.setPointerCapture(event.pointerId);}
  event.preventDefault();setMotion({dragging:true,position:Math.max(0,Math.min(images.length-1,g.start-dx/g.width))});
 };
 const up=event=>{
  const g=gesture.current;if(!g||g.id!==event.pointerId)return;gesture.current=null;
  if(g.axis==='x'){const delta=(g.x-event.clientX)/g.width;change(Math.max(0,Math.min(images.length-1,g.start+(Math.abs(delta)>.12?Math.sign(delta):0))));}
 };
 // Only the selected, visible clip plays. Switching media resets the old clip.
 React.useEffect(()=>{
  const frame=ref.current?.querySelector('.recognition-frame');if(!frame)return;
  const videos=[...frame.querySelectorAll('video')],active=videos.find(video=>video.dataset.current==='true');
  for(const video of videos){video.pause();try{video.currentTime=0;}catch{}}
  if(!active)return;
  let visible=false,disposed=false;
  const play=()=>{if(visible&&!document.hidden&&!disposed){active.muted=true;active.play().catch(()=>{});}else active.pause();};
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;play();},{threshold:.1});
  observer.observe(frame);document.addEventListener('visibilitychange',play);
  return()=>{disposed=true;observer.disconnect();document.removeEventListener('visibilitychange',play);active.pause();try{active.currentTime=0;}catch{}};
 },[selected,slide]);
 React.useLayoutEffect(()=>{
  const strip=ref.current?.querySelector('.recognition-thumbs');if(!strip)return;
  let frame,start;const tick=time=>{
   start??=time;const buttons=[...strip.children],low=Math.floor(position),high=Math.ceil(position),a=buttons[low],b=buttons[high];
   if(a&&b){const centerA=a.offsetLeft+a.offsetWidth/2,centerB=b.offsetLeft+b.offsetWidth/2;strip.scrollLeft=centerA+(centerB-centerA)*(position-low)-strip.clientWidth/2;}
   if(time-start<500)frame=requestAnimationFrame(tick);
  };frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[selected,slide,position,motion.dragging]);
 const h=(tag,props,...children)=>jsx(tag,{...props,...(children.length?{children:children.length===1?children[0]:children}:{})});
 return galleryView(h,data,selected,slide,value=>{gesture.current=null;setSelected(value);setSlide(0);setMotion({dragging:false,position:0});},change,{ref,position,dragging:motion.dragging,down,move,up,cancel});
}
