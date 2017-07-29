module.exports = {
    get Application () {
        return require('./Application'); // eslint-disable-line global-require
    },

    get Controller () {
        return require('./Controller'); // eslint-disable-line global-require
    }
};
