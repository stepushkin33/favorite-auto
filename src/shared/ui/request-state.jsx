import { ArrowRight, SearchX, TriangleAlert } from 'lucide-react';

import styles from './request-state.module.css';

const skeletonItems = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];

const BrandSkeleton = () => (
  <div className={styles.card}>
    <div className={styles.cardHeading}>
      <span className={`${styles.bone} ${styles.brandName}`} />
      <span className={`${styles.bone} ${styles.round}`} />
    </div>
    <span className={`${styles.bone} ${styles.description}`} />
    <span className={`${styles.bone} ${styles.shortLine}`} />
  </div>
);

const OfferSkeleton = () => (
  <div className={styles.offer}>
    <div className={styles.product}>
      <span className={`${styles.bone} ${styles.thumbnail}`} />
      <div className={styles.productText}>
        <span className={`${styles.bone} ${styles.brandName}`} />
        <span className={`${styles.bone} ${styles.description}`} />
      </div>
    </div>
    <span className={`${styles.bone} ${styles.article}`} />
    <span className={`${styles.bone} ${styles.stock}`} />
    <span className={`${styles.bone} ${styles.price}`} />
  </div>
);

export const LoadingState = ({ label, variant = 'brands' }) => (
  <div
    aria-busy='true'
    aria-live='polite'
    className={styles.loading}
    role='status'
  >
    <div className={styles.loadingLabel}>
      <span className={styles.spinner} />
      {label}
    </div>
    <div
      className={variant === 'brands' ? styles.cards : styles.rows}
      aria-hidden='true'
    >
      {skeletonItems.map((id) =>
        variant === 'brands' ? (
          <BrandSkeleton key={id} />
        ) : (
          <OfferSkeleton key={id} />
        )
      )}
    </div>
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className={styles.state} role='alert'>
    <div className={`${styles.icon} ${styles.errorIcon}`}>
      <TriangleAlert size={25} />
    </div>
    <h3>Не получилось загрузить данные</h3>
    <p>{message}</p>
    <button className='button button-secondary' onClick={onRetry}>
      Попробовать ещё раз <ArrowRight size={16} />
    </button>
  </div>
);

export const EmptyState = ({ title, description, action, onAction }) => (
  <div className={styles.state} role='status'>
    <div className={styles.icon}>
      <SearchX size={26} />
    </div>
    <h3>{title}</h3>
    <p>{description}</p>
    {action && (
      <button className='button button-secondary' onClick={onAction}>
        {action}
      </button>
    )}
  </div>
);
