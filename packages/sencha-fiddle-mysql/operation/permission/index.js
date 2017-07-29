module.exports = {
    get fiddle () {
        return require('./fiddle'); // eslint-disable-line global-require
    },

    get team () {
        return require('./team'); // eslint-disable-line global-require
    }
};
