#! /usr/bin/env node

const { Server }  = require('../');

const { Container } = require('switchit');
const { Config }    = require('@extjs/sencha-core');
const { Console }   = require('@extjs/sencha-debug');
const fs            = require('fs');
const JSON5         = require('json5');
const path          = require('path');

require('./Path');

process.on('unhandledRejection', console.log);

Console.enable();

class Fiddle extends Container {
    execute ({ example, reactor, sdk, version }) {
        if (!example) {
            example = process.cwd();
        }

        const pkg = JSON5.parse(fs.readFileSync(path.join(sdk, 'fiddle.json'), 'utf8'));

        Config.appRoot = example;

        Config.set('extjs', Object.assign({
            dir : path.relative(example, sdk)
        }, pkg.extjs));

        Config.set('version', version);

        Config.set('reactor',  reactor);
        Config.set('sdk',      sdk);
        Config.set('examples', path.join(example, 'examples'));

        new Server();
    }
}

Fiddle.define({
    switches : `[example:path] sdk:path [reactor:path] [version:string]`
});

new Fiddle().run();
