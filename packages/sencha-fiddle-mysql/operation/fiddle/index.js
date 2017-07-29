module.exports = {
    get asset () {
        return require('./asset'); // eslint-disable-line global-require
    },

    get create () {
        return require('./create'); // eslint-disable-line global-require
    },

    get get () {
        return require('./get'); // eslint-disable-line global-require
    },

    get mockdata () {
        return require('./mockdata'); // eslint-disable-line global-require
    },

    get package () {
        return require('./package'); // eslint-disable-line global-require
    },

    get update () {
        return require('./update'); // eslint-disable-line global-require
    }
};
