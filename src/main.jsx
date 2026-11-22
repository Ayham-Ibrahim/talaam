import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initMetaPixel } from './lib/metaPixel';
import { initGtm } from './lib/gtm';

initMetaPixel();
initGtm();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
