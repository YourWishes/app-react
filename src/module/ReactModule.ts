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

import { Module, Environment, NPMPackage } from '@yourwishes/app-base';
import { ReactBase, IReactApp } from './../';

import { NextHandleFunction } from 'connect';

import * as express from 'express';
import { Request, Response } from 'express';
import * as path from 'path';

import * as webpack from 'webpack';
import * as webpackHotMiddleware from 'webpack-hot-middleware';
import * as webpackDevMiddleware from 'webpack-dev-middleware';

export class ReactModule extends Module {
  config:webpack.Configuration;
  compiler:webpack.Compiler;
  hotMiddleware:webpackHotMiddleware.EventStream & NextHandleFunction;
  devMiddleware:webpackDevMiddleware.WebpackDevMiddleware & NextHandleFunction;

  app:IReactApp;
  doWatch:boolean=false;

  constructor(app:IReactApp) {
    super(app);
    if(!app.server) throw new Error("Server Module must be defined before the React Module");
  }

  loadPackage():NPMPackage { return require ('./../../package.json'); }

  async init():Promise<void> {
    let { server } = this.app.server;

    //Determine environment type
    let isProduction = this.app.environment === Environment.PRODUCTION;
    if(!isProduction) this.doWatch = true;

    //If development enable hot module server
    if(this.doWatch) {
      this.config = this.app.getCompiler().generateConfiguration(isProduction);
      this.compiler = webpack(this.config);
      this.hotMiddleware = webpackHotMiddleware(this.compiler);
      this.devMiddleware = webpackDevMiddleware(this.compiler);
      server.express.use(this.hotMiddleware);
      server.express.use(this.devMiddleware);
    }

    //Serve Static Files
    server.express.use(express.static(ReactBase));

    //Fallback for "404" handling
    server.express.get('*', (req,res) => this.onAnyGetRequest(req, res));
  }

  async destroy():Promise<void> {
    if(this.devMiddleware) {
      this.devMiddleware.close();
      this.devMiddleware = null;
    }
  }

  onAnyGetRequest(req:Request, res:Response) {
    let file = path.resolve(path.join(ReactBase, 'index.html'));
    res.sendFile(file);
  }
}
