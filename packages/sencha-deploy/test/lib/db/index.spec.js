const { expect } = require('chai');
const index      = require('../../../lib/db/index.js');
const proxyquire = require('proxyquire');

describe('lib/db/index.js', function () {
    describe('create', function () {
        it('should reject if type is not found', function () {
            const promise = index.create('foo');

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('Database is not recognized');
                });
        });

        it('should create and ping connection', function () {
            const ping_stub = this.sandbox.stub().resolves({ success : true });

            const Connection = this[ 'sencha-deploy' ].createObservable({
                create () {
                    return this;
                },

                ping : ping_stub
            });

            const index = proxyquire(
                '../../../lib/db/index.js',
                {
                    '../' : {
                        db : {
                            Connection
                        }
                    }
                }
            );

            const promise = index.create('mysql');

            return promise
                .then(() => {
                    expect(true).to.be.true;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    it('should retrieve MySQL', function () {
        const test = index.mysql;

        expect(test).to.be.equal(require('../../../lib/db/MySQL'));
    });
});
