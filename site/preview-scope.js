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

// Keep background playback recoverable when a browser blocks autoplay.
(() => {
  const bound=new WeakSet();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function bind(){
    if(!window.__lenis&&!window.__portfolioHeroStarted)return;
    const hero=document.querySelector('[data-section="hero"]');
    const video=hero?.querySelector('video');
    if(!video||bound.has(video))return;
    bound.add(video);
    video.muted=true;video.playsInline=true;video.preload='auto';
    const button=document.createElement('button');
    button.type='button';button.textContent='播放动画';button.hidden=true;
    button.setAttribute('aria-label','播放首页背景动画');
    button.style.cssText='position:absolute;left:24px;bottom:80px;z-index:40;border:1px solid #777;border-radius:4px;padding:10px 16px;background:#111;color:#fafafa;font:600 14px Arial,sans-serif;cursor:pointer';
    hero.append(button);
    function show(){if(!reduced&&video.paused)button.hidden=false;}
    function play(){
      if(reduced||document.hidden||!video.isConnected)return;
      try{const result=video.play();if(result?.catch)result.catch(show);}catch{show();}
    }
    button.addEventListener('click',()=>{if(video.error)video.load();play();});
    video.addEventListener('playing',()=>{button.hidden=true;});
    video.addEventListener('canplay',play);
    video.addEventListener('error',show);
    document.addEventListener('visibilitychange',play);
    document.addEventListener('pointerdown',play,{once:true});
    play();setTimeout(show,2000);
  }
  const startup=setInterval(bind,250);setTimeout(()=>clearInterval(startup),15000);
  window.addEventListener('hero-start',bind);
  window.addEventListener('pageshow',bind);
  new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
  bind();
})();
