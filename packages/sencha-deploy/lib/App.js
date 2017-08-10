const {
    db      : Database,
    error   : { FatalError },
    module  : modules,
    storage : Storage,
    util    : { Args, Config }
} = require('./');

class App {
    constructor () {
        this.args   = new Args(modules);
        this.config = Config.load(this.args.config);
    }

    createConnections () {
        const { database = 'mysql', storage = 's3' } = this.args.arguments || {};

        return Promise
            .all([
                Database.create(database, this.config), Storage.create(storage, this.config)
            ])
            .then((connections) => {
                [ this.database, this.storage ] = connections;
            });
    }

    getArguments () {
        return this.args.getArguments();
    }

    getArgument (key) {
        return this.args.getArgument(key);
    }

    run () {
        const { [ this.args.module ] : Module } = modules;

        if (Module) {
            const module = new Module(this.config);

            return module.run({
                app  : this,
                args : this.args.arguments
            });
        } else {
            throw new FatalError('Module not recognized');
        }
    }
}

module.exports = App;
