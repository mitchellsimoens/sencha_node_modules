#! /usr/bin/env node

const {
    App,
    error : { FatalError },
    util  : { Logger, Shutdown }
} = require('../');

const app = new App();

Logger.init(app.config.logger.level)
    .then(app.getArguments     .bind(app))
    .then(app.createConnections.bind(app))
    .then(app.run              .bind(app))
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
