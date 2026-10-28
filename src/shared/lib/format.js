const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const formatPrice = (price) =>
  price === null ? 'По запросу' : priceFormatter.format(price);

export const formatStock = (stock) => {
  if (stock === null) return 'Уточняется';
  if (stock === 0) return 'Нет в наличии';

  return `${stock.toLocaleString('ru-RU')} шт.`;
};

export const pluralize = (count, forms) => {
  const lastTwo = count % 100;
  const last = count % 10;
  const index =
    lastTwo >= 11 && lastTwo <= 19
      ? 2
      : last === 1
        ? 0
        : last >= 2 && last <= 4
          ? 1
          : 2;

  return `${count} ${forms[index]}`;
};
