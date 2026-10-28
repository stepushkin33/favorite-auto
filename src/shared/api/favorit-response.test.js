import { describe, expect, it } from 'vitest';

import { parseBrands, parseOffers } from './favorit-response';

const warehouse = {
  id: 'warehouse-1',
  code: 'МС2',
  price: 12533.62,
  stock: 20,
};
const good = {
  goodsID: 'good-1',
  brand: 'MEYLE',
  name: 'Рычаги задней подвески',
  number: '7160500039/S',
  count: 20,
  price: 1,
  warehouses: [warehouse],
};
const analogue = {
  ...good,
  goodsID: 'good-2',
  brand: 'Mapco',
  number: '53612/1',
  warehouses: [
    { ...warehouse, id: 'warehouse-2', code: 'ПТ4', price: 8680.2, stock: 10 },
  ],
};
const emptyGood = {
  goodsID: '00000000-0000-0000-0000-000000000000',
  brand: '',
  name: '',
  number: '',
  count: 0,
  price: 0,
  warehouses: [],
};

describe('Favorit Parts response adapter', () => {
  it('reads and deduplicates brands from goods, preserving the provider brand name', () => {
    const brands = parseBrands({
      goods: [good, { ...good, goodsID: 'other', brand: 'meyle' }, analogue],
    });
    expect(brands.map((brand) => brand.name)).toEqual(['MEYLE', 'Mapco']);
  });

  it.each([{ goods: [] }, { goods: [emptyGood] }])(
    'handles documented not-found responses',
    (data) => {
      expect(parseBrands(data)).toEqual([]);
      expect(parseOffers(data)).toEqual([]);
    }
  );

  it('uses each warehouse price and stock, never the obsolete goods.price or aggregate count', () => {
    const offers = parseOffers({
      goods: [
        {
          ...good,
          count: 9999,
          warehouses: [
            warehouse,
            { id: 'warehouse-2', price: 13000, stock: 5 },
          ],
        },
      ],
    });
    expect(offers.map(({ price, stock }) => ({ price, stock }))).toEqual([
      { price: 12533.62, stock: 20 },
      { price: 13000, stock: 5 },
    ]);
    expect(offers[0].warehouse).toBe('МС2');
    expect(offers[1].warehouse).toBe('warehouse-2');
    expect(offers[0].id).not.toBe(offers[1].id);
  });

  it('flattens nested analogues including a different part from the same brand', () => {
    const sameBrandAnalogue = {
      ...good,
      goodsID: 'same-brand',
      number: '7160500039/SK',
      count: 0,
      warehouses: [],
    };
    const offers = parseOffers({
      goods: [{ ...good, analogues: [analogue, sameBrandAnalogue] }],
    });
    expect(offers.map(({ brand, kind }) => ({ brand, kind }))).toEqual([
      { brand: 'MEYLE', kind: 'original' },
      { brand: 'Mapco', kind: 'analog' },
      { brand: 'MEYLE', kind: 'analog' },
    ]);
    expect(offers[2]).toMatchObject({ price: null, stock: 0 });
  });

  it('deduplicates repeated goods and warehouses while preserving the searched item', () => {
    const offers = parseOffers({
      goods: [
        { ...good, analogues: [analogue, good] },
        { ...good, analogues: [analogue] },
      ],
    });
    expect(offers).toHaveLength(2);
    expect(offers[0].kind).toBe('original');
  });

  it('preserves zero prices, unknown values and non-returnable warehouse flags', () => {
    expect(
      parseOffers({
        goods: [
          {
            ...good,
            warehouses: [{ ...warehouse, price: 0, stock: 0, notRefund: true }],
          },
        ],
      })[0]
    ).toMatchObject({ price: 0, stock: 0, notRefund: true });
    expect(
      parseOffers({
        goods: [
          { ...good, warehouses: [{ ...warehouse, price: null, stock: null }] },
        ],
      })[0]
    ).toMatchObject({ price: null, stock: null });
    expect(
      parseOffers({ goods: [{ ...good, warehouses: [] }] })[0]
    ).toMatchObject({ price: null, stock: null });
  });

  it.each([{}, null, [], { goods: null }, { goods: [null] }])(
    'rejects invalid responses: %j',
    (data) => {
      expect(() => parseBrands(data)).toThrow('некорректные данные');
      expect(() => parseOffers(data)).toThrow('некорректные данные');
    }
  );

  it.each([
    { price: -1 },
    { price: '12.5' },
    { price: Infinity },
    { stock: 1.5 },
    { stock: undefined },
  ])('rejects invalid warehouse values: %j', (override) => {
    expect(() =>
      parseOffers({
        goods: [{ ...good, warehouses: [{ ...warehouse, ...override }] }],
      })
    ).toThrow('некорректные данные');
  });

  it.each([
    ['Empty key!', 'настройка доступа'],
    ['Invalid key client!', 'настройка доступа'],
    ['Empty number goods!', 'Укажите артикул'],
    ['Request quota exceeded!', 'Лимит запросов'],
    ['untrusted server message', 'вернул ошибку'],
  ])('handles provider errors returned with HTTP 200: %s', (error, message) => {
    expect(() => parseBrands({ error })).toThrow(message);
    expect(() => parseOffers({ error })).toThrow(message);
  });
});
