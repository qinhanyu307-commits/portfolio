(() => {
 const part=document.getElementById('part-10'),art=part?.querySelector('img');
 if(!art)return;
 const ns='http://www.w3.org/2000/svg';
 const element=(tag,attributes={})=>{const node=document.createElementNS(ns,tag);for(const [key,value] of Object.entries(attributes))node.setAttribute(key,value);return node;};
 // Sample the existing mascot in ribbon coordinates; the original artwork stays untouched.
 function mascot(angle,originY,background){
  const canvas=document.createElement('canvas');canvas.width=64;canvas.height=100;
  const ctx=canvas.getContext('2d',{willReadFrequently:true}),radians=angle*Math.PI/180,c=Math.cos(radians),s=Math.sin(radians);
  ctx.setTransform(c,-s,s,c,-s*originY-268,-c*originY+18);ctx.drawImage(art,0,0);ctx.resetTransform();
  const pixels=ctx.getImageData(0,0,64,100),data=pixels.data,seen=new Uint8Array(6400),queue=[];
  const similar=(at,color)=>Math.max(...color.map((v,i)=>Math.abs(data[at+i]-v)))<35;
  const clearable=index=>{const at=index*4;return similar(at,background)||similar(at,[247,247,249])||data[at+3]===0;};
  const add=index=>{if(index<0||index>=6400||seen[index]||!clearable(index))return;seen[index]=1;queue.push(index);};
  for(let x=0;x<64;x++){add(x);add(6336+x);}for(let y=0;y<100;y++){add(y*64);add(y*64+63);}
  for(let at=0;at<queue.length;at++){const index=queue[at],x=index%64;data[index*4+3]=0;if(x)add(index-1);if(x<63)add(index+1);add(index-64);add(index+64);}
  ctx.putImageData(pixels,0,0);return canvas.toDataURL('image/png');
 }
 async function mount(){
  await art.decode();if(part.querySelector('.case-ribbons'))return;
  const stage=document.createElement('div');stage.className='case-ribbons';stage.setAttribute('role','img');stage.setAttribute('aria-label','两条交叉彩带，YOUZHI PET DESIGN 文字与品牌图标反向循环滚动');
  const svg=element('svg',{viewBox:'0 0 1920 470','aria-hidden':'true'}),defs=element('defs');svg.append(defs);
  const mascotClip=element('clipPath',{id:'case-ribbon-mascot-clip'});mascotClip.append(element('ellipse',{cx:300,cy:45,rx:28,ry:29}),element('path',{d:'M307 -8L289 27H309Z'}));defs.append(mascotClip);
  svg.append(element('rect',{width:1920,height:227,fill:'#f7f7f9'}),element('rect',{y:227,width:1920,height:243,fill:'#000'}));
  // Continue the original thin grid underneath the ribbons.
  const grid=element('g',{stroke:'#262626','stroke-width':1});
  for(const y of [395,424])grid.append(element('path',{d:`M0 ${y}H1920`}));
  for(const x of [259,287,1631,1659])grid.append(element('path',{d:`M${x} 395V470`}));
  for(const x of [259,1631])grid.append(element('rect',{x,y:395,width:28,height:28,fill:'#262626',stroke:'none'}));svg.append(grid);
  for(const ribbon of [{name:'pink',angle:10,origin:1982,color:'#fbabce',mascotBackground:[251,171,206]},{name:'black',angle:-2.15,origin:2177,color:'#171717',mascotBackground:[23,23,23]}]){
   const symbol=element('g',{id:`case-ribbon-${ribbon.name}-motif`});
   const text=element('text',{x:0,y:55,fill:'#fff','font-family':'Arial, Helvetica, sans-serif','font-size':30,'font-weight':700,'letter-spacing':'-.6'});text.textContent='YOUZHI PET DESIGN';
   symbol.append(text,element('image',{x:268,y:-18,width:64,height:100,'clip-path':'url(#case-ribbon-mascot-clip)',href:mascot(ribbon.angle,ribbon.origin,ribbon.mascotBackground)}));defs.append(symbol);
   const band=element('g',{transform:`translate(0 ${ribbon.origin-1950}) rotate(${ribbon.angle})`});
   band.append(element('rect',{x:-800,y:0,width:3520,height:80,fill:ribbon.color}));
   const ink=element('g',{class:`case-ribbon-ink case-ribbon-ink--${ribbon.name}`});
   for(let i=-2;i<8;i++)ink.append(element('use',{href:`#case-ribbon-${ribbon.name}-motif`,x:i*400}));
   band.append(ink);svg.append(band);
  }
  stage.append(svg);part.classList.add('has-case-ribbons');part.append(stage);
  let inView=false;const update=()=>stage.classList.toggle('is-running',inView&&!document.hidden);
  const view=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;update();},{rootMargin:'100px'});view.observe(stage);document.addEventListener('visibilitychange',update);
 }
 const ready=new IntersectionObserver(entries=>{if(!entries.some(entry=>entry.isIntersecting))return;ready.disconnect();mount().catch(()=>{/* Keep the original image if decoding is unavailable. */});},{rootMargin:'1200px'});ready.observe(part);
})();
