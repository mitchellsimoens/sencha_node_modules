module.exports = {
    get Listener () {
        return require('./Listener'); // eslint-disable-line global-require
    },

    get Observable () {
        return require('./Observable'); // eslint-disable-line global-require
    }
};
