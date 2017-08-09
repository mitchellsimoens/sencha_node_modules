module.exports = {
    get GetOldNightlies () {
        return require('./GetOldNightlies');
    },

    get RemoveFromDatabase () {
        return require('./RemoveFromDatabase');
    },

    get RemoveFromStorage () {
        return require('./RemoveFromStorage');
    }
};
