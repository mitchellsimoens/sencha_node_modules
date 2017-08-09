const { error : { FatalError } } = require('../');

class ValidateArguments {
    execute (runner) {
        const { info } = runner;
        const args     = info.args || (info.args = info.app.args);

        if (!args.version) {
            throw new FatalError('Version is undefined');
        } else if (!args.product) {
            throw new FatalError('Product code is undefined');
        }
    }
}

module.exports = ValidateArguments;
