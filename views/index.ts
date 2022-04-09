import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactDOM from 'react-dom';
import { TranslationList } from './TranslationList';

// declare global {
//   interface Window {
//     __View: any;
//   }
// }

const VIEWS: Record<string, any> = {
  TranslationList,
};

const root = document.getElementById('root');

try {
  if (!root) {
    throw new Error('No root element.');
  }

  const viewName = root.dataset.view;

  if (!viewName) {
    throw new Error('Bad view name. (' + viewName + ')');
  }

  const reactRoot = createRoot(root);
  reactRoot.render(React.createElement(VIEWS[viewName]));
} catch (e) {
  if (root) {
    root.innerHTML = 'ERROR';
  }
  console.error(e);
}
