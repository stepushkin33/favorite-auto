import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

import { createNodeGateway } from './node-gateway.js';

const root = await realpath(resolve('dist'));
const gateway = createNodeGateway({
  apiKey: process.env.FAVORIT_API_KEY,
  upstreamUrl: process.env.FAVORIT_API_URL,
});
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === '/api/parts') return gateway(request, response);
  if (
    !['/', '/index.html', '/favicon.svg'].includes(url.pathname) &&
    !url.pathname.startsWith('/assets/')
  ) {
    response.writeHead(404);
    return response.end();
  }
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    return response.end();
  }

  try {
    const path = await realpath(
      resolve(
        root,
        `.${decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)}`
      )
    );
    if (!path.startsWith(`${root}${sep}`) || !(await stat(path)).isFile()) {
      response.writeHead(404);
      return response.end();
    }

    response.writeHead(200, {
      'Content-Type': contentTypes[extname(path)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': url.pathname.startsWith('/assets/')
        ? 'public, max-age=31536000, immutable'
        : 'no-cache',
    });
    if (request.method === 'HEAD') return response.end();
    const stream = createReadStream(path);
    stream.on('error', () => response.destroy());
    stream.pipe(response);
  } catch {
    response.writeHead(404);
    response.end();
  }
});

server.listen(Number(process.env.PORT || 3000), '127.0.0.1', () => {
  process.stdout.write(
    `Приложение: http://127.0.0.1:${server.address().port}\n`
  );
});
