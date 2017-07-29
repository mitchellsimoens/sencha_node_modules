module.exports = {
    get Issue () {
        return require('./Issue'); // eslint-disable-line global-require
    },

    get Jira () {
        return require('./Jira'); // eslint-disable-line global-require
    }
};
