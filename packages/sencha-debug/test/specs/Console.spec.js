const { expect }  = require('chai');
const { Console } = require('../../');

describe('Console', function () {
    let instance;

    afterEach(function () {
        if (instance && !instance.destroyed) {
            instance.destroy();
        }

        Object.assign(Console.prototype, {
            errorEnabled : null,
            infoEnabled  : null,
            logEnabled   : null
        });

        instance = null;

        Console.instances = {};
    });

    function makeEnabledDisabled (onInstance = true) {
        const rootProp = onInstance ? '' : 'prototype.';
        let test;

        describe(`${onInstance ? "static" : "instance"}`, function () {
            beforeEach(function () {
                if (onInstance) {
                    test = instance = new Console();
                } else {
                    test = Console;
                }
            });

            afterEach(function () {
                test = null;
            });

            function makeStaticEnableDisable (enable = true) {
                const fn = enable ? 'enable' : 'disable';

                describe(`static ${fn}`, function () {
                    it('should set all enabled', function () {
                        test[fn]();

                        expect(test).to.have.deep.property(`${rootProp}errorEnabled`, enable);
                        expect(test).to.have.deep.property(`${rootProp}infoEnabled`,  enable);
                        expect(test).to.have.deep.property(`${rootProp}logEnabled`,   enable);
                    });

                    it('should handle a string', function () {
                        test[fn]('error');

                        expect(test).to.have.deep.property(`${rootProp}errorEnabled`, enable);
                        expect(test).to.have.deep.property(`${rootProp}infoEnabled`,  null);
                        expect(test).to.have.deep.property(`${rootProp}logEnabled`,   null);
                    });

                    it('should handle an array', function () {
                        test[fn]([ 'error', 'log' ]);

                        expect(test).to.have.deep.property(`${rootProp}errorEnabled`, enable);
                        expect(test).to.have.deep.property(`${rootProp}infoEnabled`,  null);
                        expect(test).to.have.deep.property(`${rootProp}logEnabled`,   enable);
                    });

                    it('should handle an object', function () {
                        test[fn]({
                            error : false,
                            info  : undefined // undefined should force default `true`
                        });

                        expect(test).to.have.deep.property(`${rootProp}errorEnabled`, false);
                        expect(test).to.have.deep.property(`${rootProp}infoEnabled`,  enable);
                        expect(test).to.have.deep.property(`${rootProp}logEnabled`,   null);
                    });
                });
            }

            describe('_setEnabled', function () {
                it('should set all enabled', function () {
                    test._setEnabled();

                    expect(test).to.have.deep.property(`${rootProp}errorEnabled`, true);
                    expect(test).to.have.deep.property(`${rootProp}infoEnabled`,  true);
                    expect(test).to.have.deep.property(`${rootProp}logEnabled`,   true);
                });

                it('should set all enabled passing a bool', function () {
                    test._setEnabled(true);

                    expect(test).to.have.deep.property(`${rootProp}errorEnabled`, true);
                    expect(test).to.have.deep.property(`${rootProp}infoEnabled`,  true);
                    expect(test).to.have.deep.property(`${rootProp}logEnabled`,   true);
                });

                it('should set all disabled passing a bool', function () {
                    test._setEnabled(false);

                    expect(test).to.have.deep.property(`${rootProp}errorEnabled`, false);
                    expect(test).to.have.deep.property(`${rootProp}infoEnabled`,  false);
                    expect(test).to.have.deep.property(`${rootProp}logEnabled`,   false);
                });

                it('should handle an array to enable', function () {
                    test._setEnabled([ 'error', 'log' ]);

                    expect(test).to.have.deep.property(`${rootProp}errorEnabled`, true);
                    expect(test).to.have.deep.property(`${rootProp}infoEnabled`,  null);
                    expect(test).to.have.deep.property(`${rootProp}logEnabled`,   true);
                });

                it('should handle an array to disable', function () {
                    test._setEnabled([ 'error', 'info' ], false);

                    expect(test).to.have.deep.property(`${rootProp}errorEnabled`, false);
                    expect(test).to.have.deep.property(`${rootProp}infoEnabled`,  false);
                    expect(test).to.have.deep.property(`${rootProp}logEnabled`,   null);
                });

                it('should handle an object', function () {
                    test._setEnabled({
                        error : false,
                        info  : undefined // undefined should force default `true`
                    });

                    expect(test).to.have.deep.property(`${rootProp}errorEnabled`, false);
                    expect(test).to.have.deep.property(`${rootProp}infoEnabled`,  true);
                    expect(test).to.have.deep.property(`${rootProp}logEnabled`,   null);
                });

                it('should handle a string to enable using default', function () {
                    test._setEnabled('log');

                    expect(test).to.have.deep.property(`${rootProp}errorEnabled`, null);
                    expect(test).to.have.deep.property(`${rootProp}infoEnabled`,  null);
                    expect(test).to.have.deep.property(`${rootProp}logEnabled`,   true);
                });

                it('should handle a string to enable passing true', function () {
                    test._setEnabled('error', true);

                    expect(test).to.have.deep.property(`${rootProp}errorEnabled`, true);
                    expect(test).to.have.deep.property(`${rootProp}infoEnabled`,  null);
                    expect(test).to.have.deep.property(`${rootProp}logEnabled`,   null);
                });

                it('should handle a string to disable', function () {
                    test._setEnabled('info', false);

                    expect(test).to.have.deep.property(`${rootProp}errorEnabled`, null);
                    expect(test).to.have.deep.property(`${rootProp}infoEnabled`,  false);
                    expect(test).to.have.deep.property(`${rootProp}logEnabled`,   null);
                });
            });

            makeStaticEnableDisable();      // enable
            makeStaticEnableDisable(false); // disable
        });
    }

    function makeLogger (fn, message, loggerFn = 'info') {
        describe(fn, function () {
            it('should log message', function () {
                const spy = this.sandbox.spy();

                instance = new Console({
                    namespace : 'foo'
                });

                instance.logger = {
                    [loggerFn] : spy
                };

                instance.enable(fn);

                instance[fn](message);

                expect(spy).to.have.been.calledOnce;

                expect(spy.args).to.be.an('array');

                expect(spy.args[0]).to.be.an('array');
                //some colors don't have matching bg and fg (like black)
                expect(spy.args[0].length).to.be.at.least(fn === 'log' ? 4 : 8);

                // will have random colors

                expect(spy.args[0]).to.include('foo');
                expect(spy.args[0]).to.include('\x1b[0m');
                expect(spy.args[0]).to.include(message);

                if (fn !== 'log') {
                    expect(spy.args[0]).to.include(`**${fn.toUpperCase()}**`);
                }
            });

            it('should not log anything', function () {
                const spy = this.sandbox.spy();

                instance = new Console({
                    namespace : 'foo'
                });

                instance.logger = {
                    [loggerFn] : spy
                };

                instance[fn](message);

                expect(spy).to.not.have.been.called;
            });
        });
    }

    makeEnabledDisabled();
    makeEnabledDisabled(false);

    makeLogger('error', 'This is an error');
    makeLogger('info',  'This is informational');
    makeLogger('log',   'This could be anything', 'log');

    describe('static find', function () {
        it('should create instances object', function () {
            delete Console.instances;

            instance = Console.find('foo');

            expect(Console.instances).to.be.an('object');
            expect(instance).to.be.instanceOf(Console);
            expect(Console).to.have.deep.property('instances.foo', instance);
        });

        it('should create a new instance', function () {
            instance = Console.find('foo');

            expect(instance).to.be.instanceOf(Console);
            expect(Console).to.have.deep.property('instances.foo', instance);
        });

        it('should return matching instance', function () {
            instance = new Console({
                namespace : 'foo'
            });

            const result = Console.find('foo');

            expect(result).to.equal(instance);
        });

        it('should not create instance', function () {
            instance = Console.find('foo', false);

            expect(instance).to.be.undefined;
        });
    });

    describe('logger', function () {
        beforeEach(function () {
            instance = new Console();
        });

        describe('get', function () {
            it('should return console as default', function () {
                expect(instance).to.have.property('logger', console);
            });

            it('should return set logger', function () {
                instance.logger = 'foo';

                expect(instance).to.have.property('logger', 'foo');
            });
        });

        describe('set', function () {
            it('should set logger', function () {
                instance.logger = 'foo';

                expect(instance).to.have.property('logger', 'foo');
            });
        });
    });

    describe('get randomColor', function () {
        beforeEach(function () {
            instance = new Console();
        });

        it('should get a random color', function () {
            const color = instance.randomColor;

            expect(color).to.be.an('object');

            expect(color).to.have.property('bg');
            expect(color).to.have.property('fg');
        });
    });

    describe('_lookupColor', function () {
        beforeEach(function () {
            instance = new Console();
        });

        it('should lookup by string', function () {
            const color = instance._lookupColor('blue');

            expect(color).to.be.an('object');

            expect(color).to.have.property('bg', '\x1b[44m');
            expect(color).to.have.property('fg', '\x1b[34m');
        });

        it('should lookup by object', function () {
            const color = instance._lookupColor({
                bg : 'red',
                fg : 'black'
            });

            expect(color).to.be.an('object');

            expect(color).to.have.property('bg', '\x1b[41m');
            expect(color).to.have.property('fg', '\x1b[30m');
        });
    });

    describe('_wrapColor', function () {
        beforeEach(function () {
            instance = new Console();
        });

        it('should wrap with color as a string', function () {
            const arr = [ 'this is a test' ];

            instance._wrapColor(arr, 'blue');

            expect(arr).to.have.lengthOf(4);

            expect(arr[0]).to.equal('\x1b[44m');
            expect(arr[1]).to.equal('\u001b[34m');
            expect(arr[2]).to.equal('this is a test');
            expect(arr[3]).to.equal('\x1b[0m');
        });

        it('should wrap with color as an object', function () {
            const arr = [ 'this is a test' ];

            instance._wrapColor(arr, {
                bg : 'red',
                fg : 'black'
            });

            expect(arr).to.have.lengthOf(4);

            expect(arr[0]).to.equal('\x1b[41m');
            expect(arr[1]).to.equal('\x1b[30m');
            expect(arr[2]).to.equal('this is a test');
            expect(arr[3]).to.equal('\x1b[0m');
        });

        it('should wrap without a fg', function () {
            const arr = [ 'this is a test' ];

            instance._wrapColor(arr, {
                bg : 'red'
            });

            expect(arr).to.have.lengthOf(3);

            expect(arr[0]).to.equal('\x1b[41m');
            expect(arr[1]).to.equal('this is a test');
            expect(arr[2]).to.equal('\u001b[0m');
        });

        it('should wrap without a bg', function () {
            const arr = [ 'this is a test' ];

            instance._wrapColor(arr, {
                fg : 'red'
            });

            expect(arr).to.have.lengthOf(3);

            expect(arr[0]).to.equal('\u001b[31m');
            expect(arr[1]).to.equal('this is a test');
            expect(arr[2]).to.equal('\u001b[0m');
        });
    });

    describe('_addNamespace', function () {
        beforeEach(function () {
            instance = new Console({
                namespace : 'foo'
            });
        });

        it('should add namespace before message', function () {
            //since this will have a random color, need to fake it
            instance.namespaceArr = [
                'a',
                'foo',
                'b'
            ];

            const arr = instance._addNamespace('some message');

            expect(arr).to.be.an('array');
            expect(arr).to.have.lengthOf(4);

            expect(arr[0]).to.equal('a');
            expect(arr[1]).to.equal('foo');
            expect(arr[2]).to.equal('b');
            expect(arr[3]).to.equal('some message');
        });

        it('should add namespace before an error message', function () {
            //since this will have a random color, need to fake it
            instance.namespaceArr = [
                'a',
                'foo',
                'b'
            ];

            const arr = instance._addNamespace('some message', 'error');

            expect(arr).to.be.an('array');
            expect(arr).to.have.lengthOf(8);

            expect(arr[0]).to.equal('a');
            expect(arr[1]).to.equal('foo');
            expect(arr[2]).to.equal('b');
            expect(arr[3]).to.equal('\u001b[41m');
            expect(arr[4]).to.equal('\u001b[37m');
            expect(arr[5]).to.equal('**ERROR**');
            expect(arr[6]).to.equal('\u001b[0m');
            expect(arr[7]).to.equal('some message');
        });

        it('should add namespace before an info message', function () {
            //since this will have a random color, need to fake it
            instance.namespaceArr = [
                'a',
                'foo',
                'b'
            ];

            const arr = instance._addNamespace('some message', 'info');

            expect(arr).to.be.an('array');
            expect(arr).to.have.lengthOf(8);

            expect(arr[0]).to.equal('a');
            expect(arr[1]).to.equal('foo');
            expect(arr[2]).to.equal('b');
            expect(arr[3]).to.equal('\u001b[44m');
            expect(arr[4]).to.equal('\u001b[37m');
            expect(arr[5]).to.equal('**INFO**');
            expect(arr[6]).to.equal('\u001b[0m');
            expect(arr[7]).to.equal('some message');
        });

        it('should accept an array for a message', function () {
            //since this will have a random color, need to fake it
            instance.namespaceArr = [
                'a',
                'foo',
                'b'
            ];

            const arr = instance._addNamespace([
                'some message',
                'another message'
            ]);

            expect(arr).to.be.an('array');
            expect(arr).to.have.lengthOf(5);

            expect(arr[0]).to.equal('a');
            expect(arr[1]).to.equal('foo');
            expect(arr[2]).to.equal('b');
            expect(arr[3]).to.equal('some message');
            expect(arr[4]).to.equal('another message');
        });
    });
});
