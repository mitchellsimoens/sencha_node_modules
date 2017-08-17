module.exports =  {
    get BodyParserable () {
        return require('./BodyParserable'); // eslint-disable-line global-require
    },

    get Compressable () {
        return require('./Compressable'); // eslint-disable-line global-require
    },

    get Cookieable () {
        return require('./Cookieable'); // eslint-disable-line global-require
    },

    get Corsable () {
        return require('./Corsable'); // eslint-disable-line global-require
    },

    get Expressable () {
        return require('./Expressable'); // eslint-disable-line global-require
    },

    get FavIconable () {
        return require('./FavIconable'); // eslint-disable-line global-require
    },

    get Minifyable () {
        return require('./Minifyable'); // eslint-disable-line global-require
    },

    get Multerable () {
        return require('./Multerable'); // eslint-disable-line global-require
    },

    get SSLForceable () {
        return require('./SSLForceable'); // eslint-disable-line global-require
    },

    get SocketIOable () {
        return require('./SocketIOable'); // eslint-disable-line global-require
    }
};
