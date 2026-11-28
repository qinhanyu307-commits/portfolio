(() => {
  const carousel = document.getElementById('wallpaper-carousel');
  const videos = [...carousel.querySelectorAll('video')];
  if (!videos.length) return;

  const toggle = carousel.querySelector('button');
  let current = 0;
  let visible = false;
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function syncPlayback() {
    const video = videos[current];
    if (!visible || document.hidden || paused) {
      video.pause();
      return;
    }

    video.play().catch(error => {
      if (video !== videos[current] || error.name === 'AbortError') return;
      paused = true;
      updateToggle();
    });
  }

  function updateToggle() {
    toggle.dataset.paused = String(paused);
    toggle.setAttribute('aria-label', paused ? '播放壁纸轮播' : '暂停壁纸轮播');
  }

  function showCurrent() {
    const next = (current + 1) % videos.length;
    const previous = (current - 1 + videos.length) % videos.length;
    videos.forEach((video, index) => {
      if (index !== current) video.pause();
      if (index === current) video.dataset.position = 'current';
      else if (index === next) video.dataset.position = 'next';
      else if (index === previous) video.dataset.position = 'previous';
      else delete video.dataset.position;
    });
    syncPlayback();
  }

  videos.forEach((video, index) => {
    video.addEventListener('ended', () => {
      if (index !== current) return;
      video.currentTime = 0;
      current = (current + 1) % videos.length;
      showCurrent();
    });
  });

  toggle.addEventListener('click', () => {
    paused = !paused;
    updateToggle();
    syncPlayback();
  });
  document.addEventListener('visibilitychange', syncPlayback);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= .35;
    syncPlayback();
  }, {threshold: .35});

  updateToggle();
  showCurrent();
  observer.observe(carousel);
})();
