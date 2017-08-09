const { expect } = require('chai');
const index      = require('../../../lib/storage/index.js');
const proxyquire = require('proxyquire');
const sinon      = require('sinon');

const { util : { Logger } } = require('../../../');

describe('lib/storage/index.js', () => {
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
                    expect(error.message).to.equal('Storage is not recognized');
                });
        });

        it('should create and ping connection', function () {
            const pingStub = sinon.stub().resolves({ success : true });

            const Storage = this[ 'sencha-deploy' ].createObservable({
                create () {
                    return this;
                },

                ping : pingStub
            });

            const index = proxyquire(
                '../../../lib/storage/index.js',
                {
                    './Storage' : Storage
                }
            );

            const promise = index.create('s3');

            return promise
                .then(() => {
                    expect(true).to.be.true;
                })
                .catch((e) => {
                    console.log(e);
                    expect(false).to.be.true;
                });
        });
    });

    it('should retrieve S3', () => {
        const test = index.s3;

        expect(test).to.be.equal(require('../../../lib/storage/S3')); // eslint-disable-line global-require
    });
});
