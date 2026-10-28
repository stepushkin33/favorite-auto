import { configureStore } from '@reduxjs/toolkit';

import searchReducer from '../features/parts-search/model/search-slice';
import { partsApi } from '../shared/api/parts-api';

export const createAppStore = ({ api = partsApi, preloadedState } = {}) =>
  configureStore({
    reducer: { search: searchReducer },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: { extraArgument: { api } } }),
  });
