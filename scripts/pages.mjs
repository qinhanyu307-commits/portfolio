import {DEFAULT_PAGES as D} from '../site/page-defaults.mjs';
// The retained source template is independent of editable About defaults.
const T={...D.about,titleMuted:"An endless process of",title:"learning, exploring, creating and evolving.",photos:["/assets/images/whatwedo/lu-kehao-portrait.jpg", "/assets/images/whatwedo/lu-kehao-event.jpg", "/assets/images/whatwedo/lu-kehao-contact.png"]};
const BODY_TEMPLATE={"bodyLeft": "We are obsessed with design and technology that makes life easier and more beautiful. Brand identity, product design, and engineering: connected with intention, built to last.", "bodyRight": "Because obsession isn't selfish. There's nothing we love more than to share it. With industry pioneers in fintech, Web3, AI, and beyond. With you."};
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');
function swap(s,pairs){const map=new Map(pairs.filter(([a])=>a.length));if(!map.size)return s;const re=new RegExp([...map.keys()].sort((a,b)=>b.length-a.length).map(v=>v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');return s.replace(re,v=>map.get(v));}
function bodyRows(value,side){
 const lines=value.split('\n'),hasName=side==='bodyLeft'&&/^(?:\[[^\]]+\]|@.+)$/.test(lines[0].trim());
 return lines.map((line,index)=>{
  const name=hasName&&index===0,bodyIndex=index-(hasName?1:0);
  const cells=line.split('|').map(s=>s.trim());
  const heading=name||bodyIndex===0||line==='项目经历'||(side==='bodyLeft'&&bodyIndex===1);
  return {cells,className:!line.trim()?'about-copy-gap':'about-copy-row'+(name?' about-copy-name':'')+(heading?' about-copy-heading':'')+(cells.length>2?' about-copy-skills':cells.length===2?' about-copy-columns':'')};
 });
}
function bodyHtml(value,side){return bodyRows(value,side).map(row=>'<span class="'+row.className+'">'+row.cells.map(cell=>'<span class="about-copy-cell'+(/^[“‘「『]/.test(cell)?' about-copy-quoted':'')+'">'+esc(cell)+'</span>').join('')+'</span>').join('');}
function bodyJs(value,side){return '['+bodyRows(value,side).map((row,index)=>'(0,n.jsxs)("span",{className:'+JSON.stringify(row.className)+',children:['+row.cells.map((cell,i)=>'(0,n.jsx)("span",{className:'+JSON.stringify('about-copy-cell'+(/^[“‘「『]/.test(cell)?' about-copy-quoted':''))+',children:'+JSON.stringify(cell)+'},'+i+')').join(',')+']},'+index+')').join(',')+']';}
export function renderPages(text,rel,content){
 const pages=content.pages||D,{about,catalog}=pages;
 if(rel==='awards-preview.css')text=text.replaceAll("content: 'Contents'",'content: '+JSON.stringify(catalog.heading));
 if(rel==='_next/static/chunks/app/page-52bc2242563ce759.js'){
  const module=(start,end,fn)=>{const s=text.indexOf(start),e=text.indexOf(end,s);if(s<0||e<0)throw Error('页面组件模板缺失');text=text.slice(0,s)+fn(text.slice(s,e))+text.slice(e);};
  text=swap(text,[[JSON.stringify(T.titleMuted),JSON.stringify(about.titleMuted)],[JSON.stringify(T.title),JSON.stringify(about.title)],...['bodyLeft','bodyRight'].map(k=>[JSON.stringify(BODY_TEMPLATE[k]),bodyJs(about[k],k)]),...T.photos.map((p,i)=>[JSON.stringify(p),JSON.stringify(about.photos[i])])]);
  module('6527:','16527:',part=>{part=part.replace(JSON.stringify(D.catalog.title),JSON.stringify(catalog.title));const s=part.indexOf('p=['),e=part.indexOf(',m=[',s);return part.slice(0,s)+'p='+JSON.stringify(catalog.categories.split('\n').filter(Boolean))+part.slice(e);});
 }
 if(rel==='index.html'){
  const section=(id,fn)=>{const s=text.indexOf('<section id="'+id+'"'),e=text.indexOf('</section>',s)+10;if(s<0)throw Error('页面区块缺失：'+id);text=text.slice(0,s)+fn(text.slice(s,e))+text.slice(e);};
  section('about',part=>swap(part,[[esc(T.titleMuted),esc(about.titleMuted)],[esc(T.title),esc(about.title)],...['bodyLeft','bodyRight'].flatMap(k=>[[esc(BODY_TEMPLATE[k]),bodyHtml(about[k],k)],[esc(BODY_TEMPLATE[k]).replaceAll('&#x27;',"'"),bodyHtml(about[k],k)]]),...T.photos.map((p,i)=>[p,about.photos[i]])]));
  section('awards',part=>{
   part=part.replace(esc(D.catalog.title),esc(catalog.title));
   const original=D.catalog.categories.split('\n').map(v=>esc(v));let i=0;
   return part.replace(/(<span style="[^"]*color:#777">)(项目运营|改版升级|AIGC)(<\/span>)/g,(_,x,v,z)=>x+esc(catalog.categories.split('\n')[i++]||'')+z);
  });
  text=text.replace('</head>','<link rel="preload" as="font" href="/assets/fonts/portfolio-resume-bold.woff" type="font/woff" crossorigin="anonymous"></head>');
  const data=JSON.stringify({about,defaults:D.about}).replaceAll('<','\\u003c');
  text=text.replace('</head>','<script>window.__MANAGED_ABOUT__='+data+';</script></head>');
  text=text.replace(/<script([^>]*?)src="\/about-resume\.js([^\"]*)"([^>]*)><\/script>/,'<script$1src="/managed-resume.js"$3></script><script$1src="/about-resume.js$2"$3></script>');
 }
 if(rel==='about-resume.js')text=text.replace('(() => {','(() => { if(window.__USE_MANAGED_RESUME__)return;');
 return text;
}
