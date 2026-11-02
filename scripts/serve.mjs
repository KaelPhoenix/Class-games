import http from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.mp3':'audio/mpeg','.wav':'audio/wav','.ico':'image/x-icon'};
function inside(root, file) {
  const relative = path.relative(root, file);
  return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative));
}
export async function createAppServer(directory) {
  const root = await realpath(directory);
  return http.createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'no-store');
    if (!['GET','HEAD'].includes(request.method)) {
      response.setHeader('Allow','GET, HEAD');
      response.writeHead(405); response.end('Method not allowed'); return;
    }
    try {
      const pathname = decodeURIComponent((request.url || '/').split('?')[0]);
      if (!pathname.startsWith('/') || pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').some(part => part === '..' || part.startsWith('.'))) {
        response.writeHead(403); response.end('Forbidden'); return;
      }
      const target = path.resolve(root, '.' + pathname, ...(pathname.endsWith('/') ? ['index.html'] : []));
      if (!inside(root, target)) { response.writeHead(403); response.end('Forbidden'); return; }
      const resolved = await realpath(target);
      if (!inside(root, resolved)) { response.writeHead(403); response.end('Forbidden'); return; }
      const info = await stat(resolved);
      if (!info.isFile()) { response.writeHead(404); response.end('Not found'); return; }
      const body = await readFile(resolved);
      response.writeHead(200, {'Content-Type': mime[path.extname(resolved).toLowerCase()] || 'application/octet-stream', 'Content-Length': body.length});
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch (error) {
      const status = error instanceof URIError ? 400 : ['ENOENT','ENOTDIR'].includes(error.code) ? 404 : 500;
      response.writeHead(status); response.end(status === 500 ? 'Internal error' : 'Not found');
    }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const repo = fileURLToPath(new URL('../', import.meta.url));
  const config = JSON.parse(await readFile(path.join(repo, 'app.config.json'), 'utf8'));
  const port = Number(process.env.PORT || 4173);
  const host = process.env.HOST || '127.0.0.1';
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid PORT');
  const server = await createAppServer(path.resolve(repo, process.argv[2] || config.root));
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, host, () => console.log('Local: http://' + (host.includes(':') ? '['+host+']' : host) + ':' + server.address().port));
  for (const signal of ['SIGINT','SIGTERM']) process.once(signal, () => server.close());
}
