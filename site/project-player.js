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

// Web case studies open behind a single full-screen sheet in their project color.
(() => {
 const previousOpen=window.__PORTFOLIO_OPEN_VIDEO__;
 const script=new URL(document.currentScript.src),base=new URL('./',script).pathname,revision=script.searchParams.get('v');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let shell=null,study=null,saved=null,phase='idle',closePending=false;
 const tick=()=>new Promise(resolve=>requestAnimationFrame(resolve));
 const cases={go:{color:'#ff3b8d',label:'走起GO 项目案例',title:'走起GO · UI/UX 项目案例'},yadea:{color:'#20c9cf',label:'雅迪 项目案例',title:'雅迪 · 车机壁纸设计'},tomato:{color:'#c1f578',hold:450,label:'番茄小说 项目案例',title:'番茄小说 · APP运营活动'}};
 const caseKey=url=>url.pathname.split('/').filter(Boolean).at(-1);
 function parse(value){try{const url=new URL(value,location.href);return url.origin===location.origin&&Object.keys(cases).some(key=>url.pathname===base+'watch/'+key+'/')?url:null;}catch{return null;}}
 function record(node,property,value){saved.styles.push({node,property,value:node.style.getPropertyValue(property),priority:node.style.getPropertyPriority(property)});node.style.setProperty(property,value,'important');}
 function colorSheet(color){
  const sheet=document.createElement('div');sheet.className='go-case-wipe-sheet';sheet.dataset.goWipeSheet='true';sheet.setAttribute('aria-hidden','true');
  sheet.style.cssText='position:absolute;inset:0;z-index:2;clip-path:inset(100% 0 0 0);pointer-events:none';sheet.style.background=color;
  return sheet;
 }
 async function wipe(cover){
  const sheet=shell.querySelector('[data-go-wipe-sheet]');
  const from=cover?'inset(100% 0 0 0)':'inset(0 0 0 0)',to=cover?'inset(0 0 0 0)':'inset(0 0 100% 0)';
  sheet.getAnimations().forEach(animation=>animation.cancel());
  if(reduced.matches){sheet.style.clipPath=to;return;}
  await sheet.animate([{clipPath:from},{clipPath:to}],{duration:cover?440:460,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'}).finished;
 }
 async function holdFullColor(){
  const duration=cases[caseKey(new URL(study.src))]?.hold||0;
  if(duration)await new Promise(resolve=>setTimeout(resolve,duration));
 }
 async function show(url,push=true,position=null){
  if(shell||document.getElementById('project-video-overlay'))return;
  const key=caseKey(url),config=cases[key];
  const main=document.querySelector('main');
  saved={x:position?.x??scrollX,y:position?.y??scrollY,main,inert:main?.inert,focus:document.activeElement,styles:[]};
  const scrollbar=innerWidth-document.documentElement.clientWidth;
  window.__lenis?.stop();
  for(const node of [document.documentElement,document.body])for(const property of ['overflow-x','overflow-y'])record(node,property,'hidden');
  if(scrollbar>0)record(document.body,'padding-right',(parseFloat(getComputedStyle(document.body).paddingRight)+scrollbar)+'px');
  if(main)main.inert=true;
  if(push){const current=new URL(location.href);current.hash='case-study='+key;const state={...history.state,portfolioGoCase:url.href,portfolioGoPosition:{x:saved.x,y:saved.y}};delete state.portfolioVideo;delete state.portfolioVideoPosition;history.pushState(state,'',current);}
  shell=document.createElement('div');shell.id='project-video-overlay';shell.dataset.kind=key+'-case';shell.setAttribute('role','dialog');shell.setAttribute('aria-modal','true');shell.setAttribute('aria-label',config.label);
  // Cancel the site's root inversion for the color sheet and case artwork.
  shell.style.cssText='position:fixed;inset:0;width:100%;height:100dvh;z-index:2147483647;background:transparent;filter:invert(1);overflow:hidden';
  study=document.createElement('iframe');study.title=config.title;study.style.cssText='display:block;width:100%;height:100%;border:0;opacity:0';
  const loaded=new Promise(resolve=>study.addEventListener('load',resolve,{once:true}));
  const embedded=new URL(url);embedded.searchParams.set('embedded','1');if(revision)embedded.searchParams.set('v',revision);study.src=embedded.href;
  shell.append(study,colorSheet(config.color));document.body.append(shell);phase='opening';shell.dataset.phase=phase;closePending=false;
  await Promise.all([wipe(true),Promise.race([loaded,new Promise(resolve=>setTimeout(resolve,4500))])]);
  await holdFullColor();
  shell.style.background='#000';study.style.opacity='1';study.contentWindow?.postMessage({type:'portfolio-go-case-enter'},location.origin);
  await wipe(false);phase='open';shell.dataset.phase=phase;study.focus();if(closePending)hide();
 }
 async function hide(){
  if(!shell||phase==='closing')return;
  if(phase==='opening'){closePending=true;return;}
  phase='closing';shell.dataset.phase=phase;await wipe(true);await holdFullColor();
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
