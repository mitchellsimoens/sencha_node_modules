const { expect } = require('chai');

const Create = require('../../../../../operation/api/token/create');

describe('api.token.create', function () {
    let instance;

    afterEach(function () {
        if (instance) {
            instance.destroy();

            instance = null;
        }
    });

    describe('initialization', function () {
        it('should be a token create operation', function () {
            instance = new Create();

            expect(instance).to.be.have.property('isTokenCreater', true);
        });

        it('should have timeframes', function () {
            instance = new Create();

            expect(instance.timeframes).to.be.have.deep.property('access',  'INTERVAL 30 MINUTE');
            expect(instance.timeframes).to.be.have.deep.property('code',    'INTERVAL 2 MINUTE');
            expect(instance.timeframes).to.be.have.deep.property('refresh', 'INTERVAL 96 HOUR');
        });

        it('should set all timeframes', function () {
            instance = new Create({
                timeframes : {
                    access  : 'INTERVAL 15 MINUTE',
                    code    : 'INTERVAL 1 MINUTE',
                    refresh : 'INTERVAL 48 HOUR'
                }
            });

            expect(instance.timeframes).to.be.have.deep.property('access',  'INTERVAL 15 MINUTE');
            expect(instance.timeframes).to.be.have.deep.property('code',    'INTERVAL 1 MINUTE');
            expect(instance.timeframes).to.be.have.deep.property('refresh', 'INTERVAL 48 HOUR');
        });

        it('should set one timeframe', function () {
            instance = new Create({
                timeframes : {
                    access  : 'INTERVAL 5 MINUTE'
                }
            });

            expect(instance.timeframes).to.be.have.deep.property('access',  'INTERVAL 5 MINUTE');
            expect(instance.timeframes).to.be.have.deep.property('code',    'INTERVAL 2 MINUTE');
            expect(instance.timeframes).to.be.have.deep.property('refresh', 'INTERVAL 96 HOUR');
        });

        it('should set two timeframes', function () {
            instance = new Create({
                timeframes : {
                    access  : 'INTERVAL 20 MINUTE',
                    refresh : 'INTERVAL 48 HOUR'
                }
            });

            expect(instance.timeframes).to.be.have.deep.property('access',  'INTERVAL 20 MINUTE');
            expect(instance.timeframes).to.be.have.deep.property('code',    'INTERVAL 2 MINUTE');
            expect(instance.timeframes).to.be.have.deep.property('refresh', 'INTERVAL 48 HOUR');
        });
    });

    describe('create', function () {
        it('should create token', function () {
            instance = new Create();

            instance.exec = this.sandbox.stub().resolves([
                {
                    affectedRows : 1
                },
                {
                    type  : 'access',
                    token : 'abcd'
                }
            ]);

            const promise = instance.create({
                type : 'access'
            });

            return this
                .expectResolved(promise)
                .then((token) => {
                    expect(token).to.be.a('array');
                    expect(token).to.be.lengthOf(1);

                    expect(token[0]).to.have.property('type',  'access');
                    expect(token[0]).to.have.property('token', 'abcd');
                });
        });

        it('should create multiple tokens', function () {
            instance = new Create();

            instance.exec = this.sandbox.stub().resolves([
                {
                    affectedRows : 1
                },
                {
                    affectedRows : 1
                },
                {
                    type  : 'access',
                    token : 'abcd'
                },
                {
                    type  : 'refresh',
                    token : 'efgh'
                }
            ]);

            const promise = instance.create({
                type : [
                    'access',
                    'refresh'
                ]
            });

            return this
                .expectResolved(promise)
                .then((token) => {
                    expect(token).to.be.a('array');
                    expect(token).to.be.lengthOf(2);

                    expect(token[0]).to.have.property('type',  'access');
                    expect(token[0]).to.have.property('token', 'abcd');

                    expect(token[1]).to.have.property('type',  'refresh');
                    expect(token[1]).to.have.property('token', 'efgh');
                });
        });

        it('should throw an error', function () {
            instance = new Create();

            instance.exec = this.sandbox.stub().rejects(new Error('foo happens'));

            const promise = instance.create({
                type  : 'access',
                token : 'abcd'
            });

            return this
                .expectRejected(promise)
                .catch(error => {
                    expect(error).to.be.an('error');
                });
        });
    });
});
