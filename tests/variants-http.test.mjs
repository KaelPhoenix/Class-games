import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createAppServer} from '../scripts/serve.mjs';
for(const grade of ['grade8','grade9'])test(grade+': standalone HTTP entry loads the synthetic game',async t=>{
 const server=await createAppServer(fileURLToPath(new URL('../'+grade+'/',import.meta.url)));
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
 t.after(()=>new Promise(resolve=>server.close(resolve)));
 const response=await fetch('http://127.0.0.1:'+server.address().port+'/');
 assert.equal(response.status,200);
 const html=await response.text();assert.match(html,/name="demo-data"/);assert.match(html,/<\/html>/i);
});
