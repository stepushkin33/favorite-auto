import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createPartsApi,
  demoPartsApi,
  parseBrands,
  parseOffers,
} from './parts-api';

const brand = { id: 'vag', name: 'VAG' };
const offer = {
  id: 'one',
  name: 'Масляный фильтр',
  brand: 'VAG',
  price: 0,
  stock: 0,
};

describe('API response boundary', () => {
  it('accepts an empty response without inventing data', () => {
    expect(parseBrands([])).toEqual([]);
    expect(parseOffers([])).toEqual([]);
  });

  it('preserves zero prices, zero stock and unknown values', () => {
    expect(parseOffers([offer])[0]).toMatchObject({ price: 0, stock: 0 });
    expect(
      parseOffers([{ ...offer, price: null, stock: null }])[0]
    ).toMatchObject({ price: null, stock: null });
  });

  it.each([{}, null, { brands: [brand] }, [null], [brand, brand]])(
    'rejects an invalid brands payload: %j',
    (payload) => {
      expect(() => parseBrands(payload)).toThrow('некорректные данные');
    }
  );

  it.each([
    { price: -1 },
    { price: '100' },
    { price: Infinity },
    { stock: 1.5 },
    { stock: undefined },
    { brand: '' },
  ])('rejects an invalid offer: %j', (override) => {
    expect(() => parseOffers([{ ...offer, ...override }])).toThrow(
      'некорректные данные'
    );
  });

  it('rejects duplicate offer ids and preserves unclassified offers', () => {
    expect(() => parseOffers([offer, offer])).toThrow();
    expect(parseOffers([offer])[0].kind).toBeNull();
  });
});

describe('HTTP client', () => {
  afterEach(() => vi.useRealTimers());

  it('sends article and selected brand as separately encoded parameters', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify([offer])));
    const api = createPartsApi({
      baseUrl: 'https://parts.example/api/',
      fetcher,
    });

    await api.getOffers('A&B / Q', 'MANN & FILTER');

    const url = new URL(fetcher.mock.calls[0][0]);
    expect(url.pathname).toBe('/api/offers');
    expect(url.searchParams.get('article')).toBe('A&B / Q');
    expect(url.searchParams.get('brand')).toBe('MANN & FILTER');
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
