module.exports = {
    get BaseRoute () {
        return require('./BaseRoute'); // eslint-disable-line global-require
    },

    get ProxyRoute () {
        return require('./ProxyRoute'); // eslint-disable-line global-require
    },

    get Route () {
        return require('./Route'); // eslint-disable-line global-require
    },

    get Router () {
        return require('./Router'); // eslint-disable-line global-require
    },

    get Routerable () {
        return require('./Routerable'); // eslint-disable-line global-require
    },

    get SimpleRoute () {
        return require('./SimpleRoute'); // eslint-disable-line global-require
    },

    get UglifyRoute () {
        return require('./UglifyRoute'); // eslint-disable-line global-require
    }
};
