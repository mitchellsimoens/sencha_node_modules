const { Email } = require('../../');

module.exports = {
    createEmail (config) {
        return new Email(config);
    }
};
