const { route : { SimpleRoute } } = require('@extjs/sencha-expressjs');

const path = require('path');

class Require extends SimpleRoute {
    constructor (config = {}) {
        config.dir = path.join(__dirname, '../node_modules/@extjs/sencha-fiddle/views/require.js');

        super(config);
    }
}

module.exports = Require;
