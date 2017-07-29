
module.exports = {
    get Express () {
        return require('./Express'); // eslint-disable-line global-require
    },

    get Mixin () {
        return require('./Mixin'); // eslint-disable-line global-require
    }
};
