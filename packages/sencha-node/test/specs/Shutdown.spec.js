const { expect }   = require('chai');
const { Shutdown } = require('../../');

describe('Sencha.node.Shutdown', function() {
    describe('instantiation', function() {
        it('should be a singleton', function() {
            expect(Shutdown.isInstance).to.be.true;
        });
    });

    describe('on', function() {
        beforeEach(function() {
            Shutdown.on(Shutdown.emptyFn);
        });

        afterEach(function() {
            Shutdown.un(Shutdown.emptyFn);
        });

        it('should initialize process listeners', function() {
            expect(Shutdown.eventsInitialized).to.be.true;
        });

        it('should add to callbacks', function() {
            expect(Shutdown.callbacks).to.have.length(1);
        });
    });

    describe('un', function() {
        beforeEach(function() {
            Shutdown.on(Shutdown.emptyFn);
        });

        it('should de-initialize process listeners', function() {
            Shutdown.un(Shutdown.emptyFn);

            expect(Shutdown.eventsInitialized).to.be.false;
        });

        it('should remove listener from callbacks', function() {
            Shutdown.un(Shutdown.emptyFn);

            expect(Shutdown.callbacks).to.have.length(0);
        });
    });

    describe('exec', function() {
        it('should execute callbacks', function() {
            const spy = this.sandbox.spy();

            Shutdown.on(spy);

            Shutdown.exec(true);

            expect(spy).to.have.been.called;

            Shutdown.un(spy);
        });
    });
});
