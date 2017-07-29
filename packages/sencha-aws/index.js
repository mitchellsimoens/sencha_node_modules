module.exports = {
    get AWS () {
        return require('./AWS'); // eslint-disable-line global-require
    },

    get S3 () {
        return require('./S3'); // eslint-disable-line global-require
    }
};
