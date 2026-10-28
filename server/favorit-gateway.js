import { isValidArticle } from '../src/shared/lib/article.js';

export const DEFAULT_FAVORIT_URL = 'https://api.favorit-parts.ru/hs/hsprice/';

const json = (body, status) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

export const createFavoritGateway =
  ({
    apiKey,
    upstreamUrl = DEFAULT_FAVORIT_URL,
    fetcher = (...args) => fetch(...args),
    timeoutMs = 12000,
  } = {}) =>
  async (request) => {
    if (request.method !== 'GET') {
      const response = json({ error: 'METHOD_NOT_ALLOWED' }, 405);
      response.headers.set('Allow', 'GET');
      return response;
    }

    const parameters = new URL(request.url).searchParams;
    const number = parameters.get('number')?.trim() || '';
    const brand = parameters.get('brand')?.trim();

    if (!isValidArticle(number) || (brand && brand.length > 200))
      return json({ error: 'INVALID_SEARCH_PARAMETERS' }, 400);
    if (!apiKey?.trim()) return json({ error: 'SERVICE_NOT_CONFIGURED' }, 503);

    const controller = new AbortController();
    const abort = () => controller.abort();
    const timer = setTimeout(abort, timeoutMs);
    request.signal.addEventListener('abort', abort, { once: true });
    if (request.signal.aborted) abort();

    try {
      const url = new URL(upstreamUrl);
      if (url.protocol !== 'https:')
        return json({ error: 'INVALID_UPSTREAM_CONFIGURATION' }, 503);

      // Fixed allowlist: browser-supplied keys and arbitrary parameters are ignored.
      url.search = new URLSearchParams({
        key: apiKey.trim(),
        number,
      }).toString();
      if (brand) {
        url.searchParams.set('brand', brand);
        url.searchParams.set('analogues', 'on');
        url.searchParams.set('info', 'on');
      }

      const response = await fetcher(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
        redirect: 'error',
      });

      if (!response.ok)
        return json(
          { error: 'UPSTREAM_UNAVAILABLE' },
          [401, 403, 429].includes(response.status) ? response.status : 502
        );
      if (response.status === 204) return json({ goods: [] }, 200);

      const data = await response.json();

      // Never forward arbitrary upstream error text or echoed credentials.
      if (data && typeof data.error === 'string') {
        const knownErrors = [
          'Empty key!',
          'Invalid key client!',
          'Empty number goods!',
          'Request quota exceeded!',
        ].filter((error) => data.error.includes(error));
        return json({ error: knownErrors.join(' ') || 'UPSTREAM_ERROR' }, 200);
      }

      if (!data || !Array.isArray(data.goods))
        return json({ error: 'INVALID_UPSTREAM_RESPONSE' }, 502);
      return json({ goods: data.goods }, 200);
    } catch {
      return json(
        {
          error: controller.signal.aborted
            ? 'UPSTREAM_TIMEOUT'
            : 'UPSTREAM_UNAVAILABLE',
        },
        controller.signal.aborted ? 504 : 502
      );
    } finally {
      clearTimeout(timer);
      request.signal.removeEventListener('abort', abort);
    }
  };
