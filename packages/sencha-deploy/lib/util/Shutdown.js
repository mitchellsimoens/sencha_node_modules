const {
    error : { FatalError },
    util  : { Logger }
} = require('../');

const testEnvRe = /^test/i;

class Shutdown {
    constructor () {
        const execCallbacks = this.execCallbacks.bind(this);
        const uncaught      = this.onUncaught   .bind(this); // eslint-disable-line no-whitespace-before-property

        this.callbacks = [];

        // register for shutdown events
        process.on('SIGINT',  execCallbacks);
        process.on('SIGTERM', execCallbacks);
        process.on('SIGHUP',  execCallbacks);

        process.on('uncaughtException',  uncaught);
        process.on('unhandledRejection', uncaught);
    }

    onShutdown (callback) {
        this.callbacks.push(callback);
    }

    onUncaught (error) {
        if (!testEnvRe.test(process.env.NODE_ENV)) {
            const errorCode = FatalError.isFatal(error) ? 1 : 0;

            Logger.error('uncaught', error);

            process.exit(errorCode);
        }
    }

    execCallbacks () {
        Logger.info('Process', process.pid, 'shutting down...');

        return Promise
            .all(this.callbacks.map(callback => callback()))
            .then(this.doExit, this.doExit);
    }

    doExit () {
        Logger.info('Process', process.pid, 'shut down');
    }
}

module.exports = new Shutdown();
