import { createFavoritGateway } from './favorit-gateway.js';

export const createNodeGateway = (options) => {
  const gateway = createFavoritGateway(options);

  return async (incoming, outgoing) => {
    const controller = new AbortController();
    const abort = () => {
      if (!outgoing.writableEnded) controller.abort();
    };
    outgoing.once('close', abort);

    try {
      const response = await gateway(
        new Request(new URL(incoming.url, 'http://localhost'), {
          method: incoming.method,
          signal: controller.signal,
        })
      );
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      outgoing.end(Buffer.from(await response.arrayBuffer()));
    } catch {
      if (!outgoing.destroyed) {
        outgoing.writeHead(500, { 'Content-Type': 'application/json' });
        outgoing.end(JSON.stringify({ error: 'GATEWAY_ERROR' }));
      }
    } finally {
      outgoing.off('close', abort);
    }
  };
};
