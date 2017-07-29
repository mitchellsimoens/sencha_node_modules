module.exports = {
    get asset () {
        return require('./asset'); // eslint-disable-line global-require
    },

    get get () {
        return require('./get'); // eslint-disable-line global-require
    }
};
