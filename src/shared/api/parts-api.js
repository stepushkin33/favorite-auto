import { ApiError, invalidResponse } from './api-error';
import { demoPartsApi } from './demo-parts-api';
import { parseBrands, parseOffers } from './favorit-response';

export const isDemoMode = import.meta.env.VITE_API_MODE === 'demo';

export const createPartsApi = ({
  endpoint = import.meta.env.VITE_API_URL || '/api/parts',
  fetcher = (...args) => fetch(...args),
  timeoutMs = 15000,
} = {}) => {
  const request = async (parameters, signal) => {
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
        endpoint,
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

      if (response.status === 204) return { goods: [] };

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
      return parseBrands(await request({ number: article }, signal));
    },
    async getOffers(article, brand, { signal } = {}) {
      return parseOffers(
        await request(
          { number: article, brand, analogues: 'on', info: 'on' },
          signal
        )
      );
    },
  };
};

export const partsApi = isDemoMode ? demoPartsApi : createPartsApi();
