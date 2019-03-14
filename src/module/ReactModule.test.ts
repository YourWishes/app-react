import { ReactModule, IReactApp, WebpackCompiler } from './../';
import { ServerModule, IServerApp } from '@yourwishes/app-server';
import { App } from '@yourwishes/app-base';

class DummyReactApp extends App implements IReactApp {
  server:ServerModule;
  react:ReactModule;

  constructor() { super(); }
  getCompiler():WebpackCompiler { return null; }
}

const DummyApp = new DummyReactApp();
DummyApp.server = new ServerModule(DummyApp);

describe('ReactModule', () => {
  it('should require the server module to be defined', () => {
    expect(() => new ReactModule(new DummyReactApp())).toThrow();
  });

  it('should be constructable', () => {
    expect(() => new ReactModule(DummyApp)).not.toThrow();
  });
});

describe('getPackage', () => {
  let module = new ReactModule(DummyApp);

  it('should return the package json', () => {
    expect(module.package).toHaveProperty('name', '@yourwishes/app-react');
  });
});
