import { ArrowRight, FlaskConical, Search, X } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { EXAMPLE_ARTICLES } from '../../../shared/api/demo-data';
import { isDemoMode } from '../../../shared/api/parts-api';
import {
  isValidArticle,
  MAX_ARTICLE_LENGTH,
} from '../../../shared/lib/article';
import { articleChanged, selectSearch } from '../model/search-slice';
import styles from './search-form.module.css';

export const SearchForm = ({ onSearch }) => {
  const dispatch = useDispatch();
  const { article } = useSelector(selectSearch);
  const [submitted, setSubmitted] = useState(false);
  const invalid = submitted && !isValidArticle(article);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (isValidArticle(article)) onSearch();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor='article'>
          Артикул запчасти
        </label>
        {isDemoMode && (
          <span className={styles.demoTag}>
            <FlaskConical size={12} />
            Демокаталог
          </span>
        )}
      </div>
      <div className={styles.fieldRow}>
        <div className={`${styles.inputWrap} ${invalid ? styles.invalid : ''}`}>
          <Search size={21} aria-hidden='true' />
          <input
            aria-describedby='article-hint'
            aria-invalid={invalid}
            autoComplete='off'
            className={styles.input}
            id='article'
            maxLength={MAX_ARTICLE_LENGTH}
            name='article'
            placeholder='Например, 06J 115 403 Q'
            spellCheck={false}
            value={article}
            onChange={(event) => dispatch(articleChanged(event.target.value))}
          />
          {article && (
            <button
              aria-label='Очистить артикул'
              className={styles.clear}
              type='button'
              onClick={() => dispatch(articleChanged(''))}
            >
              <X size={18} />
            </button>
          )}
        </div>
        <button
          className={`button button-primary ${styles.submit}`}
          type='submit'
        >
          Найти запчасть <ArrowRight size={19} />
        </button>
      </div>
      <p className={invalid ? styles.error : styles.hint} id='article-hint'>
        {invalid
          ? 'Введите артикул от 3 до 64 символов.'
          : 'Введите номер с упаковки или корпуса детали.'}
      </p>
      {isDemoMode && (
        <div className={styles.examples}>
          <span>Попробуйте:</span>
          {EXAMPLE_ARTICLES.map((example) => (
            <button
              className={styles.example}
              key={example}
              type='button'
              onClick={() => {
                setSubmitted(false);
                dispatch(articleChanged(example));
              }}
            >
              {example}
            </button>
          ))}
        </div>
      )}
    </form>
  );
};
