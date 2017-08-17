const {
    Server,
    feature : {
        BodyParserable,
        Compressable,
        Cookieable,
        Corsable,
        FavIconable,
        SSLForceable
    },
    route   : {
        Routerable
    }
} = require('@extjs/sencha-expressjs');

class SenchaServer extends Server {
    static get meta () {
        return {
            mixins : [
                SSLForceable,
                FavIconable,
                BodyParserable,
                Compressable,
                Cookieable,
                Corsable,
                Routerable
            ]
        };
    }
}

module.exports = SenchaServer;
