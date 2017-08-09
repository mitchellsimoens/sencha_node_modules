const { ExtendableError } = require('./');

class FatalError extends ExtendableError {
    constructor (message) {
        let stack;

        if (message) {
            stack = message.stack; // eslint-disable-line prefer-destructuring

            if (message instanceof Error) {
                message = message.message; // eslint-disable-line prefer-destructuring
            }
        }

        super(message);

        if (stack) {
            this.stack = stack;
        }

        this.isFatal = true;
    }

    static isFatal (error) {
        return error && (error.isFatal || error instanceof FatalError)
    }
}

module.exports = FatalError;
