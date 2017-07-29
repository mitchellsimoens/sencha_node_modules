module.exports = {
    get Endpoint () {
        return require('./Endpoint'); // eslint-disable-line global-require
    },

    get Manager () {
        return require('./Manager'); // eslint-disable-line global-require
    }
};
