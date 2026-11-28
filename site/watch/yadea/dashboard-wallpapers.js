(() => {
  const screen = document.getElementById('dashboard-wallpapers');
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
    const pendingImage = slides[next].decode().catch(() => {});
    timer = setTimeout(async () => {
      if (!visible || document.hidden) return;
      changing = true;
      await pendingImage;
      if (visible && !document.hidden) {
        if (slides[next].naturalWidth) await showSlide(next);
        next = (next + 1) % slides.length;
      }
      changing = false;
      schedule();
    }, 2500);
  }

  async function showSlide(next) {
    const outgoing = slides[index];
    const incoming = slides[next];
    if (!reducedMotion.matches) {
      incoming.dataset.incoming = '';
      const options = {duration: 500, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards'};
      const exit = outgoing.animate([{transform: 'translateY(0)'}, {transform: 'translateY(-100%)'}], options);
      const enter = incoming.animate([{transform: 'translateY(100%)'}, {transform: 'translateY(0)'}], options);
      await Promise.all([exit.finished, enter.finished]);
      delete incoming.dataset.incoming;
      exit.cancel();
      enter.cancel();
    }
    delete outgoing.dataset.current;
    incoming.dataset.current = '';
    index = next;
  }

  document.addEventListener('visibilitychange', schedule);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.intersectionRatio >= .35;
    schedule();
  }, {root: document, threshold: .35});
  observer.observe(screen);
})();
