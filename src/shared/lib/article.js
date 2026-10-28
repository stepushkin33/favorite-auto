export const MIN_ARTICLE_LENGTH = 3;
export const MAX_ARTICLE_LENGTH = 64;

export const normalizeArticle = (article) =>
  article.replace(/[\s.-]/g, '').toUpperCase();

export const isValidArticle = (article) => {
  const length = article.trim().length;

  return length >= MIN_ARTICLE_LENGTH && length <= MAX_ARTICLE_LENGTH;
};
