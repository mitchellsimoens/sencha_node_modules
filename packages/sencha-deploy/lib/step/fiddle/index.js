module.exports = {
    get Base () {
        return require('./Base');
    },

    get BuildGroups () {
        return require('./BuildGroups');
    },

    get BuildSQL () {
        return require('./BuildSQL');
    },

    get GetCreator () {
        return require('./GetCreator');
    },

    get GetPackage () {
        return require('./GetPackage');
    }
};
