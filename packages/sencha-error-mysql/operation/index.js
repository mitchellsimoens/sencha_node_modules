module.exports = {
    get env () {
        return require('./env'); // eslint-disable-line global-require
    },

    get error () {
        return require('./error'); // eslint-disable-line global-require
    },

    get location () {
        return require('./location'); // eslint-disable-line global-require
    }
};
