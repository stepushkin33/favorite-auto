import { ArrowDown, ArrowRight, Check } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import { isDemoMode } from '../../../shared/api/parts-api';
import { isValidArticle } from '../../../shared/lib/article';
import { pluralize } from '../../../shared/lib/format';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../../shared/ui/request-state';
import { brandSelected, selectSearch } from '../model/search-slice';
import styles from './brand-picker.module.css';

export const BrandPicker = ({ onRetry }) => {
  const dispatch = useDispatch();
  const { article, brands, selectedBrand } = useSelector(selectSearch);

  if (!isValidArticle(article)) {
    return (
      <EmptyState
        title='Найдём ту самую деталь'
        description='Введите минимум 3 символа артикула. Сначала покажем производителей, затем — предложения и аналоги.'
      />
    );
  }

  if (brands.status === 'idle' || brands.status === 'loading') {
    return (
      <div className={styles.content}>
        <LoadingState label='Ищем производителей по артикулу…' />
      </div>
    );
  }

  if (brands.status === 'error')
    return <ErrorState message={brands.error} onRetry={onRetry} />;

  if (!brands.items.length) {
    return (
      <EmptyState
        title='Производители не найдены'
        description={
          isDemoMode
            ? 'В демокаталоге есть только артикулы из примеров выше. Выберите один из них, чтобы проверить подбор.'
            : 'Проверьте артикул: возможно, в нём есть опечатка. Попробуйте другой номер детали.'
        }
      />
    );
  }

  return (
    <section aria-labelledby='brands-heading' className={styles.content}>
      <div className={styles.heading}>
        <h2 id='brands-heading'>Выберите производителя</h2>
        <span>
          {pluralize(brands.items.length, [
            'производитель',
            'производителя',
            'производителей',
          ])}
        </span>
      </div>
      <p className={styles.description}>
        Один артикул может встречаться у разных брендов. Уточните нужный.
      </p>
      <div className={styles.grid}>
        {brands.items.map((brand) => {
          const selected = selectedBrand?.id === brand.id;

          return (
            <button
              aria-pressed={selected}
              className={`${styles.brand} ${selected ? styles.selected : ''}`}
              key={brand.id}
              onClick={() => dispatch(brandSelected(brand.id))}
            >
              <div className={styles.brandTop}>
                <span
                  className={`${styles.wordmark} ${brand.name === 'MANN-FILTER' ? styles.mann : ''} ${brand.name === 'MAHLE' ? styles.mahle : ''}`}
                >
                  {brand.name}
                </span>
                <span className={styles.arrow}>
                  {selected ? <Check size={17} /> : <ArrowRight size={18} />}
                </span>
              </div>
              {brand.description && (
                <span className={styles.brandDescription}>
                  {brand.description}
                </span>
              )}
              {brand.country && (
                <span className={styles.country}>
                  <span className={styles.countryDot} />
                  {brand.country}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {!selectedBrand && (
        <div className={styles.nextHint}>
          <ArrowDown size={16} />
          <span>Выберите бренд, чтобы увидеть цены и доступные аналоги</span>
        </div>
      )}
    </section>
  );
};
