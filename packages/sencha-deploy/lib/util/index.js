module.exports = {
    get Args () {
        return require('./Args'); // eslint-disable-line global-require
    },

    get Config () {
        return require('./Config'); // eslint-disable-line global-require
    },

    get Logger () {
        return require('./Logger'); // eslint-disable-line global-require
    },

    get Progress () {
        return require('./Progress'); // eslint-disable-line global-require
    },

    get Runner () {
        return require('./Runner'); // eslint-disable-line global-require
    },

    get Shutdown () {
        return require('./Shutdown'); // eslint-disable-line global-require
    },

    get Version () {
        return require('./Version'); // eslint-disable-line global-require
    }
};
