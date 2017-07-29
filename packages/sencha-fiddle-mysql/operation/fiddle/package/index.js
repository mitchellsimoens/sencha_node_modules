module.exports = {
    get create () {
        return require('./create'); // eslint-disable-line global-require
    },

    get delete () {
        return require('./delete'); // eslint-disable-line global-require
    },

    get update () {
        return require('./update'); // eslint-disable-line global-require
    }
};
