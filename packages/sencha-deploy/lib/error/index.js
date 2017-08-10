module.exports = {
    get ExtendableError () {
        return require('./ExtendableError'); // eslint-disable-line global-require
    },

    get FatalError () {
        return require('./FatalError'); // eslint-disable-line global-require
    }
};
