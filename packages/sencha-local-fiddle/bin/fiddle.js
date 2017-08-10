#! /usr/bin/env node

const { Server }  = require('../');

const { Container }        = require('switchit');
const { Config, Deferred } = require('@extjs/sencha-core');
const { Console }          = require('@extjs/sencha-debug');
const fs                   = require('fs');
const JSON5                = require('json5');
const path                 = require('path');
const updater              = require('update-notifier');
const pkg                  = require('../package.json');

require('./Path');

const notifier = new Deferred();

updater({
    callback (error, update) {
        this.update = update;

        // uncomment these lines to test the update notifier
        // these envs are checked by the is-npm module
        delete process.env.npm_config_username;
        delete process.env.npm_package_name;
        delete process.env.npm_config_heading;

        if (update && update.type !== 'latest') {
            this.notify();
        }

        notifier.resolve();
    },
    pkg
});

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

new Fiddle()
    .run()
    .then(() => new Promise((resolve, reject) => {
        // wait for the update deferral to resolve
        notifier.then(resolve, reject);
    }));
