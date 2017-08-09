class ExtendableError extends Error {
    constructor (message, fileName, lineNumber) {
        super(message, fileName, lineNumber);

        this.name    = this.constructor.name;
        this.message = message;

        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }
}

module.exports = ExtendableError;
