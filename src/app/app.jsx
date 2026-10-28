import { PartsSearch } from '../features/parts-search/ui/parts-search';
import { Header } from '../widgets/header';
import { Hero } from '../widgets/hero';
import { SearchGuide } from '../widgets/search-guide';
import styles from './app.module.css';

export const App = () => (
  <div>
    <Header />
    <main className='container'>
      <div className={styles.breadcrumb}>
        <span>Запчасти</span>
        <span>/</span>
        <span>Поиск по артикулу</span>
      </div>
      <Hero />
      <div className={styles.workspace}>
        <PartsSearch />
        <SearchGuide />
      </div>
    </main>
    <footer className={styles.footer}>
      <div className={`container ${styles.footerInner}`}>
        <span className={styles.footerBrand}>
          деталь<span>.</span>
        </span>
        <p>Сервис подбора запчастей и аналогов</p>
      </div>
    </footer>
  </div>
);
