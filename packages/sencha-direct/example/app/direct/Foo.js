const { Action } = require('../../../');

class Foo extends Action {
    handle (args, params, extra) {
        console.log(args);
        console.log(params);
        console.log(extra);

        return new Promise(resolve => {
            resolve([ 'foo' ]);
        });
    }
}

module.exports = Foo;
