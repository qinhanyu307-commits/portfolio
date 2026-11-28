function startDashboardCarousel(screen) {
  const slides = [...screen.querySelectorAll('img')];
  if (slides.length < 2) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  let index = 0;
  let next = 1;
  let timer;
  let visible = false;
  let changing = false;

  function schedule() {
    clearTimeout(timer);
    if (!visible || document.hidden || changing) return;

    slides[next].loading = 'eager';
    timer = setTimeout(async () => {
      if (!visible || document.hidden) return;
      changing = true;
      if (slides[next].naturalWidth) await showSlide(next);
      next = (next + 1) % slides.length;
      changing = false;
      schedule();
    }, 2500);
  }

  async function showSlide(next) {
    const outgoing = slides[index];
    const incoming = slides[next];
    if (outgoing !== incoming && !reducedMotion.matches && typeof incoming.animate === 'function') {
      incoming.dataset.incoming = '';
      const options = {duration: 500, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards'};
      const exit = outgoing.animate([{transform: 'translateY(0)'}, {transform: 'translateY(-100%)'}], options);
      const enter = incoming.animate([{transform: 'translateY(100%)'}, {transform: 'translateY(0)'}], options);
      await Promise.allSettled([exit.finished, enter.finished]);
      delete incoming.dataset.incoming;
      exit.cancel();
      enter.cancel();
    }
    delete outgoing.dataset.current;
    incoming.dataset.current = '';
    index = next;
  }

  // Use the case page's viewport, including when it is embedded in the portfolio.
  function updateVisibility() {
    const {top, bottom, height} = screen.getBoundingClientRect();
    const inView = height > 0 && bottom > 0 && top < window.innerHeight;
    if (visible === inView) return;
    visible = inView;
    schedule();
  }

  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('scroll', updateVisibility, {passive: true});
  window.addEventListener('resize', updateVisibility);
  window.addEventListener('pageshow', updateVisibility);
  updateVisibility();
}

document.querySelectorAll('.dashboard-wallpapers').forEach(startDashboardCarousel);
