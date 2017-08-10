#! /usr/bin/env node

const {
    App,
    error : { FatalError },
    util  : { Logger, Shutdown }
} = require('../');

const { Deferred } = require('@extjs/sencha-core');
const updater      = require('update-notifier');
const pkg          = require('../package.json');

const notifier = new Deferred();

updater({
    callback (error, update) {
        this.update = update;

        // uncomment these lines to test the update notifier
        // these envs are checked by the is-npm module
        // delete process.env.npm_config_username;
        // delete process.env.npm_package_name;
        // delete process.env.npm_config_heading;

        this.notify();

        notifier.resolve();
    },
    pkg
});

const app = new App();

Logger.init(app.config.logger.level)
    .then(app.getArguments     .bind(app)) // eslint-disable-line no-whitespace-before-property
    .then(app.createConnections.bind(app))
    .then(app.run              .bind(app)) // eslint-disable-line no-whitespace-before-property
    .then(() => new Promise((resolve, reject) => {
        // wait for the update deferral to resolve
        notifier.then(resolve, reject);
    }))
    .then(() => {
        const log = app.getArgument('log');

        log && typeof log === 'string' && Logger.toFile(log);
    })
    .then(Shutdown.execCallbacks.bind(Shutdown))
    .catch(error => {
        const errorCode = FatalError.isFatal(error) ? 1 : 0;

        Logger.error(error);

        if (error.stack) {
            Logger.debug(error.stack);
        }

        Logger.info('Exiting with error code', errorCode);

        const log = app.getArgument('log');

        log && typeof log === 'string' && Logger.toFile(log);

        process.exit(errorCode);
    });
