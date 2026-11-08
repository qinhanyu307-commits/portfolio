(() => {
  const embedded=window.parent!==window&&new URLSearchParams(location.search).get('embedded')==='1';
  const close=()=>window.parent.postMessage({type:'portfolio-close-video'},location.origin);
  document.getElementById('back-to-portfolio').addEventListener('click',event=>{
    if(embedded){event.preventDefault();close();return;}
    try{if(document.referrer&&new URL(document.referrer).origin===location.origin&&history.length>1){event.preventDefault();history.back();}}catch{}
  });
  window.addEventListener('keydown',event=>{if(embedded&&event.key==='Escape'&&!document.fullscreenElement){event.preventDefault();close();}});
})();
