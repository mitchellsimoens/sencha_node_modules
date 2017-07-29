const { Server } = require('@extjs/sencha-expressjs');
const cors       = require('cors');

class FiddleServer extends Server {
    static get meta () {
        return {
            mixins : [
                // '@extjs/sencha-expressjs/feature/BodyParserable',
                '@extjs/sencha-expressjs/route/Routerable'
            ],

            prototype : {
                config : {
                    autoStart : true,
                    port      : 3333,
                    routes    : {
                        '/example/*'  : 'node_modules/@extjs/sencha-local-fiddle/routes/Example',
                        '/fiddle/*'   : 'node_modules/@extjs/sencha-local-fiddle/routes/Fiddle',
                        '/require.js' : 'node_modules/@extjs/sencha-local-fiddle/routes/Require',
                        '/'           : 'node_modules/@extjs/sencha-local-fiddle/routes/Index' // eslint-disable-line sort-keys
                    },
                    settings  : { // eslint-disable-line key-spacing
                        etag          : false,
                        'view engine' : 'pug',
                        views         : 'views'
                    }
                }
            }
        };
    }
}

FiddleServer.addWatcher('before-app', info => {
    info.middlewares.push(cors());
});

module.exports = FiddleServer;
