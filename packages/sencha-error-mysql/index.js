module.exports = {
    get Adapter () {
        return require('./Adapter'); // eslint-disable-line global-require
    },

    get operation () {
        return require('./operation'); // eslint-disable-line global-require
    }
};
