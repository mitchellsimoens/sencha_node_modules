module.exports = {
    get Connection () {
        return require('./Connection'); // eslint-disable-line global-require
    },

    get Manager () {
        return require('./Manager'); // eslint-disable-line global-require
    }
};
