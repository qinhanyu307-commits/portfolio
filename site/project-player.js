(() => {
  const scriptUrl=new URL(document.currentScript.src),base=new URL('./',scriptUrl).pathname,revision=scriptUrl.searchParams.get('v');
  let overlay=null,frame=null,saved=null;
  function videoUrl(value){
    try{const url=new URL(value,location.href);return url.origin===location.origin&&url.pathname.startsWith(base+'watch/')?url:null;}catch{return null;}
  }
  function show(url,push=true,position=null){
    if(overlay)return;
    const main=document.querySelector('main');
    saved={x:position?.x??scrollX,y:position?.y??scrollY,main,inert:main?.inert,focus:document.activeElement,styles:[]};
    window.__lenis?.stop();
    const scrollbar=innerWidth-document.documentElement.clientWidth;
    for(const node of [document.documentElement,document.body])for(const property of ['overflow-x','overflow-y']){
      saved.styles.push({node,property,value:node.style.getPropertyValue(property),priority:node.style.getPropertyPriority(property)});
      node.style.setProperty(property,'hidden','important');
    }
    if(scrollbar>0){
      const node=document.body,property='padding-right';
      saved.styles.push({node,property,value:node.style.getPropertyValue(property),priority:node.style.getPropertyPriority(property)});
      node.style.setProperty(property,(parseFloat(getComputedStyle(node).paddingRight)+scrollbar)+'px','important');
    }
    if(main)main.inert=true;
    if(push){
      const current=new URL(location.href);current.hash=(url.pathname.startsWith(base+'watch/go/')?'document=':'video=')+url.pathname.split('/').filter(Boolean).at(-1);
      history.pushState({...history.state,portfolioVideo:url.href,portfolioVideoPosition:{x:saved.x,y:saved.y}},'',current);
    }
    overlay=document.createElement('div');overlay.id='project-video-overlay';
    overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','作品预览');
    overlay.style.cssText='position:fixed;inset:0;width:100%;height:100dvh;z-index:2147483647;background:#fff';
    frame=document.createElement('iframe');frame.title='作品预览';
    const embedded=new URL(url);embedded.searchParams.set('embedded','1');if(revision)embedded.searchParams.set('v',revision);frame.src=embedded.href;
    frame.allow='autoplay; fullscreen; picture-in-picture';frame.allowFullscreen=true;
    // The portfolio root is inverted; compensate the independently rendered player.
    frame.style.cssText='display:block;width:100%;height:100%;border:0;filter:invert(1)';
    overlay.append(frame);document.body.append(overlay);frame.focus();
  }
  function hide(){
    if(!overlay)return;
    const previous=saved;overlay.remove();overlay=frame=saved=null;
    for(const {node,property,value,priority} of previous.styles){if(value)node.style.setProperty(property,value,priority);else node.style.removeProperty(property);}
    if(previous.main)previous.main.inert=previous.inert;
    window.__lenis?.start();
    requestAnimationFrame(()=>{
      if(window.__lenis)window.__lenis.scrollTo(previous.y,{immediate:true,force:true});
      else window.scrollTo({left:previous.x,top:previous.y,behavior:'instant'});
      previous.focus?.focus?.({preventScroll:true});
    });
  }
  function back(){if(!overlay)return;if(history.state?.portfolioVideo)history.back();else hide();}
  window.__PORTFOLIO_OPEN_VIDEO__=value=>{const url=videoUrl(value);if(!url)return false;show(url);return true;};
  window.addEventListener('popstate',event=>{const url=videoUrl(event.state?.portfolioVideo);if(url)show(url,false,event.state?.portfolioVideoPosition);else hide();});
  window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===frame?.contentWindow&&event.data?.type==='portfolio-close-video')back();});
  window.addEventListener('keydown',event=>{if(event.key==='Escape'&&overlay){event.preventDefault();back();}});
})();
