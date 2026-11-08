import {DEFAULT_PAGES} from './page-defaults.mjs';
export const IDS = ['aiid','passkeys','grateful','alchemy'];
export function validateContent(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.projects) || value.projects.length !== 4) throw Error('作品数据格式不正确，需要保留四个作品。');
  const limit=(v,n,label,required=true)=>{if(typeof v!=='string'||v.length>n||(required&&!v.trim()))throw Error(label+'内容为空或超出长度限制。');};
  const media=(v,label,optional=false)=>{limit(v,500,label,!optional);if(v&&!/^\/assets\/[a-zA-Z0-9_./-]+$/.test(v))throw Error(label+'必须使用已上传的站内文件。');if(v.split('/').includes('..'))throw Error('文件路径无效。');};
  value.projects.forEach((p,i)=>{
    if(p.id!==IDS[i])throw Error('作品顺序或标识无效。');
    for(const [field,max] of [['title1',80],['title2',80],['description',2500],['catalogTitle',160],['catalogDescription',600]])limit(p[field],max,field,field!=='title2');
    media(p.cover,'封面');media(p.icon,'图标');media(p.video,'视频',true);
    limit(p.href,1000,'作品链接',false);
    if(p.linkTarget!==undefined&&!['_self','_blank'].includes(p.linkTarget))throw Error('作品打开方式无效。');
    if(p.href){let u;try{u=new URL(p.href)}catch{throw Error('作品链接必须是完整的 https 地址。')}if(u.protocol!=='https:')throw Error('作品链接必须以 https:// 开头。');}
  });
  if(!value.pages)value.pages=structuredClone(DEFAULT_PAGES);
  if(value.pages.home===undefined)value.pages.home=structuredClone(DEFAULT_PAGES.home);
  if(value.pages.footer===undefined)value.pages.footer=structuredClone(DEFAULT_PAGES.footer);
  const {footer,home,about,catalog,recognitions}=value.pages;
  if(!footer||typeof footer!=='object'||Array.isArray(footer))throw Error('尾页管理数据不完整。');
  for(const [key,max] of [['title',240],['year',24],['description',1000],['button',80],['privacyLabel',80],['homeLabel',80],['careersLabel',80],['contactLabel',80],['address',1000],['copyright',300]])limit(footer[key],max,'尾页 '+key,!['year','description','address','copyright'].includes(key));
  if(!home||typeof home!=='object'||Array.isArray(home))throw Error('首页管理数据不完整。');
  for(const [key,max] of [['name',80],['label',80],['copyright',40],['categoryLeft',80],['categoryMiddle',80],['categoryRight',80],['greetings',240],['intro',1000],['introMuted',500]])limit(home[key],max,'首页 '+key,key==='name'||key==='greetings'||key==='intro');
  if(home.greetings.split('\n').length!==4||home.greetings.split('\n').some(line=>!line.trim()||line.length>60))throw Error('首页大标题需要四行，每行 1–60 个字符。');
  if(!about?.resume||!catalog||!recognitions)throw Error('页面管理数据不完整。');
  if(about.layout===undefined)about.layout='reference';
  if(!['reference','resume'].includes(about.layout))throw Error('自我介绍页面样式无效。');
  for(const key of ['bodyLeft','bodyRight']){if(about[key]===undefined)about[key]=DEFAULT_PAGES.about[key];limit(about[key],2000,'自我介绍正文',false);}
  limit(about.titleMuted,200,'自我介绍浅色标题',false);limit(about.title,350,'自我介绍标题');
  if(!Array.isArray(about.photos)||about.photos.length!==3)throw Error('自我介绍需要三张图片。');about.photos.forEach(v=>media(v,'自我介绍图片'));
  for(const k of Object.keys(DEFAULT_PAGES.about.resume))limit(about.resume[k],4000,'履历 '+k,false);
  if(catalog.entries===undefined)catalog.entries=[];
  if(!Array.isArray(catalog.entries)||catalog.entries.length>100)throw Error('最多可新增 100 个目录条目。');
  const catalogIds=new Set();
  for(const entry of catalog.entries){
    if(!entry||typeof entry!=='object')throw Error('目录条目格式不正确。');
    limit(entry.id,80,'目录标识');limit(entry.title,160,'目录标题');limit(entry.description,600,'目录说明',false);
    if(catalogIds.has(entry.id))throw Error('目录标识不能重复。');catalogIds.add(entry.id);
  }
  for(const k of ['title','heading','categories'])limit(catalog[k],500,'目录 '+k,k!=='categories');
  if(catalog.categories.split('\n').length!==3||catalog.categories.split('\n').some(v=>!v.trim()))throw Error('目录分类需要填写三项，每项一行。');
  for(const k of ['title','number','subtitle','summary','memberText'])limit(recognitions[k],2000,'荣誉 '+k,k==='title');
  if(!/^\d{1,2}\+?$/.test(recognitions.number))throw Error('荣誉数字请输入 0–99，可以在末尾加 +。');
  if(recognitions.summary.split('\n').length!==7||recognitions.summary.split('\n').some(v=>!v.trim()))throw Error('荣誉统计说明需要填写七项，每项一行。');
  media(recognitions.logo,'荣誉页标志');
  if(!Array.isArray(recognitions.entries)||recognitions.entries.length!==DEFAULT_PAGES.recognitions.entries.length)throw Error('荣誉条目数量无效。');
  for(const row of recognitions.entries){limit(row.award,300,'荣誉名称');limit(row.project,300,'荣誉项目',false);limit(row.date,100,'荣誉时间',false);media(row.image,'荣誉配图');}
  return value;
}
