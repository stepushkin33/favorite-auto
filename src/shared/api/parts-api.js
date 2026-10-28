import { normalizeArticle } from '../lib/article';
import { demoCatalog } from './demo-data';

const env = import.meta.env;

export const isDemoMode = (env.VITE_API_MODE || 'demo') === 'demo';

export class ApiError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const invalidResponse = () => {
  throw new ApiError('Сервис вернул некорректные данные. Попробуйте позже.');
};

const isText = (value) => typeof value === 'string' && value.trim().length > 0;
const isAmount = (value) =>
  value === null ||
  (typeof value === 'number' && Number.isFinite(value) && value >= 0);

// This is the application's gateway contract, not an assumed vendor format.
// Adapt these two boundary functions once the provider documentation is available.
export const parseBrands = (data) => {
  if (!Array.isArray(data)) return invalidResponse();

  const ids = new Set();

  return data.map((brand) => {
    if (
      !brand ||
      !isText(brand.id) ||
      !isText(brand.name) ||
      ids.has(brand.id)
    ) {
      return invalidResponse();
    }

    ids.add(brand.id);

    return {
      id: brand.id,
      name: brand.name,
      description: isText(brand.description) ? brand.description : '',
      country: isText(brand.country) ? brand.country : '',
    };
  });
};

export const parseOffers = (data) => {
  if (!Array.isArray(data)) return invalidResponse();

  const ids = new Set();

  return data.map((offer) => {
    if (
      !offer ||
      !isText(offer.id) ||
      !isText(offer.name) ||
      !isText(offer.brand) ||
      !isAmount(offer.price) ||
      !isAmount(offer.stock) ||
      (offer.stock !== null && !Number.isInteger(offer.stock)) ||
      ids.has(offer.id)
    ) {
      return invalidResponse();
    }

    ids.add(offer.id);

    return {
      id: offer.id,
      name: offer.name,
      brand: offer.brand,
      article: isText(offer.article) ? offer.article : '',
      price: offer.price,
      stock: offer.stock,
      kind: ['original', 'analog'].includes(offer.kind) ? offer.kind : null,
    };
  });
};

export const createPartsApi = ({
  baseUrl = env.VITE_API_BASE_URL || '/api',
  brandsPath = env.VITE_API_BRANDS_PATH || '/brands',
  offersPath = env.VITE_API_OFFERS_PATH || '/offers',
  fetcher = (...args) => fetch(...args),
  timeoutMs = 15000,
} = {}) => {
  const request = async (path, parameters, signal) => {
    const controller = new AbortController();
    let timedOut = false;
    const abort = () => controller.abort();
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) controller.abort();

    try {
      const url = new URL(
        `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`,
        globalThis.location?.origin || 'http://localhost'
      );

      url.search = new URLSearchParams(parameters).toString();

      const response = await fetcher(url.toString(), {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      if (!response.ok) {
        const message =
          response.status === 429
            ? 'Слишком много запросов. Подождите немного и повторите поиск.'
            : response.status === 401 || response.status === 403
              ? 'Сервис временно недоступен: требуется настройка доступа.'
              : 'Сервис поиска временно недоступен. Попробуйте ещё раз.';

        throw new ApiError(message, response.status);
      }

      if (response.status === 204) return [];

      try {
        return await response.json();
      } catch (error) {
        if (controller.signal.aborted) throw error;

        return invalidResponse();
      }
    } catch (error) {
      if (timedOut) {
        throw new ApiError('Сервис долго не отвечает. Повторите поиск.');
      }

      if (controller.signal.aborted || error instanceof ApiError) throw error;

      throw new ApiError(
        'Не удалось подключиться. Проверьте интернет и повторите поиск.'
      );
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', abort);
    }
  };

  return {
    async getBrands(article, { signal } = {}) {
      return parseBrands(await request(brandsPath, { article }, signal));
    },
    async getOffers(article, brand, { signal } = {}) {
      return parseOffers(await request(offersPath, { article, brand }, signal));
    },
  };
};

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
    const selected = entry?.brands.find((item) => item.name === brand);

    if (!selected) return [];

    return entry.offers.map((offer) => ({
      ...offer,
      kind: offer.brand === brand ? 'original' : 'analog',
    }));
  },
};

export const partsApi = isDemoMode ? demoPartsApi : createPartsApi();
