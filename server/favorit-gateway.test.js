import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFavoritGateway } from './favorit-gateway';

const request = (query = 'number=01089', options) =>
  new Request(`http://localhost/api/parts?${query}`, options);
const response = () => new Response(JSON.stringify({ goods: [] }));

describe('server-side Favorit gateway', () => {
  afterEach(() => vi.useRealTimers());

  it('adds the server key and sends only the part number during stage one', async () => {
    const fetcher = vi.fn().mockResolvedValue(response());
    const gateway = createFavoritGateway({ apiKey: 'server-key', fetcher });
    expect(
      (
        await gateway(
          request(
            'number=A%26B&key=browser-key&analogues=on&url=https://untrusted.example'
          )
        )
      ).status
    ).toBe(200);
    const url = fetcher.mock.calls[0][0];
    expect(url.origin).toBe('https://api.favorit-parts.ru');
    expect(url.pathname).toBe('/hs/hsprice/');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      key: 'server-key',
      number: 'A&B',
    });
    expect(fetcher.mock.calls[0][1].redirect).toBe('error');
  });

  it('adds the selected brand, analogues=on and info=on during stage two', async () => {
    const fetcher = vi.fn().mockResolvedValue(response());
    await createFavoritGateway({ apiKey: 'server-key', fetcher })(
      request('number=01089&brand=MANN%20%26%20FILTER')
    );
    expect(Object.fromEntries(fetcher.mock.calls[0][0].searchParams)).toEqual({
      key: 'server-key',
      number: '01089',
      brand: 'MANN & FILTER',
      analogues: 'on',
      info: 'on',
    });
  });

  it('does not contact the provider when not configured', async () => {
    const fetcher = vi.fn();
    const result = await createFavoritGateway({ fetcher })(request());
    expect(result.status).toBe(503);
    expect(fetcher).not.toHaveBeenCalled();
    expect(result.headers.get('Cache-Control')).toBe('no-store');
  });

  it('rejects a short number and unsupported methods before contacting the provider', async () => {
    const fetcher = vi.fn();
    const gateway = createFavoritGateway({ apiKey: 'key', fetcher });
    expect((await gateway(request('number=ab'))).status).toBe(400);
    expect(
      (await gateway(request('number=01089', { method: 'POST' }))).status
    ).toBe(405);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('refuses to send the key over unencrypted HTTP', async () => {
    const fetcher = vi.fn();
    const gateway = createFavoritGateway({
      apiKey: 'key',
      upstreamUrl: 'http://api.favorit-parts.ru/hs/hsprice/',
      fetcher,
    });
    expect((await gateway(request())).status).toBe(503);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each([401, 403, 429, 500])(
    'handles upstream HTTP %i without forwarding its body',
    async (status) => {
      const gateway = createFavoritGateway({
        apiKey: 'server-key',
        fetcher: vi
          .fn()
          .mockResolvedValue(
            new Response('server-key private details', { status })
          ),
      });
      const result = await gateway(request());
      expect(result.status).toBe(status === 500 ? 502 : status);
      expect(await result.text()).not.toContain('server-key');
    }
  );

  it('sanitizes unexpected provider error text while preserving known error codes', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'server-key secret details' }))
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Invalid key client!' }))
      );
    const gateway = createFavoritGateway({ apiKey: 'server-key', fetcher });
    expect(await (await gateway(request())).json()).toEqual({
      error: 'UPSTREAM_ERROR',
    });
    expect(await (await gateway(request())).json()).toEqual({
      error: 'Invalid key client!',
    });
  });

  it('handles invalid JSON and network failures', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response('<html>error</html>'))
      .mockRejectedValueOnce(new Error('network down'));
    const gateway = createFavoritGateway({ apiKey: 'key', fetcher });
    expect((await gateway(request())).status).toBe(502);
    expect((await gateway(request())).status).toBe(502);
  });

  it('aborts slow upstream requests', async () => {
    vi.useFakeTimers();
    const fetcher = (_url, { signal }) =>
      new Promise((_resolve, reject) =>
        signal.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError'))
        )
      );
    const pending = createFavoritGateway({
      apiKey: 'key',
      fetcher,
      timeoutMs: 100,
    })(request());
    await vi.advanceTimersByTimeAsync(100);
    expect((await pending).status).toBe(504);
  });
});
