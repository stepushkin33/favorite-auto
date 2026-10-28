export const DEMO_ARTICLE = '06J 115 403 Q';
export const EXAMPLE_ARTICLES = [DEMO_ARTICLE, 'W 712/95', '0 986 452 020'];

const oilFilterBrands = [
  {
    id: 'vag',
    name: 'VAG',
    description: 'Volkswagen · Audi · Škoda · SEAT',
    country: 'Германия',
  },
  {
    id: 'mann',
    name: 'MANN-FILTER',
    description: 'Фильтры и системы фильтрации',
    country: 'Германия',
  },
  {
    id: 'mahle',
    name: 'MAHLE',
    description: 'Компоненты двигателя и фильтры',
    country: 'Германия',
  },
];

const oilFilterOffers = [
  {
    id: 'vag-original',
    brand: 'VAG',
    name: 'Фильтр масляный',
    article: '06J 115 403 Q',
    price: 1790,
    stock: 24,
    kind: 'original',
  },
  {
    id: 'mann-filter',
    brand: 'MANN-FILTER',
    name: 'Фильтр масляный',
    article: 'W 712/95',
    price: 1080,
    stock: 58,
    kind: 'analog',
  },
  {
    id: 'mahle-filter',
    brand: 'MAHLE',
    name: 'Фильтр масляный',
    article: 'OC 456',
    price: 1190,
    stock: 16,
    kind: 'analog',
  },
  {
    id: 'bosch-filter',
    brand: 'BOSCH',
    name: 'Фильтр масляный',
    article: '0 451 103 336',
    price: 890,
    stock: 42,
    kind: 'analog',
  },
  {
    id: 'hengst-filter',
    brand: 'HENGST',
    name: 'Фильтр масляный',
    article: 'H14W30',
    price: 970,
    stock: 8,
    kind: 'analog',
  },
  {
    id: 'filtron-filter',
    brand: 'FILTRON',
    name: 'Фильтр масляный',
    article: 'OP 595',
    price: 670,
    stock: 0,
    kind: 'analog',
  },
];

export const demoCatalog = {
  '06J115403Q': { brands: oilFilterBrands, offers: oilFilterOffers },
  'W712/95': {
    brands: [oilFilterBrands[1]],
    offers: oilFilterOffers,
  },
  '0986452020': {
    brands: [
      {
        id: 'bosch',
        name: 'BOSCH',
        description: 'Автомобильные компоненты',
        country: 'Германия',
      },
    ],
    offers: [
      {
        id: 'bosch-2020',
        brand: 'BOSCH',
        name: 'Фильтр масляный',
        article: '0 986 452 020',
        price: 740,
        stock: 32,
        kind: 'original',
      },
      {
        id: 'mann-2020',
        brand: 'MANN-FILTER',
        name: 'Фильтр масляный',
        article: 'W 914/2',
        price: 960,
        stock: 12,
        kind: 'analog',
      },
    ],
  },
};
