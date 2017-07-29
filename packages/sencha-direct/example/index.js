const path = require('path');

const { Config }  = require('@extjs/sencha-core');
const { Console } = require('@extjs/sencha-debug');
const Application = require('./app/Application');

Console.enable();

Config.appRoot = path.join(__dirname, 'app');

Config
    .read()
    .then( Config => new Application(Config.get()) )
    .catch(console.log);
