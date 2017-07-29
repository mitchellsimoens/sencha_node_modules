module.exports = {
    get Email () {
        return require('./Email'); // eslint-disable-line global-require
    },

    get Manager () {
        return require('./Manager'); // eslint-disable-line global-require
    },

    get Provider () {
        return require('./Provider'); // eslint-disable-line global-require
    }
};
