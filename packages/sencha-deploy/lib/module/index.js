module.exports = {
    get base () {
        return require('./Base'); // eslint-disable-line global-require
    },

    get Base () {
        return require('./Base'); // eslint-disable-line global-require
    },

    get fiddle () {
        return require('./Fiddle'); // eslint-disable-line global-require
    },

    get Fiddle () {
        return require('./Fiddle'); // eslint-disable-line global-require
    },

    get nightly () {
        return require('./Nightly'); // eslint-disable-line global-require
    },

    get Nightly () {
        return require('./Nightly'); // eslint-disable-line global-require
    },

    get release () {
        return require('./Release'); // eslint-disable-line global-require
    },

    get Release () {
        return require('./Release'); // eslint-disable-line global-require
    }
};
