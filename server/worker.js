import assets from 'virtual:client-assets';

import { createFavoritGateway } from './favorit-gateway.js';

// Sites supplies the secret at runtime. It is never included in the asset map.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/parts') {
      return createFavoritGateway({
        apiKey: env.FAVORIT_API_KEY,
        upstreamUrl: env.FAVORIT_API_URL,
      })(request);
    }

    if (!['GET', 'HEAD'].includes(request.method))
      return new Response(null, {
        status: 405,
        headers: { Allow: 'GET, HEAD' },
      });

    const asset = assets[url.pathname === '/' ? '/index.html' : url.pathname];
    if (!asset) return new Response('Not found', { status: 404 });

    const bytes =
      request.method === 'HEAD'
        ? null
        : Uint8Array.from(atob(asset.body), (character) =>
            character.charCodeAt(0)
          );

    return new Response(bytes, {
      headers: {
        'Content-Type': asset.type,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': url.pathname.startsWith('/assets/')
          ? 'public, max-age=31536000, immutable'
          : 'no-cache',
      },
    });
  },
};
