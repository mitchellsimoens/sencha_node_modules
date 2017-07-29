module.exports = {
    get Base () {
        return require('./Base'); // eslint-disable-line global-require
    },

    get Example () {
        return require('./Example'); // eslint-disable-line global-require
    },

    get Fiddle () {
        return require('./Fiddle'); // eslint-disable-line global-require
    }
};
