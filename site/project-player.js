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
      const current=new URL(location.href);current.hash=(url.pathname.startsWith(base+'watch/lookie/')?'video=':'document=')+url.pathname.split('/').filter(Boolean).at(-1);
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

// Go opens as a web case study behind the full-width pink color wipe.
(() => {
 const previousOpen=window.__PORTFOLIO_OPEN_VIDEO__;
 const script=new URL(document.currentScript.src),base=new URL('./',script).pathname,revision=script.searchParams.get('v');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let shell=null,study=null,saved=null,phase='idle',closePending=false;
 const tick=()=>new Promise(resolve=>requestAnimationFrame(resolve));
 function parse(value){try{const url=new URL(value,location.href);return url.origin===location.origin&&url.pathname===base+'watch/go/'?url:null;}catch{return null;}}
 function record(node,property,value){saved.styles.push({node,property,value:node.style.getPropertyValue(property),priority:node.style.getPropertyPriority(property)});node.style.setProperty(property,value,'important');}
 function panels(){
  const wipe=document.createElement('div');wipe.className='go-case-wipe';wipe.setAttribute('aria-hidden','true');
  wipe.style.cssText='position:absolute;inset:0;z-index:2;overflow:hidden;pointer-events:none';
  const panel=document.createElement('div');panel.className='go-case-wipe-panel';panel.style.cssText='position:absolute;inset:0;background:#ff3b8d;transform:translateY(100%)';wipe.append(panel);
  return wipe;
 }
 async function wipe(cover){
  const nodes=[...shell.querySelectorAll('.go-case-wipe-panel')];
  if(reduced.matches){nodes.forEach(node=>{node.style.transform=cover?'translateY(0)':'translateY(-100%)';});return;}
  await Promise.all(nodes.map(node=>{
   node.getAnimations().forEach(animation=>animation.cancel());
   return node.animate([{transform:cover?'translateY(100%)':'translateY(0)'},{transform:cover?'translateY(0)':'translateY(-100%)'}],{duration:cover?440:460,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'}).finished;
  }));
 }
 async function show(url,push=true,position=null){
  if(shell||document.getElementById('project-video-overlay'))return;
  const main=document.querySelector('main');
  saved={x:position?.x??scrollX,y:position?.y??scrollY,main,inert:main?.inert,focus:document.activeElement,styles:[]};
  const scrollbar=innerWidth-document.documentElement.clientWidth;
  window.__lenis?.stop();
  for(const node of [document.documentElement,document.body])for(const property of ['overflow-x','overflow-y'])record(node,property,'hidden');
  if(scrollbar>0)record(document.body,'padding-right',(parseFloat(getComputedStyle(document.body).paddingRight)+scrollbar)+'px');
  if(main)main.inert=true;
  if(push){const current=new URL(location.href);current.hash='case-study=go';const state={...history.state,portfolioGoCase:url.href,portfolioGoPosition:{x:saved.x,y:saved.y}};delete state.portfolioVideo;delete state.portfolioVideoPosition;history.pushState(state,'',current);}
  shell=document.createElement('div');shell.id='project-video-overlay';shell.dataset.kind='go-case';shell.setAttribute('role','dialog');shell.setAttribute('aria-modal','true');shell.setAttribute('aria-label','走起GO 项目案例');
  // Cancel the site's root inversion for both the pink wipe and the web page.
  shell.style.cssText='position:fixed;inset:0;width:100%;height:100dvh;z-index:2147483647;background:transparent;filter:invert(1);overflow:hidden';
  study=document.createElement('iframe');study.title='走起GO · UI/UX 项目案例';study.style.cssText='display:block;width:100%;height:100%;border:0;opacity:0';
  const loaded=new Promise(resolve=>study.addEventListener('load',resolve,{once:true}));
  const embedded=new URL(url);embedded.searchParams.set('embedded','1');if(revision)embedded.searchParams.set('v',revision);study.src=embedded.href;
  shell.append(study,panels());document.body.append(shell);phase='opening';shell.dataset.phase=phase;closePending=false;
  await Promise.all([wipe(true),Promise.race([loaded,new Promise(resolve=>setTimeout(resolve,4500))])]);
  shell.style.background='#000';study.style.opacity='1';study.contentWindow?.postMessage({type:'portfolio-go-case-enter'},location.origin);
  await wipe(false);phase='open';shell.dataset.phase=phase;study.focus();if(closePending)hide();
 }
 async function hide(){
  if(!shell||phase==='closing')return;
  if(phase==='opening'){closePending=true;return;}
  phase='closing';shell.dataset.phase=phase;await wipe(true);
  const previous=saved;
  study.style.opacity='0';shell.style.background='transparent';
  for(const {node,property,value,priority} of previous.styles){if(value)node.style.setProperty(property,value,priority);else node.style.removeProperty(property);}
  if(previous.main)previous.main.inert=previous.inert;
  window.__lenis?.start();
  const restore=()=>{if(window.__lenis)window.__lenis.scrollTo(previous.y,{immediate:true,force:true});else window.scrollTo({left:previous.x,top:previous.y,behavior:'instant'});};
  restore();await tick();restore();await wipe(false);
  shell.remove();shell=study=saved=null;phase='idle';closePending=false;previous.focus?.focus?.({preventScroll:true});
 }
 function back(){if(!shell)return;if(history.state?.portfolioGoCase)history.back();else hide();}
 window.__PORTFOLIO_OPEN_VIDEO__=value=>{const url=parse(value);if(!url)return previousOpen?.(value)||false;show(url);return true;};
 addEventListener('popstate',event=>{const url=parse(event.state?.portfolioGoCase);if(url)show(url,false,event.state?.portfolioGoPosition);else hide();});
 addEventListener('message',event=>{if(event.origin===location.origin&&event.source===study?.contentWindow&&event.data?.type==='portfolio-close-video')back();});
 addEventListener('keydown',event=>{if(event.key==='Escape'&&shell){event.preventDefault();back();}});
 // A directly opened case page's back link still lands on Work, never Home.
 if(location.hash==='#work'){
  let restored=false;
  const restore=()=>{if(restored||!window.__portfolioHeroStarted)return;restored=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{const work=document.getElementById('work');if(work){if(window.__lenis)window.__lenis.scrollTo(work,{immediate:true,force:true});else window.scrollTo({top:scrollY+work.getBoundingClientRect().top,behavior:'instant'});}}));};
  addEventListener('hero-start',restore,{once:true});addEventListener('load',()=>{restored=false;restore();},{once:true});restore();setTimeout(restore,6500);
 }
})();
