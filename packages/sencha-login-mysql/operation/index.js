module.exports = {
    get forum () {
        return require('./forum'); // eslint-disable-line global-require
    },

    get login () {
        return require('./login'); // eslint-disable-line global-require
    },

    get sencha () {
        return require('./sencha'); // eslint-disable-line global-require
    }
};
