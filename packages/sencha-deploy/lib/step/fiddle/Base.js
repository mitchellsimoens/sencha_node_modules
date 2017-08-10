class Base {
    getDatabase (which = 'ext_support') {
        const { env : { NODE_ENV } } = process;

        if (!NODE_ENV || NODE_ENV.toLowerCase() === 'production') {
            return which;
        } else {
            return `${which}_test`;
        }
    }
}

module.exports = Base;
