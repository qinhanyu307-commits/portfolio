import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {renderFooter,FOOTER_CHUNK} from './footer.mjs';
import {validateContent} from '../site/content-schema.mjs';
import {DEFAULT_PAGES} from '../site/page-defaults.mjs';
const original=JSON.parse(await fs.readFile(new URL('../site/content/projects.json',import.meta.url),'utf8'));
const legacy=structuredClone(original);delete legacy.pages.footer;assert.deepEqual(validateContent(legacy).pages.footer,DEFAULT_PAGES.footer);
const sample=structuredClone(original);sample.pages.footer={title:'Home\n一起做 <设计> & "作品"',year:'©27',description:"Let's Talk",button:'新联系按钮',privacyLabel:'隐私说明',homeLabel:'回到首页',careersLabel:'加入我们',contactLabel:'联系我',address:'上海 <工作室>\n设计 & 创作\nContact\n第四行',copyright:'版权 ©2027 "卢科皓"'};validateContent(sample);
const raw=await fs.readFile(new URL('../site/'+FOOTER_CHUNK,import.meta.url),'utf8');
const js=renderFooter(raw,FOOTER_CHUNK,sample);new vm.Script(js);
assert.equal(renderFooter('unrelated','other.html',sample),'unrelated');
const html=renderFooter(await fs.readFile(new URL('../site/index.html',import.meta.url),'utf8'),'index.html',sample);
assert(html.includes('Home\n一起做 &lt;设计&gt; &amp; &quot;作品&quot;'));
assert(html.includes('上海 &lt;工作室&gt;'));
assert.equal((html.match(/data-footer-field="address"/g)||[]).length,4);
assert(html.includes('data-footer-link="careers">加入我们'));
assert(!html.slice(html.indexOf('<footer'),html.indexOf('</footer>')).includes('Libertad')); 
function render(mobile){
 const self={webpackChunk_N_E:[]};vm.runInNewContext(js,{self});
 const exports={},jsx=(type,props)=>({type,props});
 const modules={5155:{jsx,jsxs:jsx},2115:{useRef:()=>({current:null}),useLayoutEffect:()=>{}},63:{usePathname:()=>'/portfolio/'},7605:{Ay:{registerPlugin(){}}},5580:{u:{}},4151:{A:{}},1131:{a:()=>mobile},2746:{Y:()=>({openContact(){}})},5415:{w:()=>({navigateTo(){}})},2757:{$B:()=>mobile}};
 const require=id=>{assert(id in modules,'Unexpected footer dependency '+id);return modules[id]};require.d=(target,values)=>{for(const [key,get] of Object.entries(values))Object.defineProperty(target,key,{get})};
 self.webpackChunk_N_E[0][1][8012]({},exports,require);return exports.Footer({});
}
function flatten(node){if(!node||typeof node!=='object')return [];return [node,...[node.props?.children].flat(Infinity).flatMap(flatten)]}
for(const mobile of [false,true]){
 const nodes=flatten(render(mobile));
 for(const [key,value] of Object.entries(sample.pages.footer)){
  const matches=nodes.filter(n=>n.props?.['data-footer-field']===key);if(mobile&&key.endsWith('Label'))continue;
  assert(matches.length,key+' missing in '+(mobile?'mobile':'desktop'));
  if(key==='address')assert.deepEqual(matches.map(n=>n.props.children),value.split('\n'));
  else assert(matches.every(n=>n.props.children===value),key+' changed by another field');
 }
 if(!mobile)for(const link of ['privacy-policy','careers'])assert(nodes.find(n=>n.props?.['data-footer-link']===link));
}
for(const footer of [null,[],{}, {...sample.pages.footer,title:''},{...sample.pages.footer,year:123},{...sample.pages.footer,address:'x'.repeat(1001)}]){const bad=structuredClone(sample);bad.pages.footer=footer;assert.throws(()=>validateContent(bad));}
console.log('Footer tests passed: legacy migration, desktop/mobile rendering, multiline address/title, label collisions, special characters, stable link identities and invalid data rejection.');
