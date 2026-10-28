import { normalizeArticle } from '../lib/article';
import { demoCatalog } from './demo-data';

const waitForDemo = (signal) =>
  new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      reject(new DOMException('Запрос отменён', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve();
    }, 550);

    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
  });

export const demoPartsApi = {
  async getBrands(article, { signal } = {}) {
    await waitForDemo(signal);
    return demoCatalog[normalizeArticle(article)]?.brands || [];
  },
  async getOffers(article, brand, { signal } = {}) {
    await waitForDemo(signal);
    const entry = demoCatalog[normalizeArticle(article)];
    if (!entry?.brands.some((item) => item.name === brand)) return [];
    return entry.offers.map((offer) => ({
      ...offer,
      kind: offer.brand === brand ? 'original' : 'analog',
    }));
  },
};
