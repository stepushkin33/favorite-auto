import { Check, FlaskConical } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import { isDemoMode } from '../../../shared/api/parts-api';
import { brandCleared, selectSearch } from '../model/search-slice';
import { usePartsSearch } from '../model/use-parts-search';
import { BrandPicker } from './brand-picker';
import { OfferTable } from './offer-table';
import styles from './parts-search.module.css';
import { SearchForm } from './search-form';

export const PartsSearch = () => {
  const dispatch = useDispatch();
  const { selectedBrand } = useSelector(selectSearch);
  const { retryBrands, retryOffers } = usePartsSearch();

  return (
    <section aria-label='Подбор автозапчастей' className={styles.wrapper}>
      <div className={styles.panel}>
        <div className={styles.steps}>
          <button
            aria-current={!selectedBrand ? 'step' : undefined}
            className={`${styles.step} ${!selectedBrand ? styles.active : styles.complete}`}
            onClick={() => dispatch(brandCleared())}
          >
            <span className={styles.number}>
              {selectedBrand ? <Check size={14} /> : '1'}
            </span>
            <span>Поиск производителя</span>
          </button>
          <span className={styles.stepLine} />
          <div
            aria-current={selectedBrand ? 'step' : undefined}
            className={`${styles.step} ${selectedBrand ? styles.active : ''}`}
          >
            <span className={styles.number}>2</span>
            <span>Предложения и аналоги</span>
          </div>
        </div>
        <SearchForm onSearch={retryBrands} />
        <BrandPicker onRetry={retryBrands} />
        <OfferTable onRetry={retryOffers} />
      </div>
      {isDemoMode && (
        <div className={styles.note}>
          <FlaskConical size={14} />
          <span>
            Деморежим · Тестовые цены и остатки для знакомства с поиском
          </span>
        </div>
      )}
    </section>
  );
};
