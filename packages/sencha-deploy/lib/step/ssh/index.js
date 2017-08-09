module.exports = {
    get SSHBase () {
        return require('./SSHBase');
    },
    get SSHExtract () {
        return require('./SSHExtract');
    },

    get SSHPrepare () {
        return require('./SSHPrepare');
    },

    get SSHRunner () {
        return require('./SSHRunner');
    },

    get SSHUpload () {
        return require('./SSHUpload');
    }
};
