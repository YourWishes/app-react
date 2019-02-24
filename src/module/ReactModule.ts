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

import { ServerModule } from '@yourwishes/app-server';
import { IReactApp } from './../app/';
import { ReactBase } from './../';

import * as express from 'express';
import { Request, Response } from 'express';
import * as path from 'path';

export class ReactModule extends ServerModule {
  app:IReactApp;

  constructor(app:IReactApp) {
    super(app);
  }

  async init():Promise<void> {
    await super.init();

    //Serve Static Files
    this.express.use(express.static(ReactBase));

    //Fallback for "404" handling
    this.express.get('*', (req,res) => this.onGetRequest(req, res));
  }

  onGetRequest(req:Request, res:Response) {
    let file = path.resolve(path.join(ReactBase, 'index.html'));
    res.sendFile(file);
  }
}
