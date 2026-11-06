(() => {
 const config=window.__MANAGED_ABOUT__;
 if(!config||JSON.stringify(config.about.resume)===JSON.stringify(config.defaults.resume))return;
 window.__USE_MANAGED_RESUME__=true;
 const data=config.about.resume,ns='http://www.w3.org/2000/svg';let resume,characters=[],queued=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function mount(){
  if(resume||!window.__previewAboutReady)return;
  const about=document.getElementById('about');if(!about)return;
  resume=document.createElement('aside');resume.className='about-resume about-resume-artwork';resume.setAttribute('aria-label','个人履历');
  const svg=document.createElementNS(ns,'svg');svg.classList.add('resume-reference-svg');svg.setAttribute('viewBox','0 0 767 756');svg.setAttribute('role','img');
  const title=document.createElementNS(ns,'title');title.textContent=Object.values(data).join('。');svg.append(title);
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');let y=34;
  function line(text,x,baseline,size=24,color='#4a4a4a',weight=400){
   ctx.font=weight+' '+size+'px Arial, Microsoft YaHei, sans-serif';let cursor=x;
   for(const char of text){const group=document.createElementNS(ns,'g'),glyph=document.createElementNS(ns,'text');glyph.textContent=char;glyph.setAttribute('x',cursor);glyph.setAttribute('y',baseline);glyph.setAttribute('fill',color);glyph.setAttribute('font-family','Arial, Microsoft YaHei, sans-serif');glyph.setAttribute('font-size',size);glyph.setAttribute('font-weight',weight);group.append(glyph);svg.append(group);characters.push(group);cursor+=ctx.measureText(char).width;}
  }
  function heading(label){line(label,0,y,36,'#000',600);y+=67;}
  function rows(value,split=false){for(const row of value.split('\n').filter(Boolean)){if(split){const cols=row.split('|');line(cols[0].trim(),0,y);line(cols.slice(1).join('|').trim(),360,y);}else line(row,0,y);y+=35;}}
  heading(data.educationTitle);line(data.school,0,y,24,'#000',500);y+=47;rows(data.honors);y+=53;heading(data.projectsTitle);rows(data.projects,true);y+=43;heading(data.internshipTitle);rows(data.internships,true);y+=46;heading(data.skillsTitle);
  for(const row of data.skills.split('\n').filter(Boolean)){row.split('|').forEach((label,i)=>line(label.trim(),[0,165,308,453][i]??i*150,y));y+=43;}
  svg.setAttribute('viewBox','0 0 767 '+Math.max(756,y));resume.style.aspectRatio='767 / '+Math.max(756,y);resume.append(svg);about.append(resume);update();
 }
 function update(){queued=false;if(!resume)return;const about=document.getElementById('about'),mobile=matchMedia('(max-width: 639px)').matches;const start=mobile?about.getBoundingClientRect().top+scrollY:about.parentElement.getBoundingClientRect().top+scrollY;const progress=mobile?(scrollY+innerHeight-start-resume.offsetTop)/resume.offsetHeight:(scrollY-start+innerHeight*.6)/(innerHeight*2.1);
  characters.forEach((glyph,i)=>{const begin=i/Math.max(1,characters.length-1)*.86,amount=reduced?1:Math.max(0,Math.min(1,(progress-begin)/.065));glyph.style.opacity=amount;glyph.setAttribute('transform','translate(0 '+(1-amount)*20+')');});
 }
 function schedule(){mount();if(!queued){queued=true;requestAnimationFrame(update);}}
 schedule();window.addEventListener('hero-start',()=>requestAnimationFrame(schedule),{once:true});window.addEventListener('load',()=>setTimeout(schedule,5700),{once:true});window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
})();
