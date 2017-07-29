module.exports = {
    get BBCode () {
        return require('./BBCode'); // eslint-disable-line global-require
    },

    get TagInfo () {
        return require('./TagInfo'); // eslint-disable-line global-require
    }
};
