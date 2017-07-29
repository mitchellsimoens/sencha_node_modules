module.exports = {
    get Adapter () {
        return require('./Adapter'); // eslint-disable-line global-require
    },

    get Operation () {
        return require('./Operation'); // eslint-disable-line global-require
    },

    get Operationable () {
        return require('./Operationable'); // eslint-disable-line global-require
    }
};
