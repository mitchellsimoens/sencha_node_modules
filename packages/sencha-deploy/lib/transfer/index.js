module.exports = {
    get Base () {
        return require('./Base');
    },

    get Rsync () {
        return require('./Rsync');
    },

    get SCP2 () {
        return require('./SCP2');
    },

    get SSH () {
        return require('./SSH');
    }
};
