const WebpackCompiler = require('./dist/private/compiler/WebpackCompiler').WebpackCompiler;

//Create an instance of the compiler
const compiler = new WebpackCompiler();
const config = compiler.generateConfiguration(false);

//Export to webpack cli.
module.exports = config;
