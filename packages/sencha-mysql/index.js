module.exports = {
    get Batch () {
        return require('./Batch'); // eslint-disable-line global-require
    },

    get Connection () {
        return require('./Connection'); // eslint-disable-line global-require
    },

    get DBable () {
        return require('./DBable'); // eslint-disable-line global-require
    },

    get Manager () {
        return require('./Manager'); // eslint-disable-line global-require
    },

    get Query () {
        return require('./Query'); // eslint-disable-line global-require
    }
};
