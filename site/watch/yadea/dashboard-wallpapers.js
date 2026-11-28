(() => {
  const screen = document.getElementById('dashboard-wallpapers');
  const slides = [...screen.querySelectorAll('img')];
  if (slides.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let index = 0;
  let timer;
  let visible = false;
  let changing = false;

  function schedule() {
    clearTimeout(timer);
    if (!visible || document.hidden || changing) return;

    const next = (index + 1) % slides.length;
    const pendingImage = slides[next].decode().catch(() => {});
    timer = setTimeout(async () => {
      if (!visible || document.hidden) return;
      changing = true;
      await pendingImage;
      if (visible && !document.hidden && slides[next].naturalWidth) {
        await slideUp(next);
      }
      changing = false;
      schedule();
    }, 4000);
  }

  async function slideUp(next) {
    const outgoing = slides[index];
    const incoming = slides[next];
    incoming.dataset.incoming = '';
    const options = {duration: 500, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards'};
    const exit = outgoing.animate([{transform: 'translateY(0)'}, {transform: 'translateY(-100%)'}], options);
    const enter = incoming.animate([{transform: 'translateY(100%)'}, {transform: 'translateY(0)'}], options);
    await Promise.all([exit.finished, enter.finished]);
    delete outgoing.dataset.current;
    delete incoming.dataset.incoming;
    incoming.dataset.current = '';
    exit.cancel();
    enter.cancel();
    index = next;
  }

  document.addEventListener('visibilitychange', schedule);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  }, {threshold: .35});
  observer.observe(screen);
})();
