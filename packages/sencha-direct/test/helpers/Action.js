const { Action } = require('./../../');

module.exports = {
    createRejectAction (ret) {
        return class Foo extends Action {
            handle () {
                return new Promise((resolve, reject) => {
                    reject(ret);
                });
            }
        };
    },

    createResolveAction (ret) {
        return class Foo extends Action {
            handle () {
                return new Promise(resolve => {
                    resolve(ret);
                });
            }
        };
    }
};
