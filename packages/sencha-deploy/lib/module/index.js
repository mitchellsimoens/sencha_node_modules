module.exports = {
    get Base () {
        return require('./Base'); // eslint-disable-line global-require
    },

    get Fiddle () {
        return require('./Fiddle'); // eslint-disable-line global-require
    },

    get Nightly () {
        return require('./Nightly'); // eslint-disable-line global-require
    },

    get Release () {
        return require('./Release'); // eslint-disable-line global-require
    },

    get base () {
        return this.Base;
    },

    get fiddle () {
        return this.Fiddle;
    },

    get nightly () {
        return this.Nightly;
    },

    get release () {
        return this.Release;
    }
};
