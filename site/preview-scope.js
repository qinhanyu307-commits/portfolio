(() => {
  history.scrollRestoration = 'manual';
  function resetToHome() {
    window.scrollTo({top:0, left:0, behavior:'instant'});
    if (window.__lenis) window.__lenis.scrollTo(0, {immediate:true, force:true});
  }
  resetToHome();
  window.addEventListener('load', resetToHome, {once:true});
  window.addEventListener('pageshow', event => {
    if (event.persisted) resetToHome();
  });
  function prepareHero() {
    if (!window.__previewAboutReady) return;
    const work = document.getElementById('work');
    const workBounds = work?.getBoundingClientRect();
    document.documentElement.dataset.previewSection = workBounds && workBounds.top <= innerHeight * .5 && workBounds.bottom > 0 ? 'work' : 'about';
    const awards = document.getElementById('awards');
    const awardBounds = awards?.getBoundingClientRect();
    document.documentElement.dataset.previewTheme = awardBounds && awardBounds.top <= 80 && awardBounds.bottom > 80 ? 'awards' : 'light';
    const hero = document.querySelector('[data-section="hero"]');
    if (hero && !hero.id) hero.id = 'hero';
    if (hero && !hero.querySelector('.preview-mobile-about')) {
      const button = document.createElement('button');
      button.className = 'preview-mobile-about';
      button.type = 'button';
      button.innerHTML = '<span>About</span><span aria-hidden="true">↗</span>';
      button.addEventListener('click', () => {
        const about = document.getElementById('about');
        if (window.__lenis) window.__lenis.scrollTo(about, {duration:1.25});
        else about.scrollIntoView({behavior:'smooth'});
      });
      hero.append(button);
    }
    document.querySelectorAll('main > nav span').forEach(span => {
      span.dataset.previewLabel = span.textContent.trim();
    });
  }
  prepareHero();
  window.addEventListener('hero-start', () => {
    resetToHome();
    requestAnimationFrame(resetToHome);
    window.__previewAboutReady = true;
    prepareHero();
  }, {once:true});
  // Add controls only after hydration; never reset a user's navigation here.
  window.addEventListener('load', () => setTimeout(() => {
    window.__previewAboutReady = true;
    prepareHero();
  }, 5500), {once:true});
  window.addEventListener('scroll', prepareHero, {passive:true});
  document.addEventListener('click', event => {
    const target = event.target.closest('a, span, div');
    if (!target) return;
    const label = target.textContent.trim();
    if (label === 'About' || label === 'Home' || label === 'Work') {
      const section = document.getElementById(label === 'About' ? 'about' : label === 'Work' ? 'work' : 'hero');
      if (!section) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (window.__lenis) window.__lenis.scrollTo(section, {duration:1.25});
      else section.scrollIntoView({behavior:'smooth', block:'start'});
    } else if (['Careers','(Scroll to learn more)'].includes(label)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
})();

// Resume media after autoplay rejection, tab suspension and back/forward restore.
(() => {
  const bound=new WeakSet(),motion=matchMedia('(prefers-reduced-motion: reduce)');
  function bind(){
    if(!window.__portfolioHeroStarted)return;
    const hero=document.querySelector('[data-section="hero"]'),video=hero?.querySelector('video');
    if(!video||bound.has(video))return;
    bound.add(video);video.muted=true;video.playsInline=true;video.preload='auto';
    let inView=true,lastTime=video.currentTime,idleSince=performance.now(),lastAttempt=-Infinity,lastReload=-Infinity,reloads=0;
    const button=document.createElement('button');
    button.type='button';button.textContent='播放动画';button.hidden=true;
    button.setAttribute('aria-label','播放首页背景动画');
    button.style.cssText='position:absolute;left:24px;bottom:80px;z-index:40;border:1px solid #777;border-radius:4px;padding:10px 16px;background:#111;color:#fafafa;font:600 14px Arial,sans-serif;cursor:pointer';
    hero.append(button);
    const eligible=()=>!motion.matches&&!document.hidden&&inView&&video.isConnected;
    function show(){if(eligible())button.hidden=false;}
    function attempt(force=false){
      if(!eligible())return;
      const now=performance.now();if(!force&&now-lastAttempt<1000)return;lastAttempt=now;
      try{const result=video.play();if(result?.catch)result.catch(error=>{if(error.name!=='AbortError')show();});}catch{show();}
    }
    function reload(){
      const now=performance.now();if(reloads>=2||now-lastReload<15000)return;
      lastReload=now;reloads++;idleSince=now;
      const time=video.currentTime;
      video.addEventListener('loadedmetadata',()=>{try{if(time>0&&time<video.duration)video.currentTime=time;}catch{}},{once:true});
      video.load();attempt(true);
    }
    function resume(){lastTime=video.currentTime;idleSince=performance.now();if(eligible())attempt(true);}
    button.addEventListener('click',()=>{if(video.error||performance.now()-idleSince>5000){reloads=0;lastReload=-Infinity;reload();}attempt(true);});
    video.addEventListener('playing',()=>{if(video.currentTime!==lastTime){button.hidden=true;idleSince=performance.now();lastTime=video.currentTime;}});
    video.addEventListener('timeupdate',()=>{if(video.currentTime!==lastTime){lastTime=video.currentTime;idleSince=performance.now();button.hidden=true;}});
    video.addEventListener('canplay',()=>attempt());
    video.addEventListener('pause',()=>{if(eligible())attempt();});
    video.addEventListener('error',show);
    document.addEventListener('visibilitychange',resume);
    window.addEventListener('pageshow',resume);window.addEventListener('focus',resume);
    document.addEventListener('pointerdown',()=>attempt(true),{passive:true});
    motion.addEventListener('change',()=>{if(motion.matches){video.pause();button.hidden=true;}else resume();});
    if('IntersectionObserver' in window)new IntersectionObserver(entries=>{
      inView=entries[0].isIntersecting;
      if(inView)resume();else video.pause();
    },{threshold:0}).observe(hero);
    // A lost WebGL context must leave the ordinary background video visible.
    hero.addEventListener('webglcontextlost',event=>{event.target.style.display='none';attempt(true);},true);
    setInterval(()=>{
      if(!eligible())return;
      if(video.currentTime!==lastTime){lastTime=video.currentTime;idleSince=performance.now();return;}
      const idle=performance.now()-idleSince;
      if(idle>3000){show();attempt();}
      if(idle>8000&&(video.error||video.readyState>=2||video.networkState===3))reload();
    },1500);
    if(motion.matches)video.pause();else attempt(true);
  }
  const startup=setInterval(bind,250);setTimeout(()=>clearInterval(startup),15000);
  window.addEventListener('hero-start',bind);window.addEventListener('pageshow',bind);
  new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});bind();
})();
