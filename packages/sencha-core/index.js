module.exports = {
    get Base () {
        return require('./Base'); // eslint-disable-line global-require
    },

    get Class () {
        return require('./Class'); // eslint-disable-line global-require
    },

    get ClassMixin () {
        return require('./ClassMixin'); // eslint-disable-line global-require
    },

    get Config () {
        return require('./Config'); // eslint-disable-line global-require
    },

    get Deferrable () {
        return require('./Deferrable'); // eslint-disable-line global-require
    },

    get Deferred () {
        return require('./Deferred'); // eslint-disable-line global-require
    },

    get Managerable () {
        return require('./Managerable'); // eslint-disable-line global-require
    },

    get Mixin () {
        return require('./Mixin'); // eslint-disable-line global-require
    },

    get combiner () {
        return require('./combiner'); // eslint-disable-line global-require
    },

    get event () {
        return require('./event'); // eslint-disable-line global-require
    },

    get operation () {
        return require('./operation'); // eslint-disable-line global-require
    }
};
