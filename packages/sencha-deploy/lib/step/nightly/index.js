module.exports = {
    get GetOldNightlies () {
        return require('./GetOldNightlies'); // eslint-disable-line global-require
    },

    get RemoveFromDatabase () {
        return require('./RemoveFromDatabase'); // eslint-disable-line global-require
    },

    get RemoveFromStorage () {
        return require('./RemoveFromStorage'); // eslint-disable-line global-require
    }
};
