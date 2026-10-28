import { ArrowUpRight, Check, Layers2, ScanLine } from 'lucide-react';

import styles from './hero.module.css';
import { PartsIllustration } from './parts-illustration';

export const Hero = () => (
  <section className={styles.hero}>
    <div className={styles.copy}>
      <div className={styles.eyebrow}>
        <span />
        ПОДБОР ЗАПЧАСТЕЙ БЕЗ ЛИШНИХ ДВИЖЕНИЙ
      </div>
      <h1>
        Та самая деталь.
        <br />
        <span>Для вашего авто.</span>
      </h1>
      <p>
        Найдите запчасть по артикулу, сравните аналоги
        <br className={styles.desktopBreak} /> и выберите подходящее
        предложение.
      </p>
      <div className={styles.features}>
        <span>
          <ScanLine size={16} />
          Поиск по артикулу
        </span>
        <span>
          <Layers2 size={16} />
          Оригиналы и аналоги
        </span>
      </div>
    </div>
    <div className={styles.visual}>
      <span className={styles.orbit} />
      <div className={styles.illustration}>
        <PartsIllustration />
      </div>
      <div className={styles.topBadge}>
        <span className={styles.greenIcon}>
          <Check size={13} />
        </span>
        Точное совпадение
        <ArrowUpRight size={13} />
      </div>
      <div className={styles.bottomBadge}>
        <span className={styles.badgeIcon}>
          <Layers2 size={18} />
        </span>
        <div>
          <strong>Больше вариантов</strong>
          <span>Выбор за вами</span>
        </div>
      </div>
    </div>
  </section>
);
