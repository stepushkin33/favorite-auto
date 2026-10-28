import { ArrowUpRight, ScanLine } from 'lucide-react';

import styles from './header.module.css';

export const Header = () => (
  <header className={styles.header}>
    <div className={`container ${styles.inner}`}>
      <a aria-label='Деталь — на главную' className={styles.logo} href='#top'>
        <span className={styles.logoIcon}>
          <ScanLine size={25} strokeWidth={2.2} />
        </span>
        деталь<span className={styles.logoDot}>.</span>
      </a>
      <span className={styles.divider} />
      <nav aria-label='Основная навигация' className={styles.nav}>
        <a className={styles.active} href='#search'>
          Подбор запчастей
        </a>
        <a href='#how-it-works'>
          Как это работает <ArrowUpRight size={13} />
        </a>
      </nav>
      <span className={styles.tagline}>Всё начинается с правильной детали</span>
    </div>
  </header>
);
