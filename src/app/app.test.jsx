import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';

import { App } from './app';
import { createAppStore } from './store';

const brands = [
  { id: 'vag', name: 'VAG', description: 'Volkswagen' },
  { id: 'mann', name: 'MANN' },
];
const offers = [
  {
    id: '1',
    brand: 'VAG',
    name: 'Фильтр масляный',
    article: '06J',
    price: 1790,
    stock: 24,
    kind: 'original',
  },
  {
    id: '2',
    brand: 'MANN',
    name: 'Фильтр масляный',
    article: 'W712',
    price: 900,
    stock: 0,
    kind: 'analog',
  },
];

const renderApp = (overrides = {}) => {
  const api = {
    getBrands: vi.fn().mockResolvedValue(brands),
    getOffers: vi.fn().mockResolvedValue(offers),
    ...overrides,
  };
  const store = createAppStore({ api });
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  return { api, store, user: userEvent.setup() };
};

describe('two-stage parts search', () => {
  it('loads brands first, then shows prices, stock and working filters', async () => {
    const { api, user } = renderApp();
    await user.click(
      await screen.findByRole('button', { name: /VAG Volkswagen/ })
    );
    const table = await screen.findByRole('table');
    expect(api.getOffers).toHaveBeenCalledWith(
      '06J 115 403 Q',
      'VAG',
      expect.any(Object)
    );
    expect(within(table).getByText('24 шт.')).toBeVisible();
    expect(within(table).getByText(/1\s?790/)).toBeVisible();
    expect(within(table).getByText('Нет в наличии')).toBeVisible();

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Сортировка предложений' }),
      'price-asc'
    );
    expect(within(table).getAllByRole('row')[1]).toHaveTextContent('MANN');

    await user.click(
      screen.getByRole('checkbox', { name: 'Только в наличии' })
    );
    expect(within(table).queryByText('MANN')).not.toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: 'Аналоги', exact: true })
    );
    expect(screen.getByText('Нет подходящих предложений')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Сбросить фильтры' }));
    expect(screen.getByRole('table')).toBeVisible();
  });

  it('debounces typing, resets the previous selection and skips short input', async () => {
    const { api, user } = renderApp();
    await user.click(
      await screen.findByRole('button', { name: /VAG Volkswagen/ })
    );
    await screen.findByRole('table');
    const field = screen.getByRole('textbox', { name: 'Артикул запчасти' });
    await user.clear(field);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await user.type(field, 'NEW123');
    await waitFor(() =>
      expect(api.getBrands).toHaveBeenLastCalledWith(
        'NEW123',
        expect.any(Object)
      )
    );
    expect(api.getBrands).toHaveBeenCalledTimes(2);
    expect(api.getOffers).toHaveBeenCalledTimes(1);
  });

  it('shows an API error and retries from the error state', async () => {
    const getBrands = vi
      .fn()
      .mockRejectedValueOnce(new Error('Проверьте интернет'))
      .mockResolvedValue(brands);
    const { user } = renderApp({ getBrands });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Проверьте интернет'
    );
    await user.click(
      screen.getByRole('button', { name: /Попробовать ещё раз/ })
    );
    expect(
      await screen.findByRole('button', { name: /VAG Volkswagen/ })
    ).toBeVisible();
  });

  it('shows an empty manufacturers state without fetching offers', async () => {
    const { api } = renderApp({ getBrands: vi.fn().mockResolvedValue([]) });
    expect(await screen.findByText('Производители не найдены')).toBeVisible();
    expect(api.getOffers).not.toHaveBeenCalled();
  });

  it('shows the offer loader, an error and a successful retry', async () => {
    let rejectOffers;
    const getOffers = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((_resolve, reject) => {
            rejectOffers = reject;
          })
      )
      .mockResolvedValue(offers);
    const { user } = renderApp({ getOffers });
    await user.click(
      await screen.findByRole('button', { name: /VAG Volkswagen/ })
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Подбираем предложения'
    );
    rejectOffers(new Error('Сервис недоступен'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Сервис недоступен'
    );
    await user.click(
      screen.getByRole('button', { name: /Попробовать ещё раз/ })
    );
    expect(await screen.findByRole('table')).toBeVisible();
  });
});
