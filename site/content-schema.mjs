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
    if(p.href){let u;try{u=new URL(p.href)}catch{throw Error('作品链接必须是完整的 https 地址。')}if(u.protocol!=='https:')throw Error('作品链接必须以 https:// 开头。');}
  });
  if(!value.pages)value.pages=structuredClone(DEFAULT_PAGES);
  const {about,catalog,recognitions}=value.pages;
  if(!about?.resume||!catalog||!recognitions)throw Error('页面管理数据不完整。');
  limit(about.titleMuted,200,'自我介绍浅色标题',false);limit(about.title,350,'自我介绍标题');
  if(!Array.isArray(about.photos)||about.photos.length!==3)throw Error('自我介绍需要三张图片。');about.photos.forEach(v=>media(v,'自我介绍图片'));
  for(const k of Object.keys(DEFAULT_PAGES.about.resume))limit(about.resume[k],4000,'履历 '+k,false);
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
