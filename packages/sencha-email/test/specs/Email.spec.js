const { expect }         = require('chai');
const { Email, Manager } = require('../../');

describe('Email', function () {
    let instance;

    afterEach(function () {
        if (instance && !instance.destroyed) {
            instance.destroy();
        }

        instance = null;

        Manager.remove();
    });

    describe('instantiation', function () {
        beforeEach(function () {
            instance = new Email();
        });

        it('should be an email', function () {
            expect(instance).to.have.property('isEmail', true);
        });
    });

    describe('send', function () {
        beforeEach(function () {
            instance = new Email();
        });

        it('should send email', function () {
            const sendSpy = this.sandbox.spy();

            Manager.add('foo', this.createProvider({
                sendSpy
            }));

            return instance
                .send('foo')
                .then(ret => {
                    expect(sendSpy).to.have.been.calledWith(instance);

                    expect(ret).to.be.undefined;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should send email passing provider instance', function () {
            const sendSpy  = this.sandbox.spy();
            const provider = this.createProvider({
                sendSpy,
                sendResult : 'send result'
            });

            Manager.add('foo', provider);

            return instance
                .send(provider)
                .then(ret => {
                    expect(sendSpy).to.have.been.calledWith(instance);

                    expect(ret).to.equal('send result');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle an error', function () {
            const sendSpy  = this.sandbox.spy();
            const provider = this.createProvider({
                sendSpy,
                sendError : new Error('send failed')
            });

            Manager.add('foo', provider);

            return instance
                .send(provider)
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(sendSpy).to.have.been.calledWith(instance);

                    expect(error.message).to.equal('send failed');
                });
        });
    });
});
