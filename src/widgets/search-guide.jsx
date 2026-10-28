import {
  ArrowUpRight,
  BadgeCheck,
  CircleHelp,
  ScanLine,
  ShieldCheck,
} from 'lucide-react';

import styles from './search-guide.module.css';

export const SearchGuide = () => (
  <aside className={styles.aside}>
    <section className={styles.guide} id='how-it-works'>
      <span className={styles.guideIcon}>
        <ScanLine size={23} strokeWidth={1.5} />
      </span>
      <h2>
        Нужная деталь —<br />в два шага
      </h2>
      <p>
        Без сложных каталогов
        <br />и бесконечных вкладок.
      </p>
      <ol className={styles.steps}>
        <li>
          <span>1</span>
          <div>
            <strong>Введите артикул</strong>
            <p>
              Номер на детали, упаковке
              <br />
              или в документах к авто.
            </p>
          </div>
        </li>
        <li>
          <span>2</span>
          <div>
            <strong>Выберите производителя</strong>
            <p>
              Посмотрите цены, наличие
              <br />и подходящие аналоги.
            </p>
          </div>
        </li>
      </ol>
      <div className={styles.tip}>
        <CircleHelp size={17} />
        <p>
          <strong>Где найти артикул?</strong>Он выглядит как набор букв и цифр:
          например, 06J 115 403 Q.
        </p>
      </div>
    </section>
    <section className={styles.confidence}>
      <ShieldCheck size={21} strokeWidth={1.5} />
      <div>
        <h3>Проверяйте совместимость</h3>
        <p>
          Даже похожие детали могут отличаться. Сверьте артикул с VIN вашего
          автомобиля.
        </p>
      </div>
    </section>
    <a className={styles.helpLink} href='#article'>
      <BadgeCheck size={15} />
      Начать подбор
      <ArrowUpRight size={14} />
    </a>
  </aside>
);
