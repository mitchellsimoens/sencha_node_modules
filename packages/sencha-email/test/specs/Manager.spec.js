const { expect }            = require('chai');
const { Manager, Provider } = require('../../');

describe('Manager', function () {
    describe('instantiation', function () {
        it('should be an instance', function () {
            expect(Manager).to.have.property('isInstance',     true);
            expect(Manager).to.have.property('isEmailManager', true);
        });
    });

    describe('baseInstance', function () {
        it('should set provider', function () {
            const { baseInstance } = Manager.constructor;

            expect(baseInstance).to.have.property('cls',      Provider);
            expect(baseInstance).to.have.property('property', 'isEmailProvider');
        });
    });

    describe('send', function () {
        afterEach(function () {
            Manager.remove();
        });

        it('should reject if no provider provided', function () {
            return Manager
                .send()
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('Provider not found');
                });
        });

        it('should send an email', function () {
            const sendSpy = this.sandbox.spy();

            Manager.add('foo', this[ 'sencha-email' ].createProvider({
                sendSpy
            }));

            return Manager
                .send('foo', 'fake email')
                .then(ret => {
                    sendSpy.should.have.been.calledWith('fake email');

                    expect(ret).to.be.undefined;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should send an email passing provider instance', function () {
            const sendSpy  = this.sandbox.spy();
            const provider = this[ 'sencha-email' ].createProvider({
                sendSpy
            });

            Manager.add('foo', provider);

            return Manager
                .send(provider, 'fake email')
                .then(ret => {
                    sendSpy.should.have.been.calledWith('fake email');

                    expect(ret).to.be.undefined;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should send passing email only', function () {
            const sendSpy = this.sandbox.spy();

            Manager.add('foo', this[ 'sencha-email' ].createProvider({
                sendSpy
            }));

            const email = this[ 'sencha-email' ].createEmail({
                provider : 'foo'
            });

            return Manager
                .send(email)
                .then(ret => {
                    sendSpy.should.have.been.calledWith(email);

                    expect(ret).to.be.undefined;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should send passing email only and provider undefined', function () {
            const sendSpy = this.sandbox.spy();

            Manager.add('foo', this[ 'sencha-email' ].createProvider({
                sendSpy
            }));

            const email = this[ 'sencha-email' ].createEmail({
                provider : 'foo'
            });

            return Manager
                .send(null, email)
                .then(ret => {
                    sendSpy.should.have.been.calledWith(email);

                    expect(ret).to.be.undefined;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle an error', function () {
            const sendSpy = this.sandbox.spy();

            Manager.add('foo', this[ 'sencha-email' ].createProvider({
                sendSpy,
                sendError : new Error('send failed')
            }));

            const email = this[ 'sencha-email' ].createEmail({
                provider : 'foo'
            });

            return Manager
                .send('foo', email)
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    sendSpy.should.have.been.calledWith(email);

                    expect(error.message).to.equal('send failed');
                });
        });
    });
});
