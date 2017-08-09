module.exports = {
    get CDN () {
        return require('./CDN');
    },

    get CheckProductExistence () {
        return require('./CheckProductExistence');
    },

    get CheckUpdate () {
        return require('./CheckUpdate');
    },

    get GetProduct () {
        return require('./GetProduct');
    },

    get HashFile () {
        return require('./HashFile');
    },

    get PruneNightly () {
        return require('./PruneNightly');
    },

    get QA () {
        return require('./QA');
    },

    get SaveToDatabase () {
        return require('./SaveToDatabase');
    },

    get SaveToStorage () {
        return require('./SaveToStorage');
    },

    get ValidateArguments () {
        return require('./ValidateArguments');
    },

    get fiddle () {
        return require('./fiddle/');
    },

    get nightly () {
        return require('./nightly/');
    },

    get ssh () {
        return require('./ssh/');
    }
};
