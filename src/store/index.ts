import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

// Import slices (will be created later)
// import authSlice from './slices/authSlice';
// import dashboardSlice from './slices/dashboardSlice';

// Temporary empty reducer until we add actual slices
const rootReducer = {
  // Placeholder to prevent empty reducer error
  _placeholder: (state = {}, action: any) => state,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;