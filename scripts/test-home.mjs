import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {renderHome} from './home.mjs';
import {validateContent} from '../site/content-schema.mjs';
import {DEFAULT_PAGES} from '../site/page-defaults.mjs';

const root=new URL('../site/',import.meta.url);
const original=JSON.parse(await fs.readFile(new URL('content/projects.json',root),'utf8'));
const legacy=structuredClone(original);delete legacy.pages.home;
assert.deepEqual(validateContent(legacy).pages.home,DEFAULT_PAGES.home);
const sample=structuredClone(original);
sample.pages.home={name:'陆可豪 < & "设计师"',label:'Design',copyright:'©2027',categoryLeft:'Technology',categoryMiddle:'交互 & 产品',categoryRight:'Portfolio',greetings:'你好\n设计 <\nHello 世界\n探索🚀',intro:'从 "想法" & <创意> 出发',introMuted:'一起创造。'};
validateContent(sample);
const rel='_next/static/chunks/app/page-52bc2242563ce759.js';
const raw=await fs.readFile(new URL(rel,root),'utf8');
const js=renderHome(raw,rel,sample);new vm.Script(js);
const lines=JSON.parse(js.match(/S=(\[[^;]*?\]),j=/)[1]);
assert.deepEqual(lines,sample.pages.home.greetings.split('\n'));
assert(js.includes('let E='+JSON.stringify(sample.pages.home.intro)));
assert(js.includes('children:[E," ",'+JSON.stringify(sample.pages.home.introMuted)+']'));
assert(js.includes('suppressHydrationWarning:!0,children:"Design"'));
assert(js.includes('gridColumn:"1 / 2"},children:"Technology"'));
assert(js.includes('gridColumn:"12 / 13",textAlign:"right"},children:"Portfolio"'));
assert(js.includes('children:"©2027"'));
const html=renderHome(await fs.readFile(new URL('index.html',root),'utf8'),'index.html',sample);
const hero=html.slice(html.indexOf('<section data-section="hero"'),html.indexOf('</section>',html.indexOf('<section data-section="hero"')));
assert(hero.includes('从 &quot;想法&quot; &amp; &lt;创意&gt; 出发<!-- --> <!-- -->一起创造。'));
const chars=[...hero.matchAll(/class="hero-char"[^>]*>([^<]*)<\/span>/g)].map(m=>m[1]);
assert.equal(chars.join(''),'你好设计\u00a0&lt;Hello\u00a0世界探索🚀');
assert.equal(hero.match(/class="hero-char"/g).length,Array.from(sample.pages.home.greetings.replaceAll('\n','')).length);
assert(!hero.includes('Every project by Lu Kehao'));
const svg=renderHome(await fs.readFile(new URL('assets/logos/logo.svg',root),'utf8'),'assets/logos/logo.svg',sample);
assert(svg.includes('陆可豪 &lt; &amp; &quot;设计师&quot;'));
for(const bad of [null,{}, {...sample.pages.home,greetings:'只有一行'}, {...sample.pages.home,intro:17}, {...sample.pages.home,name:''}]){
 const value=structuredClone(sample);value.pages.home=bad;assert.throws(()=>validateContent(value));
}
console.log('Home tests passed: legacy migration, four animated title lines, Unicode/HTML escaping, label collisions, SSR/client parity and validation.');
