import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {loadContent,renderContent} from './content.mjs';
import {renderPages} from './pages.mjs';
import {renderHome} from './home.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.join(root,'site'),output=path.join(root,'docs');
const content=await loadContent(source);
const defaults=JSON.parse(await fs.readFile(path.join(source,'content/defaults.json'),'utf8'));
const base=(process.env.BASE_PATH||'/portfolio').replace(/\/$/,'');
const rootFiles=(await fs.readdir(source)).filter(f=>/\.(?:css|js|json|ico|png)$/.test(f));
const files=[];
async function walk(dir,rel=''){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const name=path.posix.join(rel,entry.name);if(entry.isDirectory())await walk(path.join(dir,entry.name),name);else files.push(name)}}
await walk(source);await fs.mkdir(output,{recursive:true});
const fingerprint=createHash('sha256');
for(const rel of [...files].sort())if(/\.(?:html|css|js|mjs|json)$/.test(rel))fingerprint.update(rel).update(await fs.readFile(path.join(source,rel)));
for(const script of ['build.mjs','content.mjs','pages.mjs','home.mjs'])fingerprint.update(await fs.readFile(path.join(root,'scripts',script)));
const revision=fingerprint.digest('hex').slice(0,12);
function transform(text,rel){
  text=renderContent(text,rel,content,defaults);
  text=renderPages(text,rel,content);
  text=renderHome(text,rel,content);
  if(rel.endsWith('.html')||rel.endsWith('.js'))text=text.replace(/(?<![A-Za-z0-9_])\/assets\/logos\/logo\.svg/g,'/assets/logos/logo.svg?v='+revision);
  if(rel.endsWith('.js')){
    text=text.replaceAll('unoptimized:!1','unoptimized:!0');
    text=text.replace('t.GoogleAnalytics=function(e){','t.GoogleAnalytics=function(e){return null;');
    text=text.replaceAll('fetch("/api/now-playing")','fetch("'+base+'/now-playing.json")');
    const start=text.indexOf('let en=async e=>{');
    const end=start<0?-1:text.indexOf(';return(0,i.jsxs)(i.Fragment',start);
    if(start>=0&&end>=0&&text.slice(start,end).includes('api.hsforms.com')){
      text=text.slice(0,start)+`let en=async e=>{const subject="Portfolio inquiry — "+e.name;const body=["Name: "+e.name,"Email: "+e.email,"Company: "+(e.company||""),"Role: "+(e.role||""),"Service: "+(e.service||""),"",e.message||""].join("\\n");window.location.href="mailto:1810438404@qq.com?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);O("success")}`+text.slice(end);
    }
    text=text.replaceAll('Thanks for reaching out — someone from our team will get back to you soon.','Your email app will open with this message. Please send it there to contact Lu Kehao.');
    text=text.replaceAll('pushState(null,"","/contact")','pushState(null,"","'+base+'/contact")');
  }
  text=text.replace(/\/_next\/image\?url=([^&"'<>\s]+)(?:(?:&amp;|&)(?:w|q)=\d+)*/g,(_,encoded)=>decodeURIComponent(encoded));
  if(!rel.startsWith('content/')&&!rel.startsWith('admin/')&&!rel.endsWith('.mjs')) text=text.replace(/(?<![A-Za-z0-9_])\/assets\//g,base+'/assets/').replace(/(?<![A-Za-z0-9_])\/_next\//g,base+'/_next/');
  for(const file of [...rootFiles,'site.webmanifest'])text=text.replaceAll('/'+file,base+'/'+file);
  text=text.replaceAll('++hellohello — Design & Technology Agency','Lu Kehao — Portfolio').replaceAll('++hellohello — Design &amp; Technology Agency','Lu Kehao — Portfolio');
  text=text.replace(/\+\+hellohello[^\"\n<>]{0,30}Technology Agency/g,'Lu Kehao — Portfolio');
  if(rel.endsWith('.mjs'))text=text.replace(/(from\s*['"])(\.[^'"]+\.mjs)(['"])/g,(_,a,b,c)=>a+b+'?v='+revision+c);
  if(rel.endsWith('.html'))text=text.replace(/((?:src|href)=")([^"\s]+\.(?:js|mjs|css)(?:\?[^"\s]*)?)(")/g,(_,a,url,c)=>url.startsWith('http')?a+url+c:a+url+(url.includes('?')?'&amp;':'?')+'v='+revision+c);
  if(rel==='index.html'){
    text=text.replace(/\s+(?:srcset|sizes)="[^"]*"/gi,'');
    text=text.replace(/<link\b[^>]*href="https:\/\/www\.googletagmanager\.com[^>]*>/gi,'');
    text=text.replace(/<link rel="canonical"[^>]*>/,'<link rel="canonical" href="https://qinhanyu307-commits.github.io/portfolio/">');
    text=text.replace('</head>','<script src="'+base+'/deployment.js"></script></head>');
  }
  return text;
}
for(const rel of files){const src=path.join(source,rel),dest=path.join(output,rel);await fs.mkdir(path.dirname(dest),{recursive:true});if(/\.(?:html|css|js|mjs|json|svg)$/.test(rel))await fs.writeFile(dest,transform(await fs.readFile(src,'utf8'),rel));else await fs.copyFile(src,dest)}
await fs.writeFile(path.join(output,'.nojekyll'),'');
await fs.writeFile(path.join(output,'now-playing.json'),'null\n');
await fs.writeFile(path.join(output,'site.webmanifest'),JSON.stringify({name:'Lu Kehao Portfolio',short_name:'Lu Kehao',start_url:base+'/',display:'browser',background_color:'#ffffff',theme_color:'#ffffff'}));
await fs.writeFile(path.join(output,'deployment.js'),`(()=>{document.addEventListener('click',event=>{const button=event.target.closest('button');const label=event.target.closest('a,span,div')?.textContent.trim();if(button?.getAttribute('aria-label')?.includes('Go to homepage')){event.preventDefault();event.stopImmediatePropagation();if(window.__lenis)window.__lenis.scrollTo(0,{duration:1});else window.scrollTo({top:0,behavior:'smooth'});}if(label==='Privacy Policy'||label==='Careers'){event.preventDefault();event.stopImmediatePropagation();window.open('https://www.hellohello.is/'+(label==='Careers'?'careers':'privacy-policy'),'_blank','noopener,noreferrer');}},true);})();`);
await fs.copyFile(path.join(output,'index.html'),path.join(output,'404.html'));
console.log(JSON.stringify({files:files.length,basePath:base,output}));
