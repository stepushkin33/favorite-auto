import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';

import { DEMO_ARTICLE } from '../../../shared/api/demo-data';
import { isDemoMode } from '../../../shared/api/parts-api';
import { isValidArticle } from '../../../shared/lib/article';

const emptyRequest = () => ({
  items: [],
  status: 'idle',
  error: null,
  requestId: null,
});

const createDefaultFilters = () => ({
  kind: 'all',
  inStock: false,
  sort: 'recommended',
});

const createInitialState = () => ({
  article: isDemoMode ? DEMO_ARTICLE : '',
  selectedBrand: null,
  brands: emptyRequest(),
  offers: emptyRequest(),
  filters: createDefaultFilters(),
});

export const fetchBrands = createAsyncThunk(
  'search/fetchBrands',
  async (article, { extra, signal, rejectWithValue }) => {
    try {
      return await extra.api.getBrands(article.trim(), { signal });
    } catch (error) {
      if (signal.aborted) throw error;

      return rejectWithValue(
        error.message || 'Не удалось найти производителей.'
      );
    }
  },
  { condition: (article) => isValidArticle(article) }
);

export const fetchOffers = createAsyncThunk(
  'search/fetchOffers',
  async ({ article, brand }, { extra, signal, rejectWithValue }) => {
    try {
      return await extra.api.getOffers(article.trim(), brand, { signal });
    } catch (error) {
      if (signal.aborted) throw error;

      return rejectWithValue(
        error.message || 'Не удалось загрузить предложения.'
      );
    }
  }
);

const addRequestCases = (builder, thunk, key) => {
  builder
    .addCase(thunk.pending, (state, action) => {
      state[key] = {
        items: [],
        status: 'loading',
        error: null,
        requestId: action.meta.requestId,
      };
    })
    .addCase(thunk.fulfilled, (state, action) => {
      if (state[key].requestId !== action.meta.requestId) return;

      state[key].items = action.payload;
      state[key].status = 'success';
      state[key].requestId = null;
    })
    .addCase(thunk.rejected, (state, action) => {
      if (state[key].requestId !== action.meta.requestId) return;

      state[key].status = action.meta.aborted ? 'idle' : 'error';
      state[key].error = action.meta.aborted ? null : action.payload;
      state[key].requestId = null;
    });
};

const searchSlice = createSlice({
  name: 'search',
  initialState: createInitialState,
  reducers: {
    articleChanged(state, action) {
      if (state.article === action.payload) return;

      state.article = action.payload;
      state.selectedBrand = null;
      state.brands = emptyRequest();
      state.offers = emptyRequest();
      state.filters = createDefaultFilters();
    },
    brandSelected(state, action) {
      const brand = state.brands.items.find(
        (item) => item.id === action.payload
      );

      if (!brand || state.selectedBrand?.id === brand.id) return;

      state.selectedBrand = brand;
      state.offers = emptyRequest();
      state.filters = createDefaultFilters();
    },
    brandCleared(state) {
      state.selectedBrand = null;
      state.offers = emptyRequest();
      state.filters = createDefaultFilters();
    },
    filterChanged(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    brandsRetried(state) {
      state.selectedBrand = null;
      state.brands = emptyRequest();
      state.offers = emptyRequest();
    },
  },
  extraReducers: (builder) => {
    addRequestCases(builder, fetchBrands, 'brands');
    addRequestCases(builder, fetchOffers, 'offers');
  },
});

export const {
  articleChanged,
  brandSelected,
  brandCleared,
  filterChanged,
  brandsRetried,
} = searchSlice.actions;

export const selectSearch = (state) => state.search;

export const selectVisibleOffers = createSelector([selectSearch], (search) => {
  const { kind, inStock, sort } = search.filters;
  const offers = search.offers.items.filter(
    (offer) =>
      (kind === 'all' || offer.kind === kind) && (!inStock || offer.stock > 0)
  );

  if (sort === 'price-asc' || sort === 'price-desc') {
    return offers.sort((left, right) => {
      if (left.price === null) return right.price === null ? 0 : 1;
      if (right.price === null) return -1;

      return sort === 'price-asc'
        ? left.price - right.price
        : right.price - left.price;
    });
  }

  if (sort === 'stock') {
    return offers.sort(
      (left, right) => (right.stock ?? -1) - (left.stock ?? -1)
    );
  }

  return offers;
});

export default searchSlice.reducer;
