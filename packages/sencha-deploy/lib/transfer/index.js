module.exports = {
    get Base () {
        return require('./Base'); // eslint-disable-line global-require
    },

    get Rsync () {
        return require('./Rsync'); // eslint-disable-line global-require
    },

    get SCP2 () {
        return require('./SCP2'); // eslint-disable-line global-require
    },

    get SSH () {
        return require('./SSH'); // eslint-disable-line global-require
    }
};
