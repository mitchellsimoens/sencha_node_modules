const { expect }  = require('chai');
const { Manager } = require('../../');

describe('Manager', function () {
    let adapter, getSpy, instantiateSpy;

    beforeEach(function () {
        getSpy         = this.sandbox.spy();
        instantiateSpy = this.sandbox.spy();

        Manager.adapter = adapter = this[ 'sencha-login' ].createAdapter({
            getSpy,
            instantiateSpy
        });
    });

    afterEach(function () {
        if (adapter) {
            adapter.destroy();
            adapter = null;
        }
    });

    it('should be a login manager', function () {
        expect(Manager).to.have.property('isLoginManager', true);
    });

    it('should get operation from adapter', function () {
        Manager.getOperation('foo.bar');

        getSpy.should.have.been.calledWith('foo.bar');
    });

    it('should instantiate operation from adapter', function () {
        Manager.instantiateOperation('foo.bar', 'config');

        instantiateSpy.should.have.been.calledWith('foo.bar', 'config');
    });
});
