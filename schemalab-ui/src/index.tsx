import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './router';
import './index.scss';

console.log("We are using NODE_ENV:", process.env.REACT_APP_ENVIRONMENT)

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
      <Router />
  </React.StrictMode>
);
