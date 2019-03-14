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
import { ReactBase, IReactApp, WebpackWatcher } from './../';

import * as express from 'express';
import { Request, Response } from 'express';
import * as path from 'path';

export const CONFIG_DEVELOPMENT = 'server.watch';

export class ReactModule extends Module {
  watcher:WebpackWatcher;
  app:IReactApp;

  constructor(app:IReactApp) {
    if(!app.server) throw new Error("Server Module must be defined before the React Module");
    super(app);
  }

  getPackage():NPMPackage { return require ('./../../package.json'); }

  async init():Promise<void> {
    let { server } = this.app.server;

    //Serve Static Files
    server.express.use(express.static(ReactBase));

    //Fallback for "404" handling
    server.express.get('*', (req,res) => this.onAnyGetRequest(req, res));

    //Development watcher
    if(this.app.config.get(CONFIG_DEVELOPMENT)) {
      this.watcher = this.app.getCompiler().createWatcher(this, this.app.environment === Environment.PRODUCTION);
    }
  }

  async destroy():Promise<void> {

  }

  onAnyGetRequest(req:Request, res:Response) {
    let file = path.resolve(path.join(ReactBase, 'index.html'));
    res.sendFile(file);
  }
}
