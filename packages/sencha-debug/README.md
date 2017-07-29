# sencha-debug

Module that aids in debugging.

## Console

Being able to show debug logs in development but not in production is very useful. Using `console.*` is limiting and doesn't
allow for namespace logging or handy colors. This is where `Sencha.debug.Console` comes in handy. Each log is namespaced
so like messages can be easily viewed and each namespace is colored.

### Enabling

There are 3 levels of debugs: log, info, error. By default, these are disabled but you can easily enable them by:

    const { Console } = require('@extjs/sencha-debug');

    Console.enable();

This will enable all levels. You can also enable/disable individual levels:

    const { Console } = require('@extjs/sencha-debug');

    Console.enable('log'); //log level enabled

    Console.enable(['log', 'info']) //log and info levels are enabled

    Console.disable('info'); //disables info but log is still enabled

    Console.disable(['info, error']); //disables info and error but log is still enabled

If any instances of `Sencha.debug.Console` are created and you enable/disable a level, instances will then reflect this
status.

    const { Console } = require('@extjs/sencha-debug');

    let instance = new Console({
        namespace : 'foo'
    });

    instance.log('this is a test'); //nothing will show because the levels have not been enabled

    Console.enable('info');

    instance.info('does this work now?'); //will print this out
    instance.error(new Error('Something happened')); //will not print this out

Each instance can also be enabled/disabled separately but if you use the static `enable`/`disable` methods it will overwrite any
instance setting.

### Namespacing

As you saw in the last snippet the `namespace` config. Each instance must have a namespace to differentiate messages. When a message
prints out, the namespace will prefix the message and will be colored a random color. You don't need to cache an instance as there
is a `find` static method on `Sencha.debug.Console` that will also auto-create an instance if one is not found:

    const { Console } = require('@extjs/sencha-debug');

    Console.enable();

    let instance = Console.find('foo');

    instance.log('this is a test');

The `find` method will create an instance for you and will cache it so subsequent `find` calls with the same namespace will return
the cached instance.

The `find` method does accept a second argument to prevent auto instantiation:

    const { Console } = require('@extjs/sencha-debug');

    let instance = Console.find('foo', false); //will be undefined

### Destroying

Each instance can be destroyed and will cleanup the instance cache.

    const { Console } = require('@extjs/sencha-debug');

    let instance = Console.find('foo'); //will create an instance

    instance.destroy();

    instance = Console.find('foo', false); //will be undefined now
