import { Check, Package } from 'lucide-react';

import { formatPrice, formatStock } from '../../../shared/lib/format';
import styles from './offer-table.module.css';

export const OfferRow = ({ offer }) => (
  <tr>
    <td>
      <div className={styles.product}>
        <span aria-hidden='true' className={styles.productIcon}>
          <Package size={22} strokeWidth={1.3} />
        </span>
        <div>
          <div className={styles.productBrand}>
            {offer.brand}
            {offer.kind === 'original' && (
              <span className={styles.originalBadge}>Искомая деталь</span>
            )}
          </div>
          <span className={styles.productName}>{offer.name}</span>
        </div>
      </div>
    </td>
    <td>
      <span className={styles.article}>{offer.article || 'Не указан'}</span>
      {offer.warehouse && (
        <small className={styles.warehouse}>Склад {offer.warehouse}</small>
      )}
      {offer.notRefund && (
        <small className={styles.warehouse}>Без возврата по отказу</small>
      )}
    </td>
    <td>
      <span
        className={`${styles.stock} ${offer.stock > 0 ? styles.available : ''}`}
      >
        {offer.stock > 0 && <Check size={13} />}
        {formatStock(offer.stock)}
      </span>
    </td>
    <td className={styles.price}>{formatPrice(offer.price)}</td>
  </tr>
);
