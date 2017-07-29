module.exports = {
    get Adapter () {
        return require('./Adapter'); // eslint-disable-line global-require
    },

    get Forum () {
        return require('./Forum'); // eslint-disable-line global-require
    },

    get Login () {
        return require('./Login'); // eslint-disable-line global-require
    },

    get Manager () {
        return require('./Manager'); // eslint-disable-line global-require
    },

    get Sencha () {
        return require('./Sencha'); // eslint-disable-line global-require
    },

    get combiner () {
        return require('./combiner'); // eslint-disable-line global-require
    }
};
