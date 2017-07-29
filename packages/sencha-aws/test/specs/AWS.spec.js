const { expect } = require('chai');
const { AWS }    = require('../../');
const proxyquire = require('proxyquire');

describe('AWS', function () {
    let instance;

    afterEach(function () {
        if (instance && !instance.destroyed) {
            instance.destroy();
        }

        AWS.config = instance = null;
    });

    describe('instantiation', function () {
        it('should be an AWS instance', function () {
            instance = new AWS();

            expect(instance).to.have.property('isInstance', true);
            expect(instance).to.have.property('isAWS',      true);
        });
    });

    describe('get config', function () {
        it('should get config', function () {
            AWS._config = 'foo';

            expect(AWS).to.have.property('config', 'foo');
        });
    });

    describe('set config', function () {
        it('should set config', function () {
            const spy = this.sandbox.spy();
            const AWS = proxyquire(
                '../../AWS',
                {
                    'aws-sdk' : {
                        config : {
                            update : spy
                        }
                    }
                }
            );

            AWS.config = 'bar';

            expect(spy).to.have.been.calledWith('bar');
            expect(AWS).to.have.property('config', 'bar');
        });

        it('should clear config', function () {
            const spy = this.sandbox.spy();
            const AWS = proxyquire(
                '../../AWS',
                {
                    'aws-sdk' : {
                        config : {
                            update : spy
                        }
                    }
                }
            );

            AWS.config = false;

            expect(spy).to.have.not.been.called;
            expect(AWS).to.have.property('config', false);
        });
    });
});
