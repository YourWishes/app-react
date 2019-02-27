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
import { ReactModule } from './../';

export class WebpackWatcher {
  react:ReactModule;
  compiler:webpack.Compiler;
  socket:any;

  constructor(react:ReactModule, compiler:webpack.Compiler) {
    this.react = react;
    this.compiler = compiler;
    this.compiler.watch({}, (e,stats) => this.onCompile(e,stats));

    //Is socket available?
    let a = this.react.app as any;
    if(typeof a === typeof undefined || typeof a.socket === typeof undefined) {
      this.react.logger.info('Webpack watcher is running, however a socket server module was not found. Autoreload will not work.');
    } else {
      this.socket = a.socket;
      this.react.logger.info('Webpack Watcher is running.');
    }
  }

  run() {
    this.compiler.run((e,stats) => this.onCompile(e,stats));
  }

  onCompile(e:Error, stats:webpack.Stats) {
    if(e) {
      this.react.logger.severe(e);
      return;
    }

    this.react.logger.info('Compiled.');
    this.react.logger.debug(stats.toString());

    //Force a browser refresh, but we have to assume our app supports refreshing
    if(typeof this.socket !== typeof undefined) {
      this.socket.sockets.forEach(socket => {
        let code = 200;

        try {
          let s = require('@yourwishes/app-api');
          if(s.RESPONSE_OK) code = s.RESPONSE_OK;
        } catch(e) {}

        socket.send({ path:'/socket/reload', code });
      });
    }
  }
}
