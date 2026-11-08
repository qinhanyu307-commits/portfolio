import {galleryView} from '../site/recognitions-gallery.mjs';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const html=(tag,props,...children)=>{
 const attrs=Object.entries(props||{}).filter(([key,value])=>key!=='key'&&!key.startsWith('on')&&value!==undefined&&value!==null).map(([key,value])=>' '+(key==='className'?'class':key==='tabIndex'?'tabindex':key)+'="'+esc(value)+'"').join('');
 return '<'+tag+attrs+'>'+children.flat(Infinity).filter(v=>v!==null&&v!==undefined).join('')+(['img','input'].includes(tag)?'':'</'+tag+'>');
};
// Text children must be escaped independently from markup children.
// A boxed string distinguishes rendered elements from plain user text.
const ssr=(tag,props,...children)=>new String(html(tag,props,...children.flat(Infinity).map(v=>typeof v==='string'?esc(v):v)));
export function renderRecognitions(text,rel,content){
 const data=content.pages.recognitions;
 if(rel==='_next/static/chunks/app/page-52bc2242563ce759.js'){
  const start=text.indexOf('16527:'),end=text.indexOf('7924:',start);if(start<0||end<0)throw Error('荣誉组件模板缺失。');
  const module='16527:(e,t,r)=>{"use strict";r.d(t,{Awards:()=>Awards});var n=r(5155),i=r(2115);const data='+JSON.stringify(data)+';const view='+galleryView.toString()+';function Awards(){const [selected,setSelected]=i.useState(0),[slide,setSlide]=i.useState(0);const h=(tag,props,...children)=>n.jsx(tag,{...props,...(children.length?{children:children.length===1?children[0]:children}:{})});return view(h,data,selected,slide,value=>{setSelected(value);setSlide(0)},setSlide)}},';
  return text.slice(0,start)+module+text.slice(end);
 }
 if(rel==='index.html'){
  const start=text.indexOf('<section id="recognitions"'),end=text.indexOf('</section>',start)+10;if(start<0||end<10)throw Error('荣誉页面模板缺失。');
  text=text.slice(0,start)+galleryView(ssr,data)+text.slice(end);
  text=text.replace('</head>','<link rel="stylesheet" href="/recognitions-gallery.css"></head>');
 }
 return text;
}
