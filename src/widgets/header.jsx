import { ScanLine } from 'lucide-react';

import styles from './header.module.css';

export const Header = () => (
  <header className={styles.header}>
    <div className={`container ${styles.inner}`}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>
          <ScanLine size={25} strokeWidth={2.2} />
        </span>
        деталь<span className={styles.logoDot}>.</span>
      </div>
      <span className={styles.divider} />
      <span className={styles.sectionName}>Подбор запчастей</span>
      <span className={styles.tagline}>Всё начинается с правильной детали</span>
    </div>
  </header>
);
