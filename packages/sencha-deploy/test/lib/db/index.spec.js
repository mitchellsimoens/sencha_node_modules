const { expect } = require('chai');
const proxyquire = require('proxyquire');
const sinon      = require('sinon');

const {
    db   : index,
    util : { Logger }
} = require('../../../');

describe('lib/db/index.js', () => {
    beforeEach(() => {
        Logger.init();
    });

    describe('create', () => {
        it('should reject if type is not found', () => {
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
            const pingStub = sinon.stub().resolves({ success : true });

            const Connection = this[ 'sencha-deploy' ].createObservable({
                create () {
                    return this;
                },

                ping : pingStub
            });

            const index = proxyquire(
                '../../../lib/db/index.js',
                {
                    './Connection' : Connection
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

    it('should retrieve MySQL', () => {
        const test = index.mysql;

        expect(test).to.be.equal(require('../../../lib/db/MySQL')); // eslint-disable-line global-require
    });
});
