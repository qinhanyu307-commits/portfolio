import {validateContent} from '../content-schema.mjs';
import {createPagesEditor,writePath} from './pages-editor.mjs';
const REPO='qinhanyu307-commits/portfolio',BRANCH='main',FILE='site/content/projects.json';
const root=new URL('../',location.href);
const $=s=>document.querySelector(s);
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
let content,baseline,index=0,token='',fileSha='',dirty=false,busy=false,connected=false,poll;
let mode='projects';
const uploads=new Map();
const pagesEditor=createPagesEditor({getContent:()=>content,media,onChange:()=>{markDirty();status('目录已修改，保存并发布后会更新到网站。');}});
const status=(message,error=false)=>{ $('#status').textContent=message;$('#status').classList.toggle('error',error); };
function markDirty(){dirty=true;$('#save-state').textContent='有未发布修改';syncButtons();}
function syncButtons(){ $('#publish').disabled=busy||!connected||!dirty;$('#publish').textContent=busy?'正在保存…':connected?'保存并发布':'连接后发布';$('#connect').disabled=busy;$('#reset').disabled=busy||!dirty;$('#logout').disabled=busy; }
function media(path){const staged=uploads.get(path);return staged?staged.url:new URL(path.replace(/^\//,''),root).href;}
function drawNav(){ if(mode!=='projects'){pagesEditor.nav();return;} $('#projects').innerHTML=content.projects.map((p,i)=>`<button data-index="${i}" class="${i===index?'active':''}" aria-current="${i===index?'true':'false'}"><small>PROJECT 0${i+1}</small><b>${esc(p.catalogTitle)}</b></button>`).join(''); }
function field(key,label,rows=0,hint=''){const value=content.projects[index][key];return `<label for="${key}">${label}</label>${rows?`<textarea id="${key}" data-field="${key}" rows="${rows}">${esc(value)}</textarea>`:`<input id="${key}" data-field="${key}" value="${esc(value)}">`}${hint?`<p class="hint">${hint}</p>`:''}`;}
function drawEditor(){ if(mode!=='projects'){pagesEditor.render(mode);return;}const p=content.projects[index];$('#editor').innerHTML=`<h3>编辑作品 0${index+1}</h3><p class="hint">先选择左侧作品，再编辑对应内容。</p><div class="section-heading">目录中的内容</div>${field('catalogTitle','目录标题（回车换行）',2)}${field('catalogDescription','目录右侧说明',3)}<div class="section-heading">作品展示页</div><div class="two-fields"><div>${field('title1','标题 · 第一行')}</div><div>${field('title2','标题 · 第二行')}</div></div>${field('description','作品介绍',6)}${field('href','点击作品后的跳转链接',0,'填写完整 https:// 地址；留空则关闭跳转。')}<div class="section-heading">图片与悬停内容</div><label for="cover-upload">封面图片</label><div class="upload-row"><input id="cover-upload" data-upload="cover" type="file" accept="image/jpeg,image/png,image/webp"></div><p class="hint">支持 JPG、PNG、WebP；自动优化尺寸，建议使用横向大图。</p><button id="restore-cover" type="button">恢复当前线上封面</button><label for="icon-upload">作品图标</label><div class="upload-row"><img id="icon-thumb" src="${esc(media(p.icon))}" alt="当前作品图标"><input id="icon-upload" data-upload="icon" type="file" accept="image/jpeg,image/png,image/webp"></div><label class="checkbox"><input id="disable-video" type="checkbox" ${p.video?'':'checked'}><span>关闭原来的悬停视频，只展示封面图片</span></label>`;drawNav();drawPreview();}
function drawPreview(){ if(mode!=='projects'){pagesEditor.preview();return;}const p=content.projects[index];$('#preview').innerHTML=`<img src="${esc(media(p.cover))}" alt="封面预览"><img class="preview-icon" src="${esc(media(p.icon))}" alt="作品图标"><h3>${esc(p.title1+'\n'+p.title2)}</h3><p>${esc(p.description)}</p><div class="catalog-preview"><b>${esc(p.catalogTitle)}</b><p>${esc(p.catalogDescription)}</p></div>`;}
async function api(endpoint,options={}){
  const response=await fetch('https://api.github.com'+endpoint,{...options,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',Authorization:'Bearer '+token,...(options.body?{'Content-Type':'application/json'}:{}),...options.headers}});
  const data=await response.json().catch(()=>({}));
  if(!response.ok){if(response.status===401)throw Error('令牌无效或已过期，请重新连接。');if(response.status===403)throw Error('没有写入权限或请求受限，请确认令牌只选择 port，并允许 Contents: Read and write。');if(response.status===409||response.status===422)throw Error('仓库在保存时发生变化，请先备份修改文字，再重新连接以载入最新内容。');throw Error('GitHub 请求失败（'+response.status+'）：'+(data.message||'请稍后重试。'));}return data;
}
const repoApi=(endpoint,options)=>api('/repos/'+REPO+endpoint,options);
const post=(endpoint,data)=>repoApi(endpoint,{method:'POST',body:JSON.stringify(data)});
function decode64(value){return new TextDecoder().decode(Uint8Array.from(atob(value.replace(/\s/g,'')),c=>c.charCodeAt(0)));}
function clearUploads(){for(const image of uploads.values())URL.revokeObjectURL(image.url);uploads.clear();}
async function connect(){
  const typed=$('#token').value.trim();$('#token').value='';if(!typed){status('请先输入 GitHub 访问令牌。',true);return;}
  busy=true;syncButtons();token=typed;status('正在验证 GitHub 仓库授权…');
  try{
    const repo=await repoApi('');if(!repo.permissions?.push)throw Error('这个 GitHub 账号没有 port 仓库的写入权限。');
    const file=await repoApi('/contents/'+FILE+'?ref='+BRANCH+'&t='+Date.now());const remote=validateContent(JSON.parse(decode64(file.content)));
    if(dirty&&JSON.stringify({projects:remote.projects,pages:remote.pages})!==JSON.stringify({projects:baseline.projects,pages:baseline.pages}))throw Error('线上内容已经变化。请先备份未发布文字，点击撤销修改后重新连接。');
    fileSha=file.sha;baseline=structuredClone(remote);if(!dirty)content=structuredClone(remote);connected=true;$('#connect-panel').hidden=true;$('#logout').hidden=false;$('#connection').textContent='已连接 · '+repo.owner.login;$('#connection').classList.add('connected');drawEditor();status('连接成功。修改后点击“保存并发布”。');
  }catch(error){token='';connected=false;status(error.message,true);}finally{busy=false;syncButtons();}
}
async function optimize(file,kind){
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('请选择 JPG、PNG 或 WebP 图片。');
  if(file.size>20*1024*1024)throw Error('图片超过 20MB，请先缩小后再上传。');
  const bitmap=await createImageBitmap(file);const scale=Math.min(1,(kind==='icon'?256:2560)/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.9));if(!blob)throw Error('图片处理失败，请换一张图片重试。');
  const base64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=reject;reader.readAsDataURL(blob);});
  return {base64,url:URL.createObjectURL(blob)};
}
async function upload(input){
 const file=input.files[0];if(!file)return;busy=true;syncButtons();document.body.classList.add('busy');
 const target=index,kind=input.dataset.upload||'page',imagePath=input.dataset.imagePath;
 status('正在优化图片…');
 try{
  const result=await optimize(file,kind);const label=imagePath?imagePath.replaceAll('.','-'):content.projects[target].id+'-'+kind;
  const name='/assets/uploads/'+label+'-'+crypto.randomUUID()+'.webp';uploads.set(name,result);
  if(imagePath)writePath(content,imagePath,name);else{content.projects[target][kind]=name;if(kind==='cover')content.projects[target].video='';}
  markDirty();drawEditor();status('图片已替换，保存并发布后会更新到网站。');
 }catch(error){status(error.message,true);}finally{busy=false;document.body.classList.remove('busy');syncButtons();}
}
async function publish(){
  if(!connected||busy||!dirty)return;
  try{validateContent(content);}catch(error){status(error.message,true);return;}
  busy=true;document.body.classList.add('busy');syncButtons();status('正在保存作品和图片到 GitHub…');
  try{
    const ref=await repoApi('/git/ref/heads/'+BRANCH);
    const current=await repoApi('/contents/'+FILE+'?ref='+ref.object.sha);if(current.sha!==fileSha)throw Error('线上作品已经被更新，已停止保存以避免覆盖。请备份修改，再撤销未发布修改并重新连接载入最新内容。');
    const head=await repoApi('/git/commits/'+ref.object.sha);
    const tree=[];
    for(const [file,image] of uploads){if(!JSON.stringify(content).includes(JSON.stringify(file)))continue;const blob=await post('/git/blobs',{content:image.base64,encoding:'base64'});tree.push({path:'site'+file,mode:'100644',type:'blob',sha:blob.sha});}
    const next=structuredClone(content);next.updatedAt=new Date().toISOString();
    const jsonBlob=await post('/git/blobs',{content:JSON.stringify(next,null,2)+'\n',encoding:'utf-8'});tree.push({path:FILE,mode:'100644',type:'blob',sha:jsonBlob.sha});
    const newTree=await post('/git/trees',{base_tree:head.tree.sha,tree});const commit=await post('/git/commits',{message:'Update portfolio works from admin',tree:newTree.sha,parents:[ref.object.sha]});
    await repoApi('/git/refs/heads/'+BRANCH,{method:'PATCH',body:JSON.stringify({sha:commit.sha,force:false})});
    fileSha=jsonBlob.sha;content=next;baseline=structuredClone(next);dirty=false;$('#save-state').textContent='已保存 · 正在发布';status('已保存到 GitHub，网站正在自动发布。你可以继续编辑。');watchDeployment(next.updatedAt);
  }catch(error){status(error.message,true);}finally{busy=false;document.body.classList.remove('busy');syncButtons();}
}
function watchDeployment(version){clearInterval(poll);let tries=0;poll=setInterval(async()=>{try{const res=await fetch(new URL('content/projects.json?t='+Date.now(),root),{cache:'no-store'});const live=await res.json();if(live.updatedAt===version){clearInterval(poll);$('#save-state').textContent=dirty?'有未发布修改':'已发布到网站';status('发布完成。打开网站即可查看新内容。');}else if(++tries>=40){clearInterval(poll);status('修改已保存，发布仍在等待。可通过下方“查看发布进度”查看结果。');}}catch{if(++tries>=40)clearInterval(poll);}},8000);}
$('#token-link').href='https://github.com/settings/personal-access-tokens/new?name=Lu%20Kehao%20Portfolio&description=Update%20portfolio%20content&target_name=qinhanyu307-commits&contents=write';
$('#connect').addEventListener('click',connect);$('#token').addEventListener('keydown',e=>{if(e.key==='Enter')connect();});
$('#publish').addEventListener('click',publish);
$('#logout').addEventListener('click',()=>{token='';connected=false;fileSha='';$('#connect-panel').hidden=false;$('#logout').hidden=true;$('#connection').textContent='未连接';$('#connection').classList.remove('connected');status('已断开连接，令牌已清除。');syncButtons();});
$('#projects').addEventListener('click',e=>{const b=e.target.closest('[data-index]');if(b&&!busy){index=Number(b.dataset.index);drawEditor();}});
$('#editor').addEventListener('input',e=>{if(e.target.dataset.field){content.projects[index][e.target.dataset.field]=e.target.value;markDirty();drawNav();drawPreview();}});
$('#editor').addEventListener('change',e=>{if(e.target.dataset.upload||e.target.dataset.imagePath)upload(e.target);if(e.target.id==='disable-video'){content.projects[index].video=e.target.checked?'':baseline.projects[index].video;markDirty();}});
$('#editor').addEventListener('click',e=>{if(e.target.id==='restore-cover'){content.projects[index].cover=baseline.projects[index].cover;content.projects[index].video=baseline.projects[index].video;markDirty();drawEditor();}});
$('#reset').addEventListener('click',()=>{if(dirty&&confirm('撤销所有未发布的文字和图片修改？')){content=structuredClone(baseline);clearUploads();dirty=false;$('#save-state').textContent='已载入线上内容';drawEditor();syncButtons();status('已撤销未发布修改。');}});
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
try{const res=await fetch(new URL('content/projects.json?t='+Date.now(),root),{cache:'no-store'});if(!res.ok)throw Error('无法载入作品内容。');content=validateContent(await res.json());baseline=structuredClone(content);drawEditor();syncButtons();}catch(error){status(error.message,true);}

$('#sections').addEventListener('click',e=>{const tab=e.target.closest('[data-mode]');if(!tab||busy||!content)return;mode=tab.dataset.mode;$('#sections').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===tab));if(mode==='projects')drawEditor();else pagesEditor.reset(mode);});
$('#projects').addEventListener('click',e=>{const item=e.target.closest('[data-page-tab]');if(item&&!busy)pagesEditor.select(item.dataset.pageTab);});
$('#editor').addEventListener('input',e=>{if(e.target.dataset.pageField){writePath(content,e.target.dataset.pageField,e.target.value);markDirty();pagesEditor.nav();pagesEditor.preview();}});

$('#projects').addEventListener('click',e=>{if(e.target.closest('[data-catalog-add]')&&!busy&&content)pagesEditor.addCatalog();});
$('#editor').addEventListener('click',e=>{if(e.target.closest('[data-catalog-remove]')&&!busy&&content)pagesEditor.removeCatalog();});
