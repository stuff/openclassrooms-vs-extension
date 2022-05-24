import React from 'react';
import { createRoot } from 'react-dom/client';
import { TranslationList } from '../src/features/translations/views/react/TranslationList';

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

  console.log('VIEW: rendering ->' + viewName);

  const reactRoot = createRoot(root);
  reactRoot.render(React.createElement(VIEWS[viewName]));

  // reactDom.render(React.createElement(VIEWS[viewName]), root);
} catch (e) {
  if (root) {
    root.innerHTML = 'ERROR';
  }
  console.error(e);
}
