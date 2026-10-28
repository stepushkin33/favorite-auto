import { describe, expect, it, vi } from 'vitest';

import { createAppStore } from '../../../app/store';
import {
  articleChanged,
  brandSelected,
  fetchBrands,
  fetchOffers,
  filterChanged,
  selectVisibleOffers,
} from './search-slice';

const brands = [
  { id: 'vag', name: 'VAG' },
  { id: 'mann', name: 'MANN' },
];
const offers = [
  { id: '1', brand: 'VAG', price: 500, stock: 0, kind: 'original' },
  { id: '2', brand: 'MANN', price: 100, stock: 12, kind: 'analog' },
  { id: '3', brand: 'BOSCH', price: null, stock: null, kind: 'analog' },
];

const makeStore = (overrides = {}) =>
  createAppStore({
    api: {
      getBrands: vi.fn().mockResolvedValue(brands),
      getOffers: vi.fn().mockResolvedValue(offers),
      ...overrides,
    },
  });

describe('search lifecycle', () => {
  it('keeps both stages separate and passes the selected brand to API', async () => {
    const getOffers = vi.fn().mockResolvedValue(offers);
    const store = makeStore({ getOffers });
    await store.dispatch(fetchBrands(' ABC '));
    expect(getOffers).not.toHaveBeenCalled();

    store.dispatch(brandSelected('vag'));
    await store.dispatch(fetchOffers({ article: ' ABC ', brand: 'VAG' }));
    expect(getOffers).toHaveBeenCalledWith(
      'ABC',
      'VAG',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    expect(store.getState().search.offers.status).toBe('success');
  });

  it('does not request brands for a short article', async () => {
    const getBrands = vi.fn();
    const store = makeStore({ getBrands });
    await store.dispatch(fetchBrands(' A '));
    expect(getBrands).not.toHaveBeenCalled();
  });

  it('clears both stages and filters when the article changes', async () => {
    const store = makeStore();
    await store.dispatch(fetchBrands('ABC'));
    store.dispatch(brandSelected('vag'));
    await store.dispatch(fetchOffers({ article: 'ABC', brand: 'VAG' }));
    store.dispatch(filterChanged({ inStock: true }));
    store.dispatch(articleChanged('NEW'));

    expect(store.getState().search).toMatchObject({
      article: 'NEW',
      selectedBrand: null,
      brands: { items: [], requestId: null },
      offers: { items: [], requestId: null },
      filters: { inStock: false },
    });
  });

  it('clears old offers immediately when another brand is chosen', async () => {
    const store = makeStore();
    await store.dispatch(fetchBrands('ABC'));
    store.dispatch(brandSelected('vag'));
    await store.dispatch(fetchOffers({ article: 'ABC', brand: 'VAG' }));
    store.dispatch(brandSelected('mann'));
    expect(store.getState().search.offers.items).toEqual([]);
    expect(store.getState().search.selectedBrand.name).toBe('MANN');
  });

  it('ignores a slower brand response for a previous article', async () => {
    let resolveOld;
    const getBrands = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOld = resolve;
          })
      )
      .mockResolvedValueOnce([{ id: 'new', name: 'NEW' }]);
    const store = makeStore({ getBrands });
    const oldRequest = store.dispatch(fetchBrands('OLD'));
    store.dispatch(articleChanged('NEW'));
    await store.dispatch(fetchBrands('NEW'));
    resolveOld(brands);
    await oldRequest;
    expect(store.getState().search.brands.items).toEqual([
      { id: 'new', name: 'NEW' },
    ]);
  });

  it('ignores offers that arrive after the user changes the brand', async () => {
    let resolveOld;
    const store = makeStore({
      getOffers: () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
    });
    await store.dispatch(fetchBrands('ABC'));
    store.dispatch(brandSelected('vag'));
    const oldRequest = store.dispatch(
      fetchOffers({ article: 'ABC', brand: 'VAG' })
    );
    store.dispatch(brandSelected('mann'));
    resolveOld(offers);
    await oldRequest;
    expect(store.getState().search.offers.items).toEqual([]);
  });

  it('shows errors and supports a successful retry', async () => {
    const getBrands = vi
      .fn()
      .mockRejectedValueOnce(new Error('Нет сети'))
      .mockResolvedValueOnce(brands);
    const store = makeStore({ getBrands });
    await store.dispatch(fetchBrands('ABC'));
    expect(store.getState().search.brands).toMatchObject({
      status: 'error',
      error: 'Нет сети',
    });
    await store.dispatch(fetchBrands('ABC'));
    expect(store.getState().search.brands).toMatchObject({
      status: 'success',
      error: null,
      items: brands,
    });
  });

  it('does not report cancellation as a service failure', async () => {
    const store = makeStore({ getBrands: () => new Promise(() => {}) });
    const request = store.dispatch(fetchBrands('ABC'));
    request.abort();
    await request;
    expect(store.getState().search.brands).toMatchObject({
      status: 'idle',
      error: null,
    });
  });
});

describe('offer filtering and sorting', () => {
  it('filters stock and kind without mutating source data', async () => {
    const store = makeStore();
    await store.dispatch(fetchOffers({ article: 'ABC', brand: 'VAG' }));
    store.dispatch(filterChanged({ inStock: true, kind: 'analog' }));
    expect(
      selectVisibleOffers(store.getState()).map((item) => item.id)
    ).toEqual(['2']);
    expect(store.getState().search.offers.items).toHaveLength(3);
  });

  it.each([
    ['price-asc', ['2', '1', '3']],
    ['price-desc', ['1', '2', '3']],
    ['stock', ['2', '1', '3']],
  ])('sorts by %s and leaves unknown values last', async (sort, expected) => {
    const store = makeStore();
    await store.dispatch(fetchOffers({ article: 'ABC', brand: 'VAG' }));
    store.dispatch(filterChanged({ sort }));
    expect(
      selectVisibleOffers(store.getState()).map((item) => item.id)
    ).toEqual(expected);
  });
});
