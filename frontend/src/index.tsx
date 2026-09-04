import React from 'react';
import ReactDOM from 'react-dom/client';

import '@reset';

import { RouterProvider } from 'react-router-dom';

import { router } from './router/router';

const rootEl = document.getElementById('root');

const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');

if (favicon) {
  favicon.href =
    Math.random() < 0.05 ? '/favicondd-troll.png' : '/favicon-24.png';
}

if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
}
