import { ApiError, invalidResponse } from './api-error';

const isText = (value) => typeof value === 'string' && value.trim().length > 0;
const isAmount = (value) =>
  value === null ||
  (typeof value === 'number' && Number.isFinite(value) && value >= 0);

const readGoods = (data) => {
  if (!data || typeof data !== 'object') return invalidResponse();

  if ('error' in data) {
    const error = String(data.error);

    if (error.includes('Request quota exceeded!'))
      throw new ApiError(
        'Лимит запросов к сервису исчерпан. Повторите поиск позже.'
      );
    if (error.includes('Empty key!') || error.includes('Invalid key client!'))
      throw new ApiError(
        'Сервис временно недоступен: требуется настройка доступа.'
      );
    if (error.includes('Empty number goods!'))
      throw new ApiError('Укажите артикул запчасти и повторите поиск.');

    throw new ApiError('Сервис поиска вернул ошибку. Попробуйте позже.');
  }

  if (!Array.isArray(data.goods)) return invalidResponse();

  return data.goods;
};

// "Not found" is represented as one empty good with an all-zero GUID.
const isEmptyGood = (good) =>
  good &&
  good.brand === '' &&
  good.name === '' &&
  good.number === '' &&
  (!good.goodsID || /^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(good.goodsID));

const validateGood = (good) => {
  if (
    !good ||
    !isText(good.goodsID) ||
    !isText(good.brand) ||
    !isText(good.name) ||
    !isText(good.number)
  )
    return invalidResponse();
};

export const parseBrands = (data) => {
  const brands = new Map();

  for (const good of readGoods(data)) {
    if (isEmptyGood(good)) continue;
    validateGood(good);

    const name = good.brand.trim();
    const id = name.toUpperCase();

    if (!brands.has(id))
      brands.set(id, { id, name, description: good.name, country: '' });
  }

  return [...brands.values()];
};

export const parseOffers = (data) => {
  const offers = new Map();

  const addGood = (good, kind) => {
    if (isEmptyGood(good)) return;
    validateGood(good);
    if (!Array.isArray(good.warehouses)) return invalidResponse();

    const product = {
      brand: good.brand,
      name: good.name,
      article: good.number,
      kind,
    };

    if (!good.warehouses.length) {
      const id = JSON.stringify([good.goodsID, null]);
      if (!offers.has(id))
        offers.set(id, {
          ...product,
          id,
          price: null,
          stock: good.count === 0 ? 0 : null,
          warehouse: '',
          notRefund: good.notRefund === true,
        });
      return;
    }

    for (const warehouse of good.warehouses) {
      if (
        !warehouse ||
        !isText(warehouse.id) ||
        !isAmount(warehouse.price) ||
        !isAmount(warehouse.stock) ||
        (warehouse.stock !== null && !Number.isInteger(warehouse.stock))
      )
        return invalidResponse();

      const id = JSON.stringify([good.goodsID, warehouse.id]);

      // A good can appear among analogues of multiple searched goods.
      if (!offers.has(id))
        offers.set(id, {
          ...product,
          id,
          price: warehouse.price,
          stock: warehouse.stock,
          warehouse: isText(warehouse.code) ? warehouse.code : warehouse.id,
          notRefund: good.notRefund === true || warehouse.notRefund === true,
        });
    }
  };

  const goods = readGoods(data);

  // Prefer the searched item if it also appears in an analogue list.
  for (const good of goods) addGood(good, 'original');
  for (const good of goods) {
    if (good.analogues === undefined) continue;
    if (!Array.isArray(good.analogues)) return invalidResponse();
    for (const analogue of good.analogues) addGood(analogue, 'analog');
  }

  return [...offers.values()];
};
