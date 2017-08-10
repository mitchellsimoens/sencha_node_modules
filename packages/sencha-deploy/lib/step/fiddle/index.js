module.exports = {
    get Base () {
        return require('./Base'); // eslint-disable-line global-require
    },

    get BuildGroups () {
        return require('./BuildGroups'); // eslint-disable-line global-require
    },

    get BuildSQL () {
        return require('./BuildSQL'); // eslint-disable-line global-require
    },

    get GetCreator () {
        return require('./GetCreator'); // eslint-disable-line global-require
    },

    get GetPackage () {
        return require('./GetPackage'); // eslint-disable-line global-require
    }
};
