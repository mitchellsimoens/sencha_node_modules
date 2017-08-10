module.exports = {
    get App () {
        return require('./App'); // eslint-disable-line global-require
    },

    get db () {
        return require('./db'); // eslint-disable-line global-require
    },

    get error () {
        return require('./error'); // eslint-disable-line global-require
    },

    get module () {
        return require('./module'); // eslint-disable-line global-require
    },

    get step () {
        return require('./step'); // eslint-disable-line global-require
    },

    get storage () {
        return require('./storage'); // eslint-disable-line global-require
    },

    get transfer () {
        return require('./transfer'); // eslint-disable-line global-require
    },

    get util () {
        return require('./util'); // eslint-disable-line global-require
    }
};
