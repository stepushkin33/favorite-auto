import assert from 'node:assert/strict';
import { cp, mkdir, readdir, readFile } from 'node:fs/promises';
import { extname } from 'node:path';

import { build } from 'vite';

const assets = {};
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const collectAssets = async (directory, prefix = '') => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    const publicPath = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) await collectAssets(path, publicPath);
    else
      assets[publicPath] = {
        body: (await readFile(path)).toString('base64'),
        type: contentTypes[extname(entry.name)] || 'application/octet-stream',
      };
  }
};

await collectAssets('dist');
await build({
  configFile: false,
  ssr: { target: 'webworker', noExternal: true },
  plugins: [
    {
      name: 'inline-client-assets',
      resolveId(id) {
        if (id === 'virtual:client-assets') return '\0client-assets';
      },
      load(id) {
        if (id === '\0client-assets')
          return `export default ${JSON.stringify(assets)};`;
      },
    },
  ],
  build: {
    ssr: 'server/worker.js',
    outDir: 'dist/server',
    emptyOutDir: false,
    rollupOptions: { output: { entryFileNames: 'index.js' } },
  },
});
await mkdir('dist/.openai', { recursive: true });
await cp('.openai/hosting.json', 'dist/.openai/hosting.json');

// Validate the self-contained ESM entrypoint before packaging for Sites.
const source = await readFile('dist/server/index.js', 'utf8');
const { default: worker } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
);
assert.equal(typeof worker.fetch, 'function');
const page = await worker.fetch(new Request('https://local.example/'), {});
assert.equal(page.status, 200);
assert.match(await page.text(), /<div id="root"><\/div>/);
const unconfigured = await worker.fetch(
  new Request('https://local.example/api/parts?number=01089'),
  {}
);
assert.equal(unconfigured.status, 503);
process.stdout.write(
  'Worker entrypoint, static assets and API route validated.\n'
);
