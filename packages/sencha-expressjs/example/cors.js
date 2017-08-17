const path = require('path');

const { Config }  = require('@extjs/sencha-core');
const { Console } = require('@extjs/sencha-debug');

const Application = require('./cors/Application');

Console.enable();

Config.appRoot = path.join(__dirname, 'cors');

Config
    .read()
    .then( Config => new Application(Config.get()) )
    .catch(console.log);

process.on('unhandledRejection', (err) => {
    console.log(err);
});
