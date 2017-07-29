module.exports = {
    get Response () {
        return require('./Response'); // eslint-disable-line global-require
    },

    get SSLServer () {
        return require('./SSLServer'); // eslint-disable-line global-require
    },

    get Server () {
        return require('./Server'); // eslint-disable-line global-require
    },

    get feature () {
        return require('./feature'); // eslint-disable-line global-require
    },

    get route () {
        return require('./route'); // eslint-disable-line global-require
    }
};
