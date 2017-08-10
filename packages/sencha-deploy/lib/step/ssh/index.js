module.exports = {
    get SSHBase () {
        return require('./SSHBase'); // eslint-disable-line global-require
    },
    get SSHExtract () {
        return require('./SSHExtract'); // eslint-disable-line global-require
    },

    get SSHPrepare () {
        return require('./SSHPrepare'); // eslint-disable-line global-require
    },

    get SSHRunner () {
        return require('./SSHRunner'); // eslint-disable-line global-require
    },

    get SSHUpload () {
        return require('./SSHUpload'); // eslint-disable-line global-require
    }
};
