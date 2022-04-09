/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const extensionConfig = require('./webpack-extension.config');
const viewsConfig = require('./webpack-views.config');

module.exports = [viewsConfig, extensionConfig];
