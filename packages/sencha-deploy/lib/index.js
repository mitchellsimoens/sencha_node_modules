module.exports = {
    get App () {
        return require('./App');
    },

    get db () {
        return require('./db');
    },

    get error () {
        return require('./error');
    },

    get module () {
        return require('./module');
    },

    get step () {
        return require('./step');
    },

    get storage () {
        return require('./storage');
    },

    get transfer () {
        return require('./transfer');
    },

    get util () {
        return require('./util');
    }
};
