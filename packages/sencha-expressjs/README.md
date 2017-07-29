# sencha-expressjs

Module to enable starting an [Express](http://expressjs.com/) server and work with routes.

## Starting a simple server

    const { Server } = require('@extjs/sencha-expressjs');

    new Server({
        host : 'foo.com',
        port : 3000
    });

*for an SSL Server, please see below*

By default, the server will not start listening. There are a couple different ways to do this.
The first way is to use the `autoStart` and `autoListen` configs.

The `autoStart` config defaults to `false`, if set to `true` will execute the server's `start`
method. This method simply creates the Express application instance. This method will check
the `autoListen` config to start listening (more on that soon).

    const { Server } = require('@extjs/sencha-expressjs');

    new Server({
        autoStart : true,
        host      : 'foo.com',
        port      : 3000
    });

This now creates the Express application instance and will even start listening. This is because
`autoListen` defaults to `true`. The other way to automatically start the server is to execute
the `start` method:

    const { Server } = require('@extjs/sencha-expressjs');

    let server = new Server({
        host : 'foo.com',
        port : 3000
    });

    server.start();

As said before, `autoListen` defaults to `true` which means once the server is started, the server
will start listening. If the `autoListen` config is set to `false`, you can then execute the
`listen` method:

    const { Server } = require('@extjs/sencha-expressjs');

    let server = new Server({
        autoListen : false,
        autoStart  : true,
        host       : 'foo.com',
        port       : 3000
    });

    server.listen();

## Mixins

By default, starting a server is a vanilla server, to enable other functionality there are
several mixins that can be mixed into the server.

### [body-parser](https://www.npmjs.com/package/body-parser) module

To enable the [body-paser](https://www.npmjs.com/package/body-parser) module, you can use the
`BodyParserable` mixin along with the `bodyParser` config that is added to the server:

    const { Server } = require('@extjs/sencha-expressjs');

    class MyServer extends Server {
        static get meta () {
            return {
                mixins : [
                    '@extjs/sencha-expressjs/feature/BodyParserable'
                ]
            };
        }
    }

    new MyServer({
        autoStart  : true,
        host       : 'foo.com',
        port       : 3000,
        bodyParser : {
            json       : {
                limit : '50kb'
            },
            urlencoded : {
                extended : true
            }
        }
    });

Each key in the `bodyParser` config should match the method on the `body-parser` module. The
object that key is set to is the options that will be passed to that method. So the `json`
key will then be executed internally like:

    const bodyParser = require('body-parser');

    bodyParse.json(config);

### [compression](https://www.npmjs.com/package/compression) module

To enable the [compression](https://www.npmjs.com/package/compression) module, you can use the
`Compressable` mixin along with the `compress` config that is added to the server:

    const { Server } = require('@extjs/sencha-expressjs');

    class MyServer extends Server {
        static get meta () {
            return {
                mixins : [
                    '@extjs/sencha-expressjs/feature/Compressable'
                ]
            };
        }
    }

    new MyServer({
        autoStart : true,
        host      : 'foo.com',
        port      : 3000,
        compress  : {
            level  : 1
        }
    });

### [cookie-parser](https://www.npmjs.com/package/cookie-parser) module

To enable the [cookie-parser](https://www.npmjs.com/package/cookie-parser) module, you can use the
`Cookieable` mixin along with the `cookie` config that is added to the server:

    const { Server } = require('@extjs/sencha-expressjs');

    class MyServer extends Server {
        static get meta () {
            return {
                mixins : [
                    '@extjs/sencha-expressjs/feature/Cookieable'
                ]
            };
        }
    }

    new MyServer({
        autoStart : true,
        host      : 'foo.com',
        port      : 3000,
        cookie    : {
            secret  : 'somesecretkey',
            options : {
                decode : function(cookie) {
                    return cookie;
                }
            }
        }
    });

### [serve-favicon](https://www.npmjs.com/package/serve-favicon) module

To enable the [serve-favicon](https://www.npmjs.com/package/serve-favicon) module, you can use the
`FavIconable` mixin along with the `favicon` config that is added to the server:

    const { Server } = require('@extjs/sencha-expressjs');

    class MyServer extends Server {
        static get meta () {
            return {
                mixins : [
                    '@extjs/sencha-expressjs/feature/FavIconable'
                ]
            };
        }
    }

    new MyServer({
        autoStart : true,
        host      : 'foo.com',
        port      : 3000,
        favicon   : __dirname + '/favicon.ico'
    });

### [multer](https://www.npmjs.com/package/multer) module

To enable the [multer](https://www.npmjs.com/package/multer) module, you can use the
`Multerable` mixin along with the `multer` config that is added to the server:

    const { Server } = require('@extjs/sencha-expressjs');

    class MyServer extends Server {
        static get meta () {
            return {
                mixins : [
                    '@extjs/sencha-expressjs/feature/Multerable'
                ]
            };
        }
    }

    new MyServer({
        autoStart : true,
        host      : 'foo.com',
        port      : 3000,
        multer    : {
            dest : __dirname + '/tmp' //defaults to require('os').tmpdir()
        }
    });

### [socket.io](https://www.npmjs.com/package/socket.io) server

To start up a [socket.io](https://www.npmjs.com/package/socket.io) server in
addition to the Express server, you can use the `SocketIOable` mixin along with
the `socketIO` config that is added to the server:

    const { Server } = require('@extjs/sencha-expressjs');

    class MyServer extends Server {
        static get meta () {
            return {
                mixins : [
                    '@extjs/sencha-expressjs/feature/SocketIOable'
                ]
            };
        }
    }

    new MyServer({
        autoStart : true,
        host      : 'foo.com',
        port      : 3000,
        socketIO  : {}
    });

## SSL Server

To start up a secure server, instead of using the `Server` class, use the `SSLServer`
class. This class extends from the `Server` class but adds in the `certificates` config
and uses the `https` module to listen for secure requests.

    const { SSLServer } = require('@extjs/sencha-expressjs');

    new SSLServer({
        host         : 'foo.com',
        port         : 3000,
        certificates : {
            cert : __dirname + '/ssl/foo.com.crt',
            key  : __dirname + '/ssl/foo.com.key'
        }
    });

### Force SSL

If you want to redirect non-secure GET requests to the secure server, you can use the
`SSLForceable` mixin:

    const { SSLServer } = require('@extjs/sencha-expressjs');

    class MyServer extends SSLServer {
        static get meta () {
            return {
                mixins : [
                    '@extjs/sencha-expressjs/feature/SSLForceable'
                ]
            };
        }
    }

    new MyServer({
        autoStart    : true,
        host         : 'foo.com',
        port         : 3000,
        certificates : {
            cert : __dirname + '/ssl/foo.com.crt',
            key  : __dirname + '/ssl/foo.com.key'
        }
    });

This will take requests on port 80 and redirect (a 301 redirect) them to the
server's 3000 port.

There are two configs to control what ports will be used: `forceFromPort` and
`forceToPort`.

The `forceFromPort` defaults to 80 and is used to listen to insecure requests
on the value.

The `forceToPort` defaults to the server's `port` config but if set will be used
to redirect to the port.

If the request is not a GET request, it will return a 403 status.

## Adding server functionality to any class

If you have a class you'd like to add all this server functionality to, you can use
the `Expressable` mixin. This enables starting a server via a simple `server` config
that will be applied onto the class.

    const Base = requires('sencha-core/Base');

    class MyClass extends Base {
        static get meta () {
            return {
                mixins : [
                    '@extjs/sencha-expressjs/feature/Expressable'
                ]
            };
        }
    }

    new MyClass({
        server : {
            autoStart : true,
            host      : 'foo.com',
            port      : 3000
        }
    });

By default, this will create an instance of `Server`. If you want to use `SSLServer`,
set the `xclass` config to this:

    const Base      = requires('sencha-core/Base');
    const SSLServer = requires('sencha-expressjs/SSLServer');

    class MyClass extends Base {
        static get meta () {
            return {
                mixins : [
                    '@extjs/sencha-expressjs/feature/Expressable'
                ]
            };
        }
    }

    new MyClass({
        server : {
            xclass       : SSLServer,
            autoStart    : true,
            host         : 'foo.com',
            port         : 3000,
            certificates : {
                cert : __dirname + '/ssl/foo.com.crt',
                key  : __dirname + '/ssl/foo.com.key'
            }
        }
    });

Since we can control what server class we use but will likely want to use the mixins
to include the different modules, you can subclass the server class of your choosing
and use that:

    const Base      = requires('sencha-core/Base');
    const SSLServer = requires('sencha-expressjs/SSLServer');

    class MyServer extends SSLServer {
        static get meta () {
            return {
                mixins : [
                    '@extjs/sencha-expressjs/feature/SSLForceable'
                ]
            };
        }
    }

    class MyClass extends Base {
        static get meta () {
            return {
                mixins : [
                    '@extjs/sencha-expressjs/feature/Expressable'
                ]
            };
        }
    }

    new MyClass({
        server : {
            xclass        : MyServer,
            autoStart     : true,
            host          : 'foo.com',
            port          : 3000,
            forceFromPort : 3001,
            certificates  : {
                cert : __dirname + '/ssl/foo.com.crt',
                key  : __dirname + '/ssl/foo.com.key'
            }
        }
    });
