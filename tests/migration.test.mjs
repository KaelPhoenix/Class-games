import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

for (const grade of ['grade8','grade9']) {
 const html=fs.readFileSync(new URL('../'+grade+'/index.html',import.meta.url),'utf8');
 test(grade+': all inline game scripts parse',()=>{
  const scripts=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m=>!m[1].includes('application/json'));
  assert(scripts.length>0);
  for(const m of scripts)new vm.Script(m[2],{filename:grade});
 });
 test(grade+': self-contained document and synthetic storage',()=>{
  assert(html.includes('</html>'));
  assert(html.includes('name="demo-data"'));
  assert(!/<script[^>]+src=/i.test(html));
  assert(!/localStorage\.(?:getItem|setItem)\(['"]star-orbit-grade/.test(html));
 });
 test(grade+': default rosters contain only synthetic identities',()=>{
  let groups;
  if(grade==='grade8'){
   const classes=JSON.parse(html.match(/const CLASSES = ([^\n]+);/)[1]);
   groups=Object.values(classes).map(c=>{
    assert(c.storageKey.startsWith('demo-'));
    assert.equal(new Set(c.roster.map(s=>s.id)).size,c.roster.length);
    assert(c.roster.every(s=>s.id.startsWith('demo-')));
    assert.deepEqual(c.names,c.roster.map(s=>s.name));
    return c.names;
   });
  } else {
   groups=['students','class2Students','class3Students'].map(n=>{
    const match=html.match(new RegExp('const '+n+'\\s*=\\s*(\\[[\\s\\S]*?\\]);'));
    assert(match);return JSON.parse(match[1]);
   });
  }
  for(const names of groups){
   assert(names.length>0);
   assert.equal(new Set(names).size,names.length);
   assert(names.every(n=>/^DEMO G[89]-C[1-6]-\d+$/.test(n)));
  }
 });
}
