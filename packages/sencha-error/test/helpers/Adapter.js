const { Adapter } = require('../../');

module.exports = {
    createAdapter ( { getSpy, instantiateSpy, callThru = false, env, error, location } ) {
        class FakeAdapter extends Adapter {
            static get meta () {
                return {
                    prototype : {
                        rootPath : __dirname
                    }
                };
            }

            get operations () {
                const ops = super.operations;

                if (env) {
                    ops[ 'env.save' ] = env;
                }

                if (error) {
                    ops[ 'error.save' ] = error;
                }

                if (location) {
                    ops[ 'location.save' ] = location;
                }

                return ops;
            }

            getOperation (...args) {
                if (getSpy) {
                    getSpy.call(this, ...args);
                }

                if (callThru) {
                    return super.getOperation(...args);
                }
            }

            instantiateOperation (...args) {
                if (instantiateSpy) {
                    instantiateSpy.call(this, ...args);
                }

                if (callThru) {
                    return super.instantiateOperation(...args);
                }
            }
        }

        return new FakeAdapter();
    }
};
