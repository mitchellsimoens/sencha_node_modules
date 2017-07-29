const { Server } = require('@extjs/sencha-expressjs');

class SenchaServer extends Server {
    static get meta () {
        return {
            mixins : [
                '@extjs/sencha-expressjs/feature/BodyParserable',
                '@extjs/sencha-expressjs/route/Routerable'
            ]
        };
    }
}

module.exports = SenchaServer;
