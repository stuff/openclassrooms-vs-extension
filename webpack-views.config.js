/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
//@ts-check

'use strict';

const path = require('path');
// const webpack = require('webpack');

/**@type {import('webpack').Configuration}*/
const config = {
  entry: './views/index.ts',
  devtool: 'inline-source-map',
  output: {
    filename: 'views.js',
    path: path.resolve(__dirname, 'dist/views'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            // options: {
            //   compilerOptions: {
            //     module: 'es6', // override `tsconfig.json` so that TypeScript emits native JavaScript modules.
            //   },
            // },
          },
        ],
      },
    ],
  },
};

// eslint-disable-next-line no-undef
module.exports = config;
