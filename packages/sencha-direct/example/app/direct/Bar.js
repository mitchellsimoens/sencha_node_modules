const { Action } = require('../../../');

class Bar extends Action {
    static get meta () {
        return {
            prototype : {
                len : 1
            }
        };
    }

    handle (args) {
        return new Promise(resolve => {
            resolve([ args ]);
        });
    }
}

module.exports = Bar;
