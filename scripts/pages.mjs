import {DEFAULT_PAGES as D} from '../site/page-defaults.mjs';
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');
function swap(s,pairs){const map=new Map(pairs.filter(([a])=>a.length));if(!map.size)return s;const re=new RegExp([...map.keys()].sort((a,b)=>b.length-a.length).map(v=>v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');return s.replace(re,v=>map.get(v));}
function spanReplace(row,values){let i=0;return row.replace(/(<span\b[^>]*>)[\s\S]*?(<\/span>)/g,(_,a,b)=>a+esc(values[i++]||'')+b);}
export function renderPages(text,rel,content){
 const pages=content.pages||D,{about,catalog,recognitions:a}=pages;
 if(rel==='about-preview.css')return swap(text,D.about.photos.map((p,i)=>['src*="'+p.split('/').pop().replace(/\.[^.]+$/,'')+'"','src*="'+about.photos[i].split('/').pop()+'"']));
 if(rel==='awards-preview.css')text=text.replaceAll("content: 'Contents'",'content: '+JSON.stringify(catalog.heading));
 if(rel==='bottom-sections-preview.css'&&a.logo!==D.recognitions.logo)text+='\n#recognitions img[alt="SoDA"] { filter: invert(1) !important; }\n';
 if(rel==='bottom-sections-preview.css'&&a.number.replace('+','').length===1)text+='\n#recognitions > div[style*="grid"] > div:first-child > div:first-child > div:first-child > div:first-child { display:none !important; }\n';
 if(rel==='_next/static/chunks/app/page-52bc2242563ce759.js'){
  const module=(start,end,fn)=>{const s=text.indexOf(start),e=text.indexOf(end,s);if(s<0||e<0)throw Error('页面组件模板缺失');text=text.slice(0,s)+fn(text.slice(s,e))+text.slice(e);};
  text=swap(text,[[JSON.stringify(D.about.titleMuted),JSON.stringify(about.titleMuted)],[JSON.stringify(D.about.title),JSON.stringify(about.title)],...D.about.photos.map((p,i)=>[JSON.stringify(p),JSON.stringify(about.photos[i])])]);
  module('6527:','16527:',part=>{part=part.replace(JSON.stringify(D.catalog.title),JSON.stringify(catalog.title));const s=part.indexOf('p=['),e=part.indexOf(',m=[',s);return part.slice(0,s)+'p='+JSON.stringify(catalog.categories.split('\n').filter(Boolean))+part.slice(e);});
  module('16527:','7924:',part=>{
   const s=part.indexOf('f=['),e=part.indexOf(',m=[',s);part=part.slice(0,s)+'f='+JSON.stringify(a.entries)+',p='+JSON.stringify(a.summary.split('\n').filter(Boolean))+part.slice(e);
   part=swap(part,[[JSON.stringify(D.recognitions.title),JSON.stringify(a.title)],[JSON.stringify(D.recognitions.subtitle),JSON.stringify(a.subtitle)],[JSON.stringify('30+'),JSON.stringify(a.number)],[JSON.stringify(D.recognitions.logo),JSON.stringify(a.logo)],[JSON.stringify(D.recognitions.memberText),JSON.stringify(a.memberText)]]);
   part=part.replace('children:["Proud members of SoDA, the global",(0,n.jsx)("br",{}),"network of the world\'s leading digital",(0,n.jsx)("br",{}),"agencies."]','children:'+JSON.stringify(a.memberText));
   part=part.replace('r.current.src="/assets/images/awards/awards-img-".concat(l,".jpg")','r.current.src=f[n].image');
   const digits=a.number.replace('+','').padStart(2,'0').split('').map(Number);part=part.replace('i=[3,0].map',`i=${JSON.stringify(digits)}.map`);
   part=part.replace('ref:j,style:h,children:"+"','ref:j,style:h,children:'+JSON.stringify(a.number.endsWith('+')?'+':''));
   return part;
  });
 }
 if(rel==='index.html'){
  const section=(id,fn)=>{const s=text.indexOf('<section id="'+id+'"'),e=text.indexOf('</section>',s)+10;if(s<0)throw Error('页面区块缺失：'+id);text=text.slice(0,s)+fn(text.slice(s,e))+text.slice(e);};
  section('about',part=>swap(part,[[esc(D.about.titleMuted),esc(about.titleMuted)],[esc(D.about.title),esc(about.title)],...D.about.photos.map((p,i)=>[p,about.photos[i]])]));
  section('awards',part=>{
   part=part.replace(esc(D.catalog.title),esc(catalog.title));
   const original=D.catalog.categories.split('\n').map(v=>esc(v));let i=0;
   return part.replace(/(<span style="[^"]*color:#777">)(项目运营|改版升级|AIGC)(<\/span>)/g,(_,x,v,z)=>x+esc(catalog.categories.split('\n')[i++]||'')+z);
  });
  section('recognitions',part=>{
   if(!a.number.endsWith('+'))part=part.replace('>+</span>','></span>');
   part=swap(part,[[esc(D.recognitions.title),esc(a.title)],[esc(D.recognitions.subtitle),esc(a.subtitle)],[D.recognitions.logo,a.logo]]);
   const rows=[...part.matchAll(/<div style="display:grid;grid-template-columns:1fr auto auto;[^\"]*">(?:<span\b[^>]*>[\s\S]*?<\/span>){3}<\/div>/g)];
   if(rows.length!==a.entries.length)throw Error('荣誉列表模板数量不一致：'+rows.length);
   let i=0;part=part.replace(/<div style="display:grid;grid-template-columns:1fr auto auto;[^\"]*">(?:<span\b[^>]*>[\s\S]*?<\/span>){3}<\/div>/g,row=>{const item=a.entries[i++];return spanReplace(row,[item.award,item.project,item.date]);});
   let summary=0;part=part.replace(/(<span style="[^"]*color:#777">)([^<]*)(<\/span>)/g,(all,x,v,z)=>D.recognitions.summary.split('\n').map(esc).includes(v)?x+esc(a.summary.split('\n')[summary++]||'')+z:all);
   const old=esc(D.recognitions.memberText).replace('the global ','the global<br>').replace('digital agencies.','digital<br>agencies.');part=part.replace(old,esc(a.memberText)).replace(old.replaceAll('&#x27;',"'"),esc(a.memberText));
   return part;
  });
  const data=JSON.stringify({about,defaults:D.about}).replaceAll('<','\\u003c');
  text=text.replace('</head>','<script>window.__MANAGED_ABOUT__='+data+';</script></head>');
  text=text.replace(/<script([^>]*?)src="\/about-resume\.js([^\"]*)"([^>]*)><\/script>/,'<script$1src="/managed-resume.js"$3></script><script$1src="/about-resume.js$2"$3></script>');
 }
 if(rel==='about-resume.js')text=text.replace('(() => {','(() => { if(window.__USE_MANAGED_RESUME__)return;');
 return text;
}
