(() => {
 const embedded=parent!==window&&new URLSearchParams(location.search).get('embedded')==='1';
 const close=event=>{
  if(embedded){event?.preventDefault();parent.postMessage({type:'portfolio-close-video'},location.origin);return;}
  try{if(document.referrer&&new URL(document.referrer).origin===location.origin&&history.length>1){event?.preventDefault();history.back();}}catch{}
 };
 document.querySelectorAll('[data-case-back]').forEach(link=>link.addEventListener('click',close));
 addEventListener('keydown',event=>{if(event.key==='Escape'&&embedded){event.preventDefault();close();}});
 addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='portfolio-go-case-enter'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  document.querySelector('.case-intro').animate([{opacity:.4,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'});
 });
})();
