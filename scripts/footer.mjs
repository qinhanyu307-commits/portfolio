import {DEFAULT_PAGES} from '../site/page-defaults.mjs';

export const FOOTER_CHUNK='_next/static/chunks/8012-6146b67d6167a5a9.js';
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');
const linkFor=key=>key==='privacyLabel'?'privacy-policy':key==='careersLabel'?'careers':null;
export function renderFooter(text,rel,content){
  const footer=content.pages?.footer||DEFAULT_PAGES.footer;
  if(rel==='index.html'){
    const start=text.indexOf('<footer'),end=text.indexOf('</footer>',start)+9;
    if(start<0||end<9)throw Error('尾页模板缺失。');
    let part=text.slice(start,end);
    const address=DEFAULT_PAGES.footer.address.split('\n').map(line=>'<p style="margin:0;line-height:1.5">'+esc(line)+'</p>').join('');
    if(!part.includes(address))throw Error('尾页地址模板缺失。');
    part=part.replace(address,'__PORTFOLIO_FOOTER_ADDRESS__');
    const fields=new Map(Object.entries(DEFAULT_PAGES.footer).filter(([key])=>key!=='address').flatMap(([key,value])=>[[value,key],[esc(value),key]]));
    part=part.replace(/(<(?:div|p|span)\b[^>]*>)([^<]*)(<\/(?:div|p|span)>)/g,(all,open,value,close)=>{
      const key=fields.get(value);if(!key)return all;
      const link=linkFor(key);
      return open.slice(0,-1)+' data-footer-field="'+key+'"'+(link?' data-footer-link="'+link+'"':'')+'>'+esc(footer[key])+close;
    });
    part=part.replace('__PORTFOLIO_FOOTER_ADDRESS__',footer.address.split('\n').map(line=>'<p style="margin:0;line-height:1.5" data-footer-field="address">'+esc(line)+'</p>').join(''));
    return text.slice(0,start)+part+text.slice(end);
  }
  if(rel!==FOOTER_CHUNK)return text;
  // The footer is rendered by React. Replace its text at build time so its
  // existing SplitText entrance and button hover animations use the new copy.
  const address='children:[(0,i.jsx)("p",{style:{margin:0,lineHeight:1.5},children:"Libertad 2529"}),(0,i.jsx)("p",{style:{margin:0,lineHeight:1.5},children:"Office 102"}),(0,i.jsx)("p",{style:{margin:0,lineHeight:1.5},children:"Montevideo, Uruguay"})]';
  if(text.split(address).length!==3)throw Error('尾页地址模板缺失。');
  text=text.replaceAll(address,'children:__PORTFOLIO_FOOTER_ADDRESS__');
  const fields=new Map(Object.entries(DEFAULT_PAGES.footer).filter(([key])=>key!=='address').map(([key,value])=>[JSON.stringify(value).replaceAll('©','\\xa9'),key]));
  text=text.replace(/children:("(?:\\.|[^"\\])*")/g,(original,literal)=>{
    const key=fields.get(literal);if(!key)return original;
    const link=linkFor(key);
    return '"data-footer-field":'+JSON.stringify(key)+(link?',"data-footer-link":'+JSON.stringify(link):'')+',children:'+JSON.stringify(footer[key]);
  });
  const rows=footer.address.split('\n').map(line=>'(0,i.jsx)("p",{style:{margin:0,lineHeight:1.5},"data-footer-field":"address",children:'+JSON.stringify(line)+'})');
  return text.replaceAll('__PORTFOLIO_FOOTER_ADDRESS__','['+rows.join(',')+']');
}
