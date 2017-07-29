const { route : { SimpleRoute } } = require('@extjs/sencha-expressjs');

class Require extends SimpleRoute {
    constructor (config = {}) {
        config.dir = 'node_modules/@extjs/sencha-fiddle/views/require.js';

        super(config);
    }
}

module.exports = Require;
