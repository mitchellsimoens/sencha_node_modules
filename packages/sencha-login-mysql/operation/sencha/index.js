module.exports = {
    get get () {
        return require('./get'); // eslint-disable-line global-require
    },

    get save () {
        return require('./save'); // eslint-disable-line global-require
    }
};
