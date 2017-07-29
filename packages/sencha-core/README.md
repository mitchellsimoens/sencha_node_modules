# sencha-core

The core of the Sencha framework class system.

## Class System

This class system is meant to work with ES2015+ but some added functionality.

### mixins

One of the functionality added to an ES2015 class is mixins. Mixins are used in Ext JS quite a bit and are extremely handy.
In order to specify a mixin, you need to specify the meta static getter that will return the array of mixins:

    const { Base } = require('@extjs/sencha-core');

    class Foo extends Base {
        static get meta () {
            return {
                mixins : [
                    '@extjs/sencha-core/event/Observable'
                ]
            };
        }
    }

In this case, we specify a string and this string will be passed to the `require()`. The above is the same as if we did this:

    const { Base }                   = require('@extjs/sencha-core');
    const { event : { Observable } } = require('@extjs/sencha-core');

    class Foo extends Base {
        static get meta () {
            return {
                mixins : [
                    Observable
                ]
            };
        }
    }

Either way will work the same, I'd say specifying as a string is preferred but functionally speaking, the result is exactly the same.

You can create your own mixin but it **MUST** extend the `Base` class (or a subclass of `Base`):

    const { Base } = require('@extjs/sencha-core');

    class MyMixin extends Base {
        static get meta () {
            return {
                prototype : {
                    isMyMixin : true
                }
            };
        }

        doSomething () {
            return 'hello';
        }

        myMethod() {
            return 'mixin';
        }
    }

    class MyClass extends Base {
        static get meta () {
            return {
                mixins : [
                    MyMixin
                ]
            };
        }

        myMethod () {
            return 'myclass';
        }
    }

    let instance = new MyClass();

    console.log(instance.isMyMixin); // logs true
    console.log(instance.doSomething()); // logs 'hello'
    console.log(instance.myMethod()); // logs 'myclass'

Just like extending a class, mixing in a mixin allows the properties to be applied to the class. Also, other members are applied onto the
class (see `doSomething` on the mixin) however if the class alraedy has the member then the mixin's member will **NOT** be applied onto
the class (see `myMethod` on the class and mixin).

### prototype

Another functionality that is surprisingly missing from ES2015 is the ability to specify members on a class that are not functions. For example,
this simply will not work:

    class Foo {
        foo = 'bar'
    }

Full disclosure, I believe ES2016 is bringing this functionality but since we are already returning meta data on a class, we can support it right now:


    const { Base } = require('@extjs/sencha-core');

    class Foo extends Base {
        static get meta () {
            return {
                prototype : {
                    foo : 'bar'
                }
            };
        }
    }

and now the `Foo` class' prototype has a `foo` property that is a string.

    let instance = new Foo();

    console.log(instance.foo); // logs 'bar'

### config

If you want to merge configs from an instance's config object passed to the constructor or with a superclass' configs, you can specify a config object:

    const { Base } = require('@extjs/sencha-core');

    class Foo extends Base {
        static get meta () {
            return {
                prototype : {
                    config : {
                        foo : 'bar'
                    }
                }
            };
        }
    }

    let instance = new Foo;

    console.log(instance.foo); // logs 'bar'

    instance = new Foo({
        foo : 'baz'
    });

    console.log(instance.foo); // logs 'baz'

This will also merge recursively with objects:

    const { Base } = require('@extjs/sencha-core');

    class Foo extends Base {
        static get meta () {
            return {
                prototype : {
                    config : {
                        foo : {
                            bar : true
                        }
                    }
                }
            };
        }
    }

    let instance = new Foo;

    console.log(instance.foo.bar); // logs true
    console.log(instance.foo.baz); // logs undefined

    instance = new Foo({
        foo : {
            baz : false
        }
    });

    console.log(instance.foo.bar); // logs true
    console.log(instance.foo.baz); // logs false

The same goes for extending a class that has a config object:

    const { Base } = require('@extjs/sencha-core');

    class Foo extends Base {
        static get meta () {
            return {
                prototype : {
                    config : {
                        foo : {
                            bar : true
                        }
                    }
                }
            };
        }
    }

    class Bar extends Foo {
        static get meta () {
            return {
                prototype : {
                    config : {
                        foo : {
                            baz : false
                        }
                    }
                }
            };
        }
    }

    let instance = new Bar;

    console.log(instance.foo.bar); // logs true
    console.log(instance.foo.baz); // logs false

## `Config` class

Applications normally like to split out the configs from the application into a separate file. This is where the `Config` class can be used.

### Reading configs

The `Config` class can read configurations from a JavaScript Object or from a JSON file:

    const { Config } = require('@extjs/sencha-core');

    Config.read({
        defaults    : {},
        development : {}
    });

    //or a JSON file:

    Config.read(__dirname + '/config.json');

It is expected to have at least the `defaults` object or an environment object. The `Config` class has an `env` config that defaults to `development`.
The config being read in will merge the environment object with the defaults object recursively.

### Getting configs

The `Config` class can lookup configs that have been read using object dot notation:

    const { Config } = require('@extjs/sencha-core');

    Config.read({
        defaults : {
            foo : 'bar',
            obj : {
                nested : 1
            }
        }
    });

    let foo    = Config.get('foo'),         // will be 'bar'
        nested = Config.get('obj.nested');  // will be 1

If a match is not found, `undefined` will be returned.

### Setting configs

On the fly, the `Config` class can set values using the same object notation. This will create objects for nested keys that are undefined.

    const { Config } = require('@extjs/sencha-core');

    Config.read({
        defaults : {
            foo : 'bar',
            obj : {
                nested : 1
            }
        }
    });

    Config.set('foo',        'baz');
    Config.set('obj.nested', 2);

    let foo    = Config.get('foo'),         // will be 'baz'
        nested = Config.get('obj.nested');  // will be 2

    Config.set('obj.foo.bar', 'hello');

    let bar = Config.get('obj.foo.bar');    // will be 'hello'

## Test

The test setup uses [Mocha](https://mochajs.org/) and [Chai](http://chaijs.com/) along with [Chai Spies](https://github.com/chaijs/chai-spies).

You must have Mocha installed globally:

    npm install -g mocha

You also need to install the dependencies:

    npm install

This will install Chai and Chai Spies. Now all you need to do is run the tests:

    npm run test
