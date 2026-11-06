import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const docs=path.join(root,'docs');
const failures=[];
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)])}
for(const file of walk(docs).filter(f=>/\.(?:js|mjs)$/.test(f))){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0)failures.push(path.relative(root,file)+': '+r.stderr)}
const html=fs.readFileSync(path.join(docs,'index.html'),'utf8');
for(const match of html.matchAll(/(?:src|href)="(\/port\/[^"?#]+)(?:\?[^"#]*)?"/g)){const rel=match[1].slice('/portfolio/'.length);if(!fs.existsSync(path.join(docs,rel)))failures.push('Missing resource: '+rel)}
const layout=fs.readFileSync(path.join(docs,'_next/static/chunks/app/layout-6d0f10cc5e82d4d4.js'),'utf8');
if(layout.includes('api.hsforms.com')||layout.includes('api.ipify.org'))failures.push('Original form service remains');
if(!layout.includes('mailto:1810438404@qq.com'))failures.push('Public contact email missing');
if(!html.includes('Lu Kehao — Portfolio'))failures.push('Portfolio title missing');
if(failures.length){console.error(failures.join('\n'));process.exitCode=1}else console.log('Checks passed: JavaScript syntax, static resource paths, personal title and contact handler.');
