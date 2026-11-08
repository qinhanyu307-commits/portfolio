import {DEFAULT_PAGES} from '../site/page-defaults.mjs';

const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');
const replace=(text,from,to)=>{
  if(!text.includes(from))throw Error('首页文字模板缺失：'+from.slice(0,80));
  return text.replace(from,to);
};
const char=letter=>'<span style="display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:0.55em;margin-bottom:-0.55em;margin-left:-1px;margin-right:-4px"><span class="hero-char" style="display:inline-block;color:#fafafa;padding-left:1px;padding-right:4px;will-change:transform;transform:translateY(200%)">'+esc(letter===' '?'\u00a0':letter)+'</span></span>';

export function renderHome(text,rel,content){
  const h=content.pages?.home||DEFAULT_PAGES.home,d=DEFAULT_PAGES.home;
  const portrait={className:'home-portrait',src:'/assets/images/entry-portrait.png',alt:h.name+' portrait',width:1254,height:1254,decoding:'async',fetchPriority:'low'};
  // Keep the existing image dimensions and font at the default name. Longer
  // names get enough SVG canvas space rather than being clipped by the image.
  if(rel==='assets/logos/logo.svg'){
    const width=h.name===d.name?146:Math.max(146,Array.from(h.name).reduce((sum,c)=>sum+(/[^\u0000-\u00ff]/.test(c)?30:22),0));
    return `<svg width="${width}" height="32" viewBox="0 0 ${width} 32" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(h.name)}"><text x="0" y="26" fill="#FAFAFA" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" letter-spacing="-1.3">${esc(h.name)}</text></svg>\n`;
  }
  if(rel==='_next/static/chunks/app/page-52bc2242563ce759.js'){
    text=replace(text,'S=["Hello","Bonjour","Hola","Ol\\xe1"]','S='+JSON.stringify(h.greetings.split('\n')));
    text=replace(text,'let E='+JSON.stringify(d.intro),'let E='+JSON.stringify(h.intro));
    text=replace(text,'children:[E," ","something cool."]','children:[E," ",'+JSON.stringify(h.introMuted)+']');
    const intro='children:[E," ",'+JSON.stringify(h.introMuted)+']})';
    text=replace(text,intro,intro+',(0,n.jsx)("img",'+JSON.stringify(portrait)+')');
    const labels=new Map([[d.label,h.label],[d.categoryLeft,h.categoryLeft],[d.categoryMiddle,h.categoryMiddle],[d.categoryRight,h.categoryRight]]);
    text=text.replace(/children:("Portfolio"|"Design"|"UI\/UX"|"Technology")/g,(_,label)=>'children:'+JSON.stringify(labels.get(JSON.parse(label))));
    text=text.replaceAll('children:"\\xa92026"','children:'+JSON.stringify(h.copyright));
    text=text.replaceAll('alt:"Lu Kehao"','alt:'+JSON.stringify(h.name));
    text=replace(text,'children:e.split("").map','children:Array.from(e).map');
    text=replace(text,'transform:"translateY(200%)"},children:e','transform:"translateY(200%)"},children:e===" "?"\\u00a0":e');
    return text;
  }
  if(rel!=='index.html')return text;
  const start=text.indexOf('<section data-section="hero"'),end=text.indexOf('</section>',start)+10;
  if(start<0||end<10)throw Error('首页首屏模板缺失。');
  let hero=text.slice(start,end);
  // Isolate the header and categories so editing labels cannot affect links
  // or collide with another field's original text.
  const labels=new Map([[d.label,h.label],['©2026',h.copyright],[d.categoryLeft,h.categoryLeft],[d.categoryMiddle,h.categoryMiddle],[d.categoryRight,h.categoryRight]]);
  hero=hero.replace(/(<span\b[^>]*>)(Portfolio|©2026|Design|UI\/UX|Technology)(<\/span>)/g,(_,a,label,b)=>a+esc(labels.get(label))+b);
  hero=hero.replaceAll('alt="Lu Kehao"','alt="'+esc(h.name)+'"');
  const first=hero.indexOf('<div style="display:flex;align-items:flex-end"><span'),last=hero.indexOf('</div></div><div style="position:absolute;top:calc(29.5vw',first);
  if(first<0||last<0)throw Error('首页四行标题模板缺失。');
  hero=hero.slice(0,first)+h.greetings.split('\n').map(line=>'<div style="display:flex;align-items:flex-end">'+Array.from(line).map(char).join('')+'</div>').join('')+hero.slice(last+6);
  hero=replace(hero,esc(d.intro)+'<!-- --> <!-- -->'+esc(d.introMuted),esc(h.intro)+'<!-- --> <!-- -->'+esc(h.introMuted));
  const introHtml=esc(h.intro)+'<!-- --> <!-- -->'+esc(h.introMuted)+'</div>';
  hero=replace(hero,introHtml,introHtml+'<img class="home-portrait" src="'+portrait.src+'" alt="'+esc(portrait.alt)+'" width="1254" height="1254" decoding="async" fetchpriority="low">');
  return text.slice(0,start)+hero+text.slice(end);
}
