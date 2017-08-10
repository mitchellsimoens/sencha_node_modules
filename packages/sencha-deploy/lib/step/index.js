module.exports = {
    get CDN () {
        return require('./CDN'); // eslint-disable-line global-require
    },

    get CheckProductExistence () {
        return require('./CheckProductExistence'); // eslint-disable-line global-require
    },

    get GetProduct () {
        return require('./GetProduct'); // eslint-disable-line global-require
    },

    get HashFile () {
        return require('./HashFile'); // eslint-disable-line global-require
    },

    get PruneNightly () {
        return require('./PruneNightly'); // eslint-disable-line global-require
    },

    get QA () {
        return require('./QA'); // eslint-disable-line global-require
    },

    get SaveToDatabase () {
        return require('./SaveToDatabase'); // eslint-disable-line global-require
    },

    get SaveToStorage () {
        return require('./SaveToStorage'); // eslint-disable-line global-require
    },

    get ValidateArguments () {
        return require('./ValidateArguments'); // eslint-disable-line global-require
    },

    get fiddle () {
        return require('./fiddle/'); // eslint-disable-line global-require
    },

    get nightly () {
        return require('./nightly/'); // eslint-disable-line global-require
    },

    get ssh () {
        return require('./ssh/'); // eslint-disable-line global-require
    }
};
