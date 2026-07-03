//import React from 'react';
import ReactDOM from 'react-dom/client';

import '@reset';

import { RouterProvider } from "react-router-dom";

import { router } from './router/router'

const rootEl = document.getElementById('root');

if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
  //  <React.StrictMode>
      <RouterProvider router={router} />
 //   </React.StrictMode>
  );
}
