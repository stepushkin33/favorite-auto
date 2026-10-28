import { ArrowDownUp } from 'lucide-react';

import { pluralize } from '../../../shared/lib/format';
import styles from './offer-table.module.css';

const kindFilters = [
  { value: 'all', label: 'Все предложения' },
  { value: 'original', label: 'Искомая деталь' },
  { value: 'analog', label: 'Аналоги' },
];

export const OfferFilters = ({ filters, count, onChange }) => (
  <>
    <div className={styles.toolbar}>
      <div aria-label='Тип предложения' className={styles.tabs} role='group'>
        {kindFilters.map((filter) => (
          <button
            aria-pressed={filters.kind === filter.value}
            className={filters.kind === filter.value ? styles.activeTab : ''}
            key={filter.value}
            onClick={() => onChange({ kind: filter.value })}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <label className={styles.stockFilter}>
        <input
          checked={filters.inStock}
          type='checkbox'
          onChange={(event) => onChange({ inStock: event.target.checked })}
        />
        Только в наличии
      </label>
    </div>
    <div className={styles.sortRow}>
      <span aria-live='polite'>
        {pluralize(count, ['предложение', 'предложения', 'предложений'])}
      </span>
      <label className={styles.sort}>
        <ArrowDownUp aria-hidden='true' size={14} />
        <select
          aria-label='Сортировка предложений'
          value={filters.sort}
          onChange={(event) => onChange({ sort: event.target.value })}
        >
          <option value='recommended'>По умолчанию</option>
          <option value='price-asc'>Сначала дешевле</option>
          <option value='price-desc'>Сначала дороже</option>
          <option value='stock'>По остатку</option>
        </select>
      </label>
    </div>
  </>
);
