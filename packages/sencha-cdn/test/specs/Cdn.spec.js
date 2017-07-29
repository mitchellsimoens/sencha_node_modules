const { expect } = require('chai');
const { Cdn }    = require('../../');
const proxyquire = require('proxyquire');

describe('Cdn', function () {
    let instance;

    afterEach(function () {
        if (instance) {
            instance.destroy();
            instance = null;
        }
    });

    describe('instantiation', function () {
        beforeEach(function () {
            instance = new Cdn();
        });

        it('should be a Cdn instance', function () {
            expect(instance).to.have.property('isCdn', true);
        });
    });

    describe('expiration', function () {
        it('should use default tte', function () {
            instance = new Cdn();

            const { expiration } = instance;
            const expected = new Date().getTime() + 5 * 60000;

            expect(expiration.getTime()).to.equal(expected);
        });

        it('should use configured tte', function () {
            instance = new Cdn({
                tte : 20000
            });

            const { expiration } = instance;
            const expected = new Date().getTime() + 20000;

            expect(expiration.getTime()).to.equal(expected);
        });
    });

    describe('retrieve', function () {
        it('should return a promise', function () {
            instance = new Cdn();

            const promise = instance.retrieve();

            expect(promise).to.be.a('promise');

            return promise.catch(() => {});
        });

        describe('reject', function () {
            it('should reject if no key provided', function () {
                instance = new Cdn({
                    url : 'https://example.com'
                });

                const promise = instance.retrieve();

                return promise
                    .then(() => {
                        //shouldn't happen, trigger a failure
                        expect(false).to.be.true;
                    })
                    .catch((e) => {
                        expect(e.message).to.equal('`key` is required');
                    });
            });

            it('should reject if no url provided', function () {
                instance = new Cdn({
                    key : 'abc'
                });

                const promise = instance.retrieve();

                return promise
                    .then(() => {
                        //shouldn't happen, trigger a failure
                        expect(false).to.be.true;
                    })
                    .catch((e) => {
                        expect(e.message).to.equal('`url` is required');
                    });
            });

            it('should reject if request returns error', function () {
                const Cdn = proxyquire(
                    '../../Cdn',
                    {
                        request : this.createRequest({
                            error : new Error('foobar')
                        })
                    }
                );

                instance = new Cdn({
                    key : 'abc',
                    url : 'https://example.com'
                });

                const promise = instance.retrieve();

                return promise
                    .then(() => {
                        //shouldn't happen, trigger a failure
                        expect(false).to.be.true;
                    })
                    .catch(error => {
                        expect(error.message).to.equal('foobar');
                    });
            });

            it('should reject if body is malformed', function () {
                const Cdn = proxyquire(
                    '../../Cdn',
                    {
                        request : this.createRequest({
                            body : '{ "token": { "foo" : "body" }'
                        })
                    }
                );

                instance = new Cdn({
                    key : 'abc',
                    url : 'https://example.com'
                });

                const promise = instance.retrieve();

                return promise
                    .then(() => {
                        //shouldn't happen, trigger a failure
                        expect(false).to.be.true;
                    })
                    .catch(error => {
                        expect(error.message).to.equal('A token could not be retrieved');
                    });
            });
        });

        describe('resolve', function () {
            it('should resolve with body as a string', function () {
                const Cdn = proxyquire(
                    '../../Cdn',
                    {
                        request : this.createRequest({
                            body : '{ "token": { "foo" : "body" } }'
                        })
                    }
                );

                instance = new Cdn({
                    key : 'abc',
                    url : 'https://example.com'
                });

                const promise = instance.retrieve();

                return promise
                    .then(ret => {
                        expect(ret).to.have.property('success', true);
                        expect(ret).to.have.property('data');

                        //deep property broken in chai 4.0.1?
                        //expect(ret).to.have.deep.property('data.foo', 'body');
                    })
                    .catch(() => {
                        //shouldn't happen, trigger a failure
                        expect(false).to.be.true;
                    });
            });
        });
    });

    describe('$buildForm', function () {
        beforeEach(function () {
            instance = new Cdn({
                key : 'abc'
            });
        });

        it('should return default path and key', function () {
            const form = instance.$buildForm({});

            expect(form).to.have.property('a', 'abc');
            expect(form).to.have.property('u', '/*');
            expect(form).to.have.property('s', true);
        });

        it('should return path with default key', function () {
            const form = instance.$buildForm({
                path : '/abcd'
            });

            expect(form).to.have.property('a', 'abc');
            expect(form).to.have.property('u', '/abcd');
            expect(form).to.have.property('s', true);
        });

        it('should return passed key and path', function () {
            const form = instance.$buildForm({
                key  : 'def',
                path : '/abcd'
            });

            expect(form).to.have.property('a', 'def');
            expect(form).to.have.property('u', '/abcd');
            expect(form).to.have.property('s', true);
        });

        it('should include user email', function () {
            const form = instance.$buildForm({
                user : {
                    email : 'foo@bar.com'
                }
            });

            expect(form).to.have.property('a', 'abc');
            expect(form).to.have.property('u', '/*');
            expect(form).to.have.property('s', true);

            expect(form).to.have.property('e', 'foo@bar.com');
        });

        it('should not include guest user email', function () {
            const form = instance.$buildForm({
                user : {
                    isGuest : true,
                    email   : 'foo@bar.com'
                }
            });

            expect(form).to.have.property('a', 'abc');
            expect(form).to.have.property('u', '/*');
            expect(form).to.have.property('s', true);

            expect(form).to.not.have.property('e', 'foo@bar.com');
        });
    });
});
