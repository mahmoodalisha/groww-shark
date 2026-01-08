'use client';

import { Provider, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { store } from '../store';
import { setWidgets } from '../store/widgetsSlice';

function WidgetHydrator({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const stored = localStorage.getItem('widgets');
    if (stored) {
      dispatch(setWidgets(JSON.parse(stored)));
    }
  }, [dispatch]);

  return children;
}

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <WidgetHydrator>{children}</WidgetHydrator>
    </Provider>
  );
}
