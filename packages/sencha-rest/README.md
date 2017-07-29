# sencha-rest

This module allows for endpoints to be registered with the `Manager` class. The `Manager` class is responsible for holding instances of the `Endpoint`
class and have an entry point for requests.

## Adding endpoints

To add an endpoint, you must pass a name and either an `Endpoint` instance or config object to the `add` method:

    const { Manager } = require('@extjs/sencha-rest');

    Manager.add('foo', {
        cls     : require('./MyHandler'),
        matcher : '/foo'
    });

Each endpoint **MUST** have a `cls` or `matcher` config passed to it.

## Endpoint execution

When the endpoint's `matcher` is recognized on a request, the endpoint will create an instance of the `cls` and execute a method (via the `method` config
on the endpoint, defaults to `handler`). It is expected this method to return a Promise event:

    const { Base } = require('@extjs/sencha-core');

    class MyHandler extends Base {
        handler () {
            return new Promise((resolve, reject) => {
                resolve('foo');
            });
        }
    }
