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
