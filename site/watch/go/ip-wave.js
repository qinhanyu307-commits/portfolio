(() => {
 const part=document.getElementById('part-6'),art=part?.querySelector('img');if(!art)return;
 const ns='http://www.w3.org/2000/svg',left=1510,top=105,width=150,height=130,pivot={x:56,y:100},background=[247,247,249];
 const node=(tag,attributes={})=>{const e=document.createElementNS(ns,tag);for(const [key,value] of Object.entries(attributes))e.setAttribute(key,value);return e;};
 function handLayers(){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(art,left,top,width,height,0,0,width,height);
  const source=ctx.getImageData(0,0,width,height).data,sprite=ctx.createImageData(width,height),clear=ctx.createImageData(width,height),mask=new Uint8Array(width*height),outside=new Uint8Array(width*height),queue=[];
  const distance=index=>Math.max(...background.map((value,channel)=>Math.abs(source[index*4+channel]-value)));
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const worldX=x+left,worldY=y+top;
   const right=worldY<=175?1613:worldY<=190?1613-(worldY-175)*1.13:1596-(worldY-190)*.5;
   const index=y*width+x;
   if(worldY>=112&&worldY<207&&worldX>=1530&&worldX<=right)mask[index]=1;
  }
  const add=index=>{if(index<0||index>=width*height||outside[index]||(mask[index]&&distance(index)>4))return;outside[index]=1;queue.push(index);};
  for(let x=0;x<width;x++){add(x);add((height-1)*width+x);}for(let y=0;y<height;y++){add(y*width);add(y*width+width-1);}
  for(let i=0;i<queue.length;i++){const index=queue[i],x=index%width;if(x)add(index-1);if(x<width-1)add(index+1);add(index-width);add(index+width);}
  for(let index=0;index<width*height;index++){
   if(!mask[index])continue;
   const at=index*4;clear.data.set([...background,255],at);
   if(outside[index])continue;
   const x=index%width,y=Math.floor(index/width),edge=(x&&outside[index-1])||(x<width-1&&outside[index+1])||(y&&outside[index-width])||(y<height-1&&outside[index+width]);
   const alpha=edge?Math.max(.05,Math.min(1,(distance(index)-4)/8)):1;
   for(let c=0;c<3;c++)sprite.data[at+c]=Math.max(0,Math.min(255,(source[at+c]-background[c]*(1-alpha))/alpha));
   sprite.data[at+3]=Math.round(alpha*255);
  }
  ctx.putImageData(clear,0,0);const erased=canvas.toDataURL('image/png');ctx.putImageData(sprite,0,0);return {erased,hand:canvas.toDataURL('image/png')};
 }
 async function mount(){
  await art.decode();if(part.querySelector('.ip-wave-stage'))return;
  const layers=handLayers(),stage=document.createElement('div');stage.className='ip-wave-stage';stage.style.top=(top/art.naturalHeight*100)+'%';stage.setAttribute('role','img');stage.setAttribute('aria-label','粉色 IP 持续挥手打招呼，前方毛玻璃保持固定');
  const svg=node('svg',{viewBox:`0 0 ${width} ${height}`,'aria-hidden':'true'}),anchor=node('g',{transform:`translate(${pivot.x} ${pivot.y})`}),hand=node('g',{class:'ip-wave-hand'});
  svg.append(node('image',{width,height,href:layers.erased}));hand.append(node('image',{x:-pivot.x,y:-pivot.y,width,height,href:layers.hand}));anchor.append(hand);svg.append(anchor);stage.append(svg);part.classList.add('has-ip-wave');part.append(stage);
  // Only the raised glove moves; the original body and foreground frosted glass stay untouched.
  let visible=false;const update=()=>stage.classList.toggle('is-waving',visible&&!document.hidden);
  const view=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();},{rootMargin:'100px'});view.observe(stage);document.addEventListener('visibilitychange',update);
 }
 const ready=new IntersectionObserver(entries=>{if(!entries.some(entry=>entry.isIntersecting))return;ready.disconnect();mount().catch(()=>{/* Keep the original IP illustration if enhancement fails. */});},{rootMargin:'1200px'});ready.observe(part);
})();
