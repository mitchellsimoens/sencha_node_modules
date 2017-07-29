module.exports = {
    get Adapter () {
        return require('./Adapter'); // eslint-disable-line global-require
    },

    get Base () {
        return require('./Base'); // eslint-disable-line global-require
    },

    get Fiddle () {
        return require('./Fiddle'); // eslint-disable-line global-require
    },

    get File () {
        return require('./File'); // eslint-disable-line global-require
    },

    get Framework () {
        return require('./Framework'); // eslint-disable-line global-require
    },

    get Manager () {
        return require('./Manager'); // eslint-disable-line global-require
    },

    get Package () {
        return require('./Package'); // eslint-disable-line global-require
    },

    get Permission () {
        return require('./Permission'); // eslint-disable-line global-require
    },

    get combiner () {
        return {
            get Combiner () {
                return require('./combiner/Combiner'); // eslint-disable-line global-require
            },

            get Fiddle () {
                return require('./combiner/Fiddle'); // eslint-disable-line global-require
            },

            get Framework () {
                return require('./combiner/Framework'); // eslint-disable-line global-require
            },

            get Package () {
                return require('./combiner/Package'); // eslint-disable-line global-require
            }
        };
    }
};
