module.exports = {
    get Adapter () {
        return require('./Adapter'); // eslint-disable-line global-require
    },

    get Error () {
        return require('./Error'); // eslint-disable-line global-require
    },

    get Manager () {
        return require('./Manager'); // eslint-disable-line global-require
    },

    get combiner () {
        return require('./combiner/'); // eslint-disable-line global-require
    }
};
