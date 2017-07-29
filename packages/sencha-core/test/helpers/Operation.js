const path = require('path');

module.exports = {
    getOperation (name) {
        return require(path.join(__dirname, 'operation', name.replace('.', '/')));
    }
};
