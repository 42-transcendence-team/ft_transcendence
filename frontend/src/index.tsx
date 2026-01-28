import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { BrowserRouter } from 'react-router-dom';

const rootEl = document.getElementById('root');

if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <BrowserRouter>
		<React.StrictMode>
			<App />
		</React.StrictMode>
    </BrowserRouter>,
  );
}
