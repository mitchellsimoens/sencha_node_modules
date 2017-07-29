module.exports = {
    get Manager () {
        return require('./Manager'); // eslint-disable-line global-require
    },

    api : {
        get Key () {
            return require('./api/Key'); // eslint-disable-line global-require
        },

        get Token () {
            return require('./api/Token'); // eslint-disable-line global-require
        }
    }
};
