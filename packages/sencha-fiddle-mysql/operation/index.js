module.exports = {
    get fiddle () {
        return require('./fiddle'); // eslint-disable-line global-require
    },

    get framework () {
        return require('./framework'); // eslint-disable-line global-require
    },

    get permission () {
        return require('./permission'); // eslint-disable-line global-require
    }
};
