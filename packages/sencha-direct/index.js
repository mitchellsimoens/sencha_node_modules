module.exports = {
    get Action () {
        return require('./Action'); // eslint-disable-line global-require
    },

    get Directable () {
        return require('./Directable'); // eslint-disable-line global-require
    },

    get Manager () {
        return require('./Manager'); // eslint-disable-line global-require
    },

    get Provider () {
        return require('./Provider'); // eslint-disable-line global-require
    },

    get route () {
        return require('./route'); // eslint-disable-line global-require
    }
};
