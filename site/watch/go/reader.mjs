import * as pdfjs from '../../assets/vendor/pdfjs/pdf.min.mjs';
const worker=new URL('../../assets/vendor/pdfjs/pdf.worker.min.mjs',import.meta.url);worker.search=new URL(import.meta.url).search;
pdfjs.GlobalWorkerOptions.workerSrc=worker.href;
const root=document.getElementById('pdf-pages'),status=document.getElementById('read-status'),error=document.getElementById('error');
const records=[],queue=[];let active=false,width=0,generation=0;
const pageWidth=()=>Math.min(1280,root.clientWidth-2*parseFloat(getComputedStyle(root).paddingLeft));
function release(record){if(record.busy)return;record.canvas.width=record.canvas.height=0;record.rendered=false;record.element.dataset.rendered='false';record.page.cleanup();}
function enqueue(record){if(record.rendered||record.busy||record.queued)return;record.queued=true;queue.push(record);pump();}
async function pump(){
 if(active)return;active=true;
 try{while(queue.length){
  const record=queue.shift();record.queued=false;if(!record.near||record.rendered)continue;
  record.busy=true;const version=generation;
  try{
   const viewport=record.page.getViewport({scale:width/record.original.width});
   const ratio=Math.min(devicePixelRatio||1,2,Math.sqrt(8000000/(viewport.width*viewport.height)),8192/Math.max(viewport.width,viewport.height));
   record.canvas.width=Math.ceil(viewport.width*ratio);record.canvas.height=Math.ceil(viewport.height*ratio);
   record.task=record.page.render({canvasContext:record.canvas.getContext('2d'),viewport,transform:[ratio,0,0,ratio,0,0],background:'rgb(255,255,255)'});
   await record.task.promise;
   if(version===generation&&record.near){record.rendered=true;record.element.dataset.rendered='true';}
  }catch(cause){if(cause.name!=='RenderingCancelledException'){record.element.querySelector('.page-loading').textContent='此页暂未显示，请滚动后重试。';console.error('PDF page render failed',cause);}}
  finally{record.busy=false;record.task=null;if(!record.near||version!==generation)release(record);record.page.cleanup();if(record.near&&version!==generation)enqueue(record);}
 }}finally{active=false;}
}
function resize(){const next=pageWidth();if(Math.abs(next-width)<1)return;width=next;generation++;for(const record of records){record.task?.cancel();release(record);record.element.style.width=width+'px';if(record.near)enqueue(record);}}
async function start(){
 try{
  const task=pdfjs.getDocument({url:new URL(root.dataset.pdf||'../../assets/documents/go-app-redesign.pdf',import.meta.url).href,useWasm:false,isEvalSupported:false});
  const pdf=await task.promise;width=pageWidth();
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){const record=records[Number(entry.target.dataset.pageNumber)-1];if(!record)continue;record.near=entry.isIntersecting;if(record.near)enqueue(record);else release(record);}},{root,rootMargin:'900px 0px'});
  for(let number=1;number<=pdf.numPages;number++){
   const page=await pdf.getPage(number),original=page.getViewport({scale:1}),element=document.createElement('article'),canvas=document.createElement('canvas'),loading=document.createElement('div');
   element.className='pdf-page';element.dataset.pageNumber=String(number);element.dataset.rendered='false';element.setAttribute('aria-label','第 '+number+' 页，共 '+pdf.numPages+' 页');element.style.width=width+'px';element.style.aspectRatio=original.width+' / '+original.height;
   canvas.setAttribute('aria-label','PDF 第 '+number+' 页');canvas.setAttribute('role','img');loading.className='page-loading';loading.textContent='第 '+number+' 页';element.append(canvas,loading);
   const record={page,original,element,canvas,near:false,rendered:false,busy:false,queued:false,task:null};records.push(record);root.append(element);observer.observe(element);
  }
  root.setAttribute('aria-busy','false');status.textContent=pdf.numPages+' 页 · 上下滚动阅读';new ResizeObserver(resize).observe(root);
 }catch(cause){status.textContent='PDF 加载失败';root.setAttribute('aria-busy','false');error.hidden=false;error.textContent='暂时无法载入 PDF，请检查网络后重试。';const retry=document.createElement('button');retry.id='retry';retry.textContent='重新载入';retry.addEventListener('click',()=>location.reload());error.append(document.createElement('br'),retry);console.error('PDF load failed',cause);}
}
start();
