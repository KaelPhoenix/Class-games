import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createAppServer } from '../scripts/serve.mjs';
const config = JSON.parse(await readFile(new URL('../app.config.json', import.meta.url), 'utf8'));
const root = fileURLToPath(new URL('../' + config.root + '/', import.meta.url));
async function fixture(t) {
  const server = await createAppServer(root);
  await new Promise((resolve,reject) => { server.once('error',reject); server.listen(0,'127.0.0.1',resolve); });
  t.after(() => new Promise((resolve,reject) => server.close(error => error ? reject(error) : resolve())));
  return 'http://127.0.0.1:' + server.address().port;
}
test('HTTP entry loads real application and every linked local asset', async t => {
  const base = await fixture(t), response = await fetch(base + '/');
  assert.equal(response.status,200);
  assert.match(response.headers.get('content-type'),/^text\/html/);
  assert.equal(response.headers.get('x-content-type-options'),'nosniff');
  const html = await response.text();
  assert.equal(html, await readFile(new URL('../' + config.root + '/index.html',import.meta.url),'utf8'));
  for (const match of html.matchAll(/(?:src|href)=["'](assets\/[^"']+)["']/g)) {
    const asset = await fetch(base + '/' + match[1]);
    assert.equal(asset.status,200,match[1]);
    assert((await asset.arrayBuffer()).byteLength > 0,match[1]);
  }
});
test('HEAD reports the HTML length without returning a body', async t => {
  const base = await fixture(t), response = await fetch(base + '/', {method:'HEAD'});
  assert.equal(response.status,200);
  assert(Number(response.headers.get('content-length')) > 100);
  assert.equal(await response.text(),'');
});
test('missing routes and encoded traversal cannot expose repository files', async t => {
  const base = await fixture(t);
  assert.equal((await fetch(base+'/missing-page')).status,404);
  for (const route of ['/%2e%2e%2fpackage.json','/.env','/%5c..%5cpackage.json']) {
    assert.equal((await fetch(base+route)).status,403,route);
  }
});
test('the preview server rejects writes', async t => {
  const base = await fixture(t), response = await fetch(base+'/',{method:'POST',body:'synthetic-test'});
  assert.equal(response.status,405);
  assert.equal(response.headers.get('allow'),'GET, HEAD');
});
