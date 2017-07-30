const { expect }              = require('chai');
const { Connection, Manager } = require('../../');

describe('Connection', function () {
    afterEach(function () {
        Manager.remove(true);
    });

    describe('instantiation', function () {
        it('should be a connection', function () {
            expect(Manager).to.have.property('isInstance',   true);
            expect(Manager).to.have.property('isSalesforce', true);
        });
    });

    describe('baseInstance', function () {
        it('should have proper format', function () {
            const { baseInstance } = Manager.constructor;

            expect(baseInstance).to.have.property('cls',      Connection);
            expect(baseInstance).to.have.property('property', 'isSalesforceConnection');
        });
    });

    describe('invoke', function () {
        it('should invoke connection', function () {
            Manager.add('foo', {
                autoStart : false
            });

            const connection = Manager.get('foo');
            const stub       = this.sandbox.stub(connection, 'invoke').resolves({});

            return Manager
                .invoke('foo', 'mymethod', 'myargs', 'myschema')
                .then(result => {
                    stub.should.have.been.calledWith('mymethod', 'myargs', 'myschema');
                    expect(result).to.be.an('object');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('query', function () {
        it('should query connection', function () {
            Manager.add('foo', {
                autoStart : false
            });

            const connection = Manager.get('foo');
            const stub       = this.sandbox.stub(connection, 'query').resolves({});

            return Manager
                .query('foo', 'SELECT *')
                .then(result => {
                    stub.should.have.been.calledWith('SELECT *');
                    expect(result).to.be.an('object');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('handleNoConnection', function () {
        it('should not find a connection', function () {
            return Manager
                .handleNoConnection('foo')
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('No jsforce connection object');
                });
        });

        it('should find a connection', function () {
            Manager.add('foo', {
                autoStart : false
            });

            return Manager
                .handleNoConnection('foo')
                .then(connection => {
                    expect(connection).to.be.instanceOf(Connection);
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('isNil', function () {
        it('should be nil', function () {
            const result = Manager.isNil({
                $ : {
                    'xsi:nil' : true
                }
            });

            expect(result).to.be.true;
        });

        it('should not be nil', function () {
            const result = Manager.isNil({
                $ : true
            });

            expect(result).to.be.false;
        });

        it('should be nil as a simple value', function () {
            const result = Manager.isNil(false);

            expect(result).to.be.true;
        });

        it('should not be nil as a simple value', function () {
            const result = Manager.isNil(true);

            expect(result).to.be.false;
        });
    });

    describe('isTrue', function () {
        const trueTests  = [
            true,
            'true',
            'on',
            1,
            { $ : null }
        ];
        const falseTests = [
            undefined,
            false,
            'false',
            'off',
            0,
            { $ : { 'xsi:nil' : true } }
        ];
        function makeTests (pass, tests) {
            describe(`${pass ? true : false}`, function () {
                tests.forEach(test => {
                    let parsed = test;

                    if (typeof parsed === 'object') {
                        parsed = JSON.stringify(parsed);
                    }

                    it(`should handle "${parsed}" as a ${typeof test}`, function () {
                        const result = Manager.isTrue(test);

                        if (pass) {
                            expect(result).to.be.true;
                        } else {
                            expect(result).to.be.false;
                        }
                    });
                });
            });
        }

        makeTests(true,  trueTests);
        makeTests(false, falseTests);
    });
});
