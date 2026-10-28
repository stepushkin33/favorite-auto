import { afterEach, describe, expect, it, vi } from 'vitest';

import { demoPartsApi } from './demo-parts-api';
import { createPartsApi } from './parts-api';

const good = {
  goodsID: 'good-1',
  brand: 'VAG',
  name: 'Фильтр',
  number: '06J',
  count: 3,
  price: 99999,
  warehouses: [{ id: 'warehouse-1', code: 'МС2', price: 1200, stock: 3 }],
};

describe('HTTP client', () => {
  afterEach(() => vi.useRealTimers());

  it('requests only the part number during manufacturer search', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ goods: [good] })));
    await createPartsApi({ fetcher }).getBrands('01089');
    expect(
      Object.fromEntries(new URL(fetcher.mock.calls[0][0]).searchParams)
    ).toEqual({ number: '01089' });
  });

  it('sends article and selected brand as separately encoded parameters', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ goods: [good] })));
    const api = createPartsApi({
      endpoint: 'https://parts.example/api/parts',
      fetcher,
    });

    await api.getOffers('A&B / Q', 'MANN & FILTER');

    const url = new URL(fetcher.mock.calls[0][0]);
    expect(url.pathname).toBe('/api/parts');
    expect(url.searchParams.get('number')).toBe('A&B / Q');
    expect(url.searchParams.get('brand')).toBe('MANN & FILTER');
    expect(url.searchParams.get('analogues')).toBe('on');
    expect(url.searchParams.get('info')).toBe('on');
    expect(url.searchParams.has('key')).toBe(false);
  });

  it('treats HTTP 204 as an empty list', async () => {
    const api = createPartsApi({
      fetcher: vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    });
    await expect(api.getBrands('123')).resolves.toEqual([]);
  });

  it.each([
    [401, 'настройка доступа'],
    [403, 'настройка доступа'],
    [429, 'Слишком много запросов'],
    [500, 'временно недоступен'],
  ])(
    'handles HTTP %i without exposing response internals',
    async (status, message) => {
      const api = createPartsApi({
        fetcher: vi
          .fn()
          .mockResolvedValue(new Response('internal details', { status })),
      });
      await expect(api.getBrands('123')).rejects.toThrow(message);
    }
  );

  it('reports a network failure', async () => {
    const api = createPartsApi({
      fetcher: vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    });
    await expect(api.getBrands('123')).rejects.toThrow('Проверьте интернет');
  });

  it('rejects invalid JSON', async () => {
    const api = createPartsApi({
      fetcher: vi
        .fn()
        .mockResolvedValue(new Response('<html>upstream failure</html>')),
    });
    await expect(api.getBrands('123')).rejects.toThrow('некорректные данные');
  });

  const hangingFetch = (_url, { signal }) =>
    new Promise((_resolve, reject) => {
      if (signal.aborted) reject(new DOMException('Aborted', 'AbortError'));
      else
        signal.addEventListener(
          'abort',
          () => reject(new DOMException('Aborted', 'AbortError')),
          { once: true }
        );
    });

  it('cancels the underlying fetch when the caller cancels', async () => {
    const controller = new AbortController();
    const api = createPartsApi({ fetcher: hangingFetch });
    const request = api.getBrands('123', { signal: controller.signal });
    controller.abort();
    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('aborts a slow request and returns a timeout message', async () => {
    vi.useFakeTimers();
    const api = createPartsApi({ fetcher: hangingFetch, timeoutMs: 100 });
    const request = expect(api.getBrands('123')).rejects.toThrow(
      'долго не отвечает'
    );
    await vi.advanceTimersByTimeAsync(100);
    await request;
  });

  it('never returns demo results for an unknown article', async () => {
    vi.useFakeTimers();
    const request = demoPartsApi.getBrands('unknown');
    await vi.advanceTimersByTimeAsync(550);
    await expect(request).resolves.toEqual([]);
  });
});
