import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// ** Redux Imports
import { store } from './redux/store';
import { Provider } from 'react-redux';

import reportWebVitals from './reportWebVitals';
import { CookiesProvider } from 'react-cookie';
import FullScreenLoader from './components/FullScreenLoader';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './assets/scss/app-loader.css';

const LazyApp = lazy(() => import('./App'));

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <BrowserRouter>
    <Provider store={store}>
      <CookiesProvider>
        <Suspense fallback={<FullScreenLoader />}>
          <LazyApp />
        </Suspense>
      </CookiesProvider>
    </Provider>
  </BrowserRouter>
);

reportWebVitals();
