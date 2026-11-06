import fs from 'node:fs/promises';
import path from 'node:path';
import {validateContent} from '../site/content-schema.mjs';
const chunk='_next/static/chunks/app/page-52bc2242563ce759.js';
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');
export function arrayAt(text,startMarker,endMarker,startAt=0){const start=text.indexOf(startMarker,startAt);if(start<0)throw Error('作品模板起点不存在');const from=start+startMarker.length,end=text.indexOf(endMarker,from);if(end<0)throw Error('作品模板终点不存在');return {from,end,data:JSON.parse(text.slice(from,end))};}
export async function loadContent(source){return validateContent(JSON.parse(await fs.readFile(path.join(source,'content/projects.json'),'utf8')));}
export function renderContent(text,rel,content,defaults){
  if(rel!==chunk&&rel!=='index.html')return text;
  const projects=content.projects;
  if(rel===chunk){
    const works=arrayAt(text,'g=',';function h()',text.indexOf('4312:'));
    const next=works.data.map((p,i)=>({...p,titleLines:[projects[i].title1,projects[i].title2],description:projects[i].description,cover:projects[i].cover,icon:projects[i].icon,video:projects[i].video,href:projects[i].href}));
    text=text.slice(0,works.from)+JSON.stringify(next)+text.slice(works.end);
    const catalog=arrayAt(text,'f=',',p=[',text.indexOf('6527:'));
    text=text.slice(0,catalog.from)+JSON.stringify(projects.map(p=>({award:p.catalogTitle,project:p.catalogDescription,date:''})))+text.slice(catalog.end);
    text=text.replace('src:e.video,muted:!0','src:e.video||void 0,muted:!0');
    text=text.replaceAll('window.open("https://www.hellohello.is"+e.href','window.open(e.href');
    text=text.replace('onClick:()=>window.open(e.href,"_blank","noopener,noreferrer")','onClick:()=>{e.href&&window.open(e.href,"_blank","noopener,noreferrer")}');
    return text;
  }
  text=text.replace(/\/_next\/image\?url=([^&"'<>\s]+)(?:(?:&amp;|&)(?:w|q)=\d+)*/g,(_,encoded)=>decodeURIComponent(encoded));
  const section=(id,transform)=>{const start=text.indexOf('<section id="'+id+'"');if(start<0)throw Error('页面区块不存在：'+id);const end=text.indexOf('</section>',start)+10;text=text.slice(0,start)+transform(text.slice(start,end))+text.slice(end);};
  const swap=(html,pairs)=>{const map=new Map(pairs.filter(([a])=>a.length).flatMap(([a,b])=>[[a,b],[a.replaceAll('&#x27;',"'"),b]]));if(!map.size)return html;const keys=[...map.keys()].sort((a,b)=>b.length-a.length);const re=new RegExp(keys.map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');return html.replace(re,v=>map.get(v));};
  section('work',part=>{
    const pairs=[];
    defaults.projects.forEach((old,i)=>{const p=projects[i];for(const k of ['title1','title2','description','cover','icon'])if(old[k])pairs.push([esc(old[k]),esc(p[k])]);if(old.video)pairs.push(['src="'+esc(old.video)+'"',p.video?'src="'+esc(p.video)+'"':'']);pairs.push([esc(old.title1+' '+old.title2),esc(p.title1+' '+p.title2)]);});
    return swap(part,pairs);
  });
  section('awards',part=>swap(part,defaults.projects.flatMap((old,i)=>['catalogTitle','catalogDescription'].map(k=>[esc(old[k]),esc(projects[i][k])]))));
  return text;
}
