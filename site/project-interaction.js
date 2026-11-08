(() => {
  let rows = [], group, hovered = null, focused = null, selected = null;
  let pointer = null, frame = 0, leaveTimer = 0, painted = undefined;
  function alignCatalogHeading() {
    const catalog=document.getElementById('awards');if(!catalog)return;
    const mobile=matchMedia('(max-width: 639px)').matches;
    const summary=mobile?[...catalog.children].find(e=>e.matches('div')&&e.querySelector(':scope > p:first-child')&&!e.style.borderTop):catalog.querySelector(':scope > div[style*="grid"] > div:first-child');
    const heading=summary?.firstElementChild,category=mobile?summary?.querySelector(':scope > div span'):summary?.children[1]?.querySelector('span');
    if(!heading||!category)return;
    const hs=getComputedStyle(heading,'::before'),cs=getComputedStyle(category);let title;
    try{title=JSON.parse(hs.content);}catch{return;}
    const context=document.createElement('canvas').getContext('2d');if(!context)return;
    const bearing=(style,text)=>{context.font=style.font;if('letterSpacing' in context)context.letterSpacing=style.letterSpacing;return context.measureText(text).actualBoundingBoxLeft;};
    const offset=category.getBoundingClientRect().left-heading.getBoundingClientRect().left+bearing(hs,title)-bearing(cs,category.textContent);
    if(Number.isFinite(offset))summary.style.setProperty('--catalog-heading-shift',offset+'px');
  }
  function prepare() {
    if (!window.__previewAboutReady) return;
    alignCatalogHeading();
    const current = [...document.querySelectorAll('#awards .award-directory-row')];
    if (!current.length) return;
    if (rows.length === current.length && rows.every((row,i) => row === current[i])) return;
    rows = current; group = rows[0].parentElement; group.classList.add('project-directory-group');
    hovered = focused = selected = null; painted = undefined;
    rows.forEach(row => { row.tabIndex = 0; row.setAttribute('role','button'); row.setAttribute('aria-pressed','false'); });
    paint();
  }
  function paint() {
    if (!group) return;
    const active = hovered || focused || selected;
    if (active === painted) return;
    painted = active;
    group.dataset.projectEmphasis = String(!!active);
    rows.forEach(row => { row.dataset.projectActive = String(row === active); });
  }
  function clearHover() {
    if (leaveTimer) return;
    leaveTimer = setTimeout(() => { leaveTimer = 0; hovered = null; paint(); }, 110);
  }
  function updatePointer() {
    frame = 0;
    if (!group || !pointer) return;
    const {x,y} = pointer;
    const target = document.elementFromPoint(x,y)?.closest('#awards .award-directory-row');
    if (target && rows.includes(target)) {
      clearTimeout(leaveTimer); leaveTimer = 0;
      hovered = target; paint();
    } else clearHover();
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(updatePointer); }
  function move(event) {
    if (event.pointerType === 'touch') return;
    pointer = {x:event.clientX,y:event.clientY};
    if (!group || !group.isConnected) prepare();
    schedule();
  }
  function choose(row) {
    selected = selected === row ? null : row;
    rows.forEach(item => item.setAttribute('aria-pressed',String(item === selected)));
    paint();
  }
  document.addEventListener('pointermove',move,{passive:true});
  document.addEventListener('mousemove',move,{passive:true});
  document.addEventListener('pointerleave',event => { if (!event.relatedTarget) { pointer=null;clearHover(); } });
  document.addEventListener('click',event => {
    const row=event.target.closest('#awards .award-directory-row');
    if(row){prepare();choose(row);}
  });
  document.addEventListener('focusin',event => {
    const row=event.target.closest('#awards .award-directory-row');
    if(row?.matches(':focus-visible')){focused=row;paint();}
  });
  document.addEventListener('focusout',()=>{focused=null;paint();});
  document.addEventListener('keydown',event=>{
    const row=event.target.closest('#awards .award-directory-row');if(!row)return;
    if(event.key==='Enter'||event.key===' '){event.preventDefault();choose(row);}
    if(event.key==='Escape'){selected=focused=null;rows.forEach(item=>item.setAttribute('aria-pressed','false'));row.blur();paint();}
  });
  window.addEventListener('scroll',()=>{if(!group||!group.isConnected)prepare();schedule();},{passive:true});
  window.addEventListener('resize',()=>{prepare();setTimeout(()=>{prepare();schedule();},100);});
  window.addEventListener('blur',()=>{pointer=null;hovered=focused=null;paint();});
  document.fonts.ready.then(prepare);
  window.addEventListener('hero-start',()=>requestAnimationFrame(prepare),{once:true});
  window.addEventListener('load',()=>setTimeout(prepare,5700),{once:true});
})();