module.exports = {
    get Server () {
        return require('./Server'); // eslint-disable-line global-require
    },

    get fiddle () {
        return require('./fiddle'); // eslint-disable-line global-require
    },

    get routes () {
        return require('./routes'); // eslint-disable-line global-require
    }
};
