import fs from 'node:fs/promises';import assert from 'node:assert/strict';import vm from 'node:vm';
import {galleryView} from '../site/recognitions-gallery.mjs';
import {validateContent} from '../site/content-schema.mjs';import {renderRecognitions} from './recognitions.mjs';
const root=new URL('../site/',import.meta.url),original=JSON.parse(await fs.readFile(new URL('content/projects.json',root),'utf8'));
// Migration needs a deliberately old-format fixture. Published content may
// already contain multiple images, reordered entries, or an empty directory.
const legacy=structuredClone(original);
legacy.pages.recognitions.entries=[{award:'旧格式测试目录',project:'',date:'',image:'/assets/images/awards/awards-img-1.jpg'}];
const migrated=validateContent(legacy);
assert.deepEqual(migrated.pages.recognitions.entries[0].images,['/assets/images/awards/awards-img-1.jpg']);
assert(migrated.pages.recognitions.entries[0].id);
const sample=structuredClone(migrated);sample.pages.recognitions.entries=[{id:'test-one',award:'第一行\n第二行 < & "',project:'项目\n说明',date:'2026\n11月',images:['/assets/images/awards/awards-img-1.jpg','/assets/images/awards/awards-img-2.jpg']},{id:'test-two',award:'第二目录',project:'',date:'',images:[]}];validateContent(sample);
// Existing galleries must retain every image and their saved order.
const modern=structuredClone(sample),expectedImages=structuredClone(modern.pages.recognitions.entries[0].images);
assert.deepEqual(validateContent(modern).pages.recognitions.entries[0].images,expectedImages);
assert.equal(modern.pages.recognitions.entries[0].image,expectedImages[0]);
const html=renderRecognitions(await fs.readFile(new URL('index.html',root),'utf8'),'index.html',sample);const galleryHtml=html.slice(html.indexOf('<section id="recognitions"'),html.indexOf('</section>',html.indexOf('<section id="recognitions"')));assert(html.includes('第一行\n第二行 &lt; &amp; &quot;'));assert(html.includes('项目\n说明'));assert(!galleryHtml.includes('>1 / 2<'));assert(galleryHtml.includes('recognition-chevron-left'));assert(galleryHtml.includes('recognition-chevron-right'));assert(!html.slice(html.indexOf('<section id="recognitions"'),html.indexOf('</section>',html.indexOf('<section id="recognitions"'))).includes('SoDA'));
const rel='_next/static/chunks/app/page-52bc2242563ce759.js';const js=renderRecognitions(await fs.readFile(new URL(rel,root),'utf8'),rel,sample);new vm.Script(js);assert(js.includes(JSON.stringify(sample.pages.recognitions.entries)));assert(js.includes('setSlide(0)'));
const empty=structuredClone(sample);empty.pages.recognitions.entries=[];validateContent(empty);assert(renderRecognitions(await fs.readFile(new URL('index.html',root),'utf8'),'index.html',empty).includes('暂无目录'));
for(const change of [v=>v.pages.recognitions.entries.push({...v.pages.recognitions.entries[0]}),v=>v.pages.recognitions.entries[0].images=['/assets/../bad.png'],v=>v.pages.recognitions.entries[0].images=Array(21).fill('/assets/test.jpg'),v=>v.pages.recognitions.entries=Array(101).fill(v.pages.recognitions.entries[0])]){const bad=structuredClone(sample);change(bad);assert.throws(()=>validateContent(bad));}
console.log('Recognition gallery tests passed: legacy image migration, add/delete counts, multiple images, empty states, multiline and escaping, client syntax and upload validation.');

// Galleries omit thumbnails while retaining arrow controls.
const viewData=structuredClone(sample.pages.recognitions);viewData.entries.push({id:'single-image',award:'单图',project:'',date:'',images:['/assets/images/awards/awards-img-3.jpg']});
const h=(tag,props,...children)=>({tag,props,children});
const flatten=node=>node&&typeof node==='object'?[node,...node.children.flat(Infinity).flatMap(flatten)]:[];
const single=flatten(galleryView(h,viewData,2));
assert.equal(single.filter(n=>n.props?.className==='recognition-thumbs').length,0);
assert.equal(single.filter(n=>n.props?.['aria-label']==='上一张图片'||n.props?.['aria-label']==='下一张图片').filter(n=>n.props.disabled).length,2);
const multi=flatten(galleryView(h,viewData,0));assert.equal(multi.filter(n=>n.props?.['aria-label']==='下一张图片')[0].props.disabled,false);
console.log('Single-image controls passed: thumbnails removed, arrows visible and disabled; multi-image arrows remain enabled.');

// An ordered gallery can mix images and videos without discarding legacy media.
const mixed=structuredClone(sample);
mixed.pages.recognitions.entries[0].images=['/assets/clips/one.mp4','/assets/test.webp','/assets/clips/two.webm'];
validateContent(mixed);assert.equal(mixed.pages.recognitions.entries[0].images.length,3);
const mixedHtml=renderRecognitions(await fs.readFile(new URL('index.html',root),'utf8'),'index.html',mixed);
const mixedSection=mixedHtml.slice(mixedHtml.indexOf('<section id="recognitions"'),mixedHtml.indexOf('</section>',mixedHtml.indexOf('<section id="recognitions"')));
assert(mixedSection.includes('class="recognition-video" src="/assets/clips/one.mp4" controls="true" muted="true" loop="true" playsinline="true"'));
assert(!mixedSection.includes('controls="false"'));
assert(!mixedSection.includes('<img class="recognition-image" src="/assets/clips/'));
assert.equal((mixedSection.match(/recognition-video-badge/g)||[]).length,0);
for(const path of ['/assets/bad.html','/assets/video.mov','/assets/video.mp4?download=1']){const bad=structuredClone(mixed);bad.pages.recognitions.entries[0].images=[path];assert.throws(()=>validateContent(bad));}
const {galleryFileKind}=await import('../site/admin/gallery-upload.mjs');
assert.equal(galleryFileKind({name:'clip.MP4',type:'video/mp4',size:1024}),'mp4');
assert.equal(galleryFileKind({name:'clip.webm',type:'',size:1024}),'webm');
assert.equal(galleryFileKind({name:'photo.png',type:'image/png',size:1024}),'image');
for(const file of [{name:'clip.mp4',type:'video/mp4',size:51*1024*1024},{name:'clip.mp4',type:'video/mp4',size:0},{name:'clip.mp4',type:'text/html',size:1024},{name:'clip.mov',type:'video/quicktime',size:1024}])assert.throws(()=>galleryFileKind(file));
console.log('Mixed gallery passed: ordered image/video data, SSR controls, no thumbnails, supported formats and upload limits.');
