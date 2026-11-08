// Shared markup for the initial HTML and the interactive React component.
export function galleryView(h,data,selected=0,slide=0,select=()=>{},change=()=>{}){
 const entries=data.entries,item=entries[selected],images=item?.images||[],index=Math.min(slide,Math.max(0,images.length-1));
 return h('section',{id:'recognitions',className:'recognition-gallery','aria-label':data.title},
  h('h2',{className:'recognition-heading'},data.title),
  h('div',{className:'recognition-grid'},
   h('div',{className:'recognition-preview'},
    h('div',{className:'recognition-frame',tabIndex:0,role:'region','aria-label':'作品图片预览',onKeyDown:e=>{if(images.length>1&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();change((index+(e.key==='ArrowRight'?1:-1)+images.length)%images.length);}}},
     images.length?h('img',{className:'recognition-image',src:images[index],alt:(item.award||'作品')+' · '+(index+1),decoding:'async'}):h('p',{className:'recognition-empty'},item?'此目录暂无图片':'暂无作品'),
     images.length>1?h('div',{className:'recognition-controls'},
      h('button',{type:'button','aria-label':'上一张图片',onClick:()=>change((index-1+images.length)%images.length)},'←'),
      h('span',{'aria-live':'polite'},(index+1)+' / '+images.length),
      h('button',{type:'button','aria-label':'下一张图片',onClick:()=>change((index+1)%images.length)},'→')):null),
    images.length>1?h('div',{className:'recognition-thumbs','aria-label':'选择预览图片'},...images.map((src,i)=>h('button',{key:src+'-'+i,type:'button','aria-label':'查看第 '+(i+1)+' 张图片','aria-pressed':i===index,onClick:()=>change(i)},h('img',{src,alt:'',loading:'lazy'})))):null),
   h('div',{className:'recognition-directory','aria-label':'作品目录'},
    ...entries.map((row,i)=>h('button',{key:row.id,type:'button',className:'recognition-row','aria-pressed':i===selected,onClick:()=>select(i)},
     h('span',{className:'recognition-award'},row.award),h('span',{className:'recognition-project'},row.project),h('span',{className:'recognition-date'},row.date))),
    entries.length?null:h('p',{className:'recognition-empty'},'暂无目录'))));
}
