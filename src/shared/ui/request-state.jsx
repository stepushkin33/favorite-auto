import { ArrowRight, SearchX, TriangleAlert } from 'lucide-react';

import styles from './request-state.module.css';

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
      {['first', 'second', 'third'].map((id) => (
        <div className={styles.skeleton} key={id} />
      ))}
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
