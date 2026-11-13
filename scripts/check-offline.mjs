// Regression checks for offline routes and app-resource coverage.
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const handlers={};let cached=[];
const fakeResponse={ok:true,clone(){return this;}};
const shell={addAll:async urls=>{cached=urls;},match:async key=>/\/(find-model|cli)\.html$/.test(String(key))?fakeResponse:undefined,put:async()=>{}};
const context={URL,console,caches:{open:async()=>shell,keys:async()=>[],match:async()=>undefined},fetch:async()=>{throw new Error('offline');},self:{location:{origin:'https://example.test'},clients:{claim:async()=>{}},skipWaiting:async()=>{},addEventListener:(type,fn)=>handlers[type]=fn}};
vm.runInNewContext(source,context);let install;handlers.install({waitUntil:p=>install=p});await install;
for(const resource of ['data/models.json','data/clis.json','data/stacks.json','data/ai-projects.json'])assert(cached.includes(resource),resource);
for(const page of ['find-model','cli']){let result;handlers.fetch({request:{method:'GET',url:`https://example.test/CLI_CODE/${page}.html?changed=value`,mode:'navigate'},respondWith:p=>result=p,waitUntil(){}});assert.equal(await result,fakeResponse,'query shell fallback '+page);}
for(const path of ['find-model.js','modeldata.js','registry.js'])assert(cached.some(x=>x.startsWith('assets/js/'+path+'?v=')),path);
assert(source.includes('if (res.ok)'),'do not cache errors');
console.log('check-offline: query routes and required cached resources passed');
