import React from 'react';
import ReactDOM from 'react-dom/client';
import * as AppMod from './App';
import './index.css';

const App = (AppMod as { default?: React.ComponentType; App?: React.ComponentType }).default ||
            (AppMod as { default?: React.ComponentType; App?: React.ComponentType }).App ||
            (() => null);

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
