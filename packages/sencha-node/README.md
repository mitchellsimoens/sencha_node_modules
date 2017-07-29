sencha-node
---

Module to use [Node.js](https://nodejs.org/) specific APIs.

`Shutdown`
---

The `Shutdown` class allows an application to listen for when the Node.js process
is exited. By default, it listens to the `SIGINT`, `SIGTERM` and `SIGHUP` events on
the `process`.

To listen for shutdown, you can register a callback:

    const { Shutdown } = require('@extjs/sencha-node');

    Shutdown.on(function() {});

You can also unregister a callback:

    const { Shutdown } = require('@extjs/sencha-node');

    let fn = function() {};

    Shutdown.on(fn);
    Shutdown.un(fn);

The callback you pass to the `un` method must match a callback you originally passed
to the `on` method.

There are times where you need to do asynchronous calls on shutdown. For this, you can
return a `Promise` in the callback you registered. When that `Promise` has resolved,
the `process` will be exited:

    const { Shutdown } = require('@extjs/sencha-node');

    Shutdown.on(function() {
        return new Promise(function(resolve) {
            setTimeout(resolve, 500);
        });
    });
