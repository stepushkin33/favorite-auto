import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { isValidArticle } from '../../../shared/lib/article';
import {
  brandsRetried,
  fetchBrands,
  fetchOffers,
  selectSearch,
} from './search-slice';

export const usePartsSearch = () => {
  const dispatch = useDispatch();
  const { article, selectedBrand } = useSelector(selectSearch);
  const [brandAttempt, setBrandAttempt] = useState(0);
  const [offerAttempt, setOfferAttempt] = useState(0);

  useEffect(() => {
    if (!isValidArticle(article)) return;

    let request;
    const timeout = setTimeout(() => {
      request = dispatch(fetchBrands(article));
    }, 450);

    return () => {
      clearTimeout(timeout);
      request?.abort();
    };
  }, [article, brandAttempt, dispatch]);

  useEffect(() => {
    if (!selectedBrand) return;

    const request = dispatch(
      fetchOffers({ article, brand: selectedBrand.name })
    );

    return () => request.abort();
  }, [article, selectedBrand, offerAttempt, dispatch]);

  const retryBrands = useCallback(() => {
    dispatch(brandsRetried());
    setBrandAttempt((attempt) => attempt + 1);
  }, [dispatch]);

  const retryOffers = useCallback(() => {
    setOfferAttempt((attempt) => attempt + 1);
  }, []);

  return { retryBrands, retryOffers };
};
