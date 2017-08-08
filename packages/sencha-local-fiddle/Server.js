const { Server, route : { Routerable } } = require('@extjs/sencha-expressjs');

const cors = require('cors');
const path = require('path');

class FiddleServer extends Server {
    static get meta () {
        return {
            mixins : [
                Routerable
            ],

            prototype : {
                config : {
                    autoStart : true,
                    port      : 3333,
                    routes    : {
                        '/example/*'  : path.join(__dirname, 'routes/Example'),
                        '/fiddle/*'   : path.join(__dirname, 'routes/Fiddle'),
                        '/reactor.js' : path.join(__dirname, 'routes/Reactor'),
                        '/require.js' : path.join(__dirname, 'routes/Require'),
                        '/'           : path.join(__dirname, 'routes/Index') // eslint-disable-line sort-keys
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
