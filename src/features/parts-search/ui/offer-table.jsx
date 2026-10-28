import { useDispatch, useSelector } from 'react-redux';

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../../shared/ui/request-state';
import {
  filterChanged,
  selectSearch,
  selectVisibleOffers,
} from '../model/search-slice';
import { OfferFilters } from './offer-filters';
import { OfferRow } from './offer-row';
import styles from './offer-table.module.css';

export const OfferTable = ({ onRetry }) => {
  const dispatch = useDispatch();
  const { selectedBrand, offers, filters } = useSelector(selectSearch);
  const visibleOffers = useSelector(selectVisibleOffers);

  if (!selectedBrand) return null;

  if (offers.status === 'loading' || offers.status === 'idle') {
    return (
      <div className={styles.content}>
        <LoadingState
          label={`Подбираем предложения ${selectedBrand.name} и аналоги…`}
          variant='offers'
        />
      </div>
    );
  }

  if (offers.status === 'error')
    return <ErrorState message={offers.error} onRetry={onRetry} />;

  if (!offers.items.length) {
    return (
      <EmptyState
        title='Предложений пока нет'
        description='Для выбранного производителя нет предложений. Попробуйте другой бренд или повторите поиск позже.'
        action='Обновить предложения'
        onAction={onRetry}
      />
    );
  }

  return (
    <section aria-labelledby='offers-heading' className={styles.content}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>РЕЗУЛЬТАТЫ ПОДБОРА</span>
          <h2 id='offers-heading'>
            Детали, которые вам подходят<span>{offers.items.length}</span>
          </h2>
        </div>
        <span className={styles.rubles}>Цены в рублях</span>
      </div>
      <OfferFilters
        count={visibleOffers.length}
        filters={filters}
        onChange={(patch) => dispatch(filterChanged(patch))}
      />
      {!visibleOffers.length ? (
        <EmptyState
          title='Нет подходящих предложений'
          description='Измените фильтры, чтобы увидеть больше вариантов.'
          action='Сбросить фильтры'
          onAction={() =>
            dispatch(filterChanged({ kind: 'all', inStock: false }))
          }
        />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className='sr-only'>
              Предложения и аналоги для {selectedBrand.name}
            </caption>
            <colgroup>
              <col className={styles.productColumn} />
              <col className={styles.articleColumn} />
              <col className={styles.stockColumn} />
              <col className={styles.priceColumn} />
            </colgroup>
            <thead>
              <tr>
                <th scope='col'>Производитель / наименование</th>
                <th scope='col'>Артикул</th>
                <th scope='col'>На складе</th>
                <th scope='col'>Цена</th>
              </tr>
            </thead>
            <tbody>
              {visibleOffers.map((offer) => (
                <OfferRow key={offer.id} offer={offer} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className={styles.footnote}>
        Наличие и цены могут измениться. Совместимость детали уточняйте по VIN
        автомобиля.
      </p>
    </section>
  );
};
