export * from './app/';
export * from './module/';
export * from './compiler/';

//TODO: I need to be able to get these folders from the tsconfig somehow
import * as path from 'path';
export const AppRoot = path.resolve(`./`);//The directory the CLI is running from
export const ReactBase = path.resolve(`${AppRoot}/dist/public`);//The Dist folder root
export const ReactSource = path.resolve(`${AppRoot}/src/public`);//The source folder (has index.html)
