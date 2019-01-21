// Copyright (c) 2019 Dominic Masters
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import * as webpack from 'webpack';

import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as SharpLoader from 'responsive-loader/sharp';
import * as TerserPlugin from 'terser-webpack-plugin';
import * as OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';

import { AppRoot, ReactBase, ReactSource } from './../';

export class WebpackCompiler {
  constructor() {

  }

  generateConfiguration(isProduction:boolean=true) {
    //Generaconfigte the base configuration
    let config:webpack.Configuration = {
      devtool: isProduction ? 'source-map' : 'cheap-module-eval-source-map',
      mode: isProduction ? 'production' : 'development',

      plugins: [],
      entry: [ `${ReactSource}/index.tsx` ],

      output: {
        path: ReactBase, filename: 'app.js', publicPath: '/'
      },

      resolve: {
        modules: [ `${AppRoot}/node_modules`, ReactSource ],
        extensions: ['.ts.', '.tsx', '.js', '.jsx', '.json', '.css', '.scss'],
        alias: { /* TODO: Get Aliases Here */ }
      },

      module: {
        rules: [
          //Typescript pre-compiler
          {
            test: /\.tsx?$/,
            loader: "awesome-typescript-loader",
            options: {
              jsx: 'react',
              configFileName: `${ReactSource}/tsconfig.json`,
              useBabel: true, babelCore: "@babel/core",
              babelOptions: {
                "babelrc": false,
                "presets": [
                  [ "@babel/preset-env", {
                    "targets": {
                      "node": "current",
                      "browsers": [ "Chrome >= 41", "FireFox >= 44", "Safari >= 7", "Explorer 11", "last 2 Edge versions" ]
                    }, "useBuiltIns": false
                  } ]
                ]
              }
            }
          },

          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader?cacheDirectory',
              options: {
                presets: [
                  [
                    "@babel/preset-env",
                    {
                      "targets": {
                        "node": "current",
                        "browsers": [ "Chrome >= 41", "FireFox >= 44", "Safari >= 7", "Explorer 11", "last 2 Edge versions" ]
                      },
                      "useBuiltIns": false
                    }
                  ],
                  "@babel/preset-react"
                ],
                "plugins": [ '@babel/plugin-syntax-dynamic-import' ]
              }
            }
          },

          //TS Sourcemap loader
          { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },

          //Style Loader
          {
            test: /\.scss$|\.css$/i,
            exclude: /node_modules/,
            use: isProduction ? (
              [ MiniCssExtractPlugin.loader, "css-loader", 'sass-loader' ]
            ) : (
              [ "style-loader", "css-loader", 'sass-loader' ]
            )
          },

          //File Loader
          {
            test: /\.svg$|\.webm$|\.mp4$/i,
            exclude: /node_modules/,
            use: [{
              loader: "file-loader",
              options: { name: "[path][name].[ext]", context: 'public' }
            }]
          },

          //Responsive Image Loader
          {
            test: /\.jpe?g$|\.gif$|\.png$/i,
            exclude: /node_modules/,
            use: [{
              loader: "responsive-loader",
              options: {
                adapter: SharpLoader,
                sizes: [500, 1000, 2500],
                name: "[path][name]_[width]x.[ext]",
                context: 'public'
              }
            }]
          },

          //URL Loader
          {
            test: /\.(eot|ttf|woff(2)?)(\?v=\d+\.\d+\.\d+)?/,
            loader: 'url-loader'
          }
        ]
      }
    };


    /*** Plugins ***/

    //HTML Plugin (For bundling the JS into the HTML)
    config.plugins.push(new HtmlWebpackPlugin({
      template: `${ReactSource}/index.html`,
      filename: 'index.html',
      inject: true
    }));

    //DefinePlugin (For sending constant variables to the compiled JS)
    config.plugins.push(new webpack.DefinePlugin({
      PRODUCTION: isProduction
    }));

    if(isProduction) {
      //Production ONLY Plugins
      let TerserPluginConfig = new TerserPlugin({
        test: /\.js($|\?)/i,
        cache: true,
        parallel: true,
      });

      let MiniCssExtractConfig = new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[id].css"
      });

      config.optimization = {
        minimize: true,
        minimizer: [
          TerserPluginConfig,
          MiniCssExtractConfig,
          new OptimizeCSSAssetsPlugin({}),
        ]
      };
    } else {
      //Development only plugins
    }


    //Return the config
    return config;
  }
}
