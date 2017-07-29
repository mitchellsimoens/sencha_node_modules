const { expect }  = require('chai');
const { Manager } = require('../../');

describe('Manager', function () {
    let adapter, getSpy, instantiateSpy;

    beforeEach(function () {
        getSpy         = this.sandbox.spy();
        instantiateSpy = this.sandbox.spy();

        Manager.adapter = adapter = this.createAdapter({
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

    it('should be an error manager', function () {
        expect(Manager).to.have.property('isErrorManager', true);
    });

    it('should get operation from adapter', function () {
        Manager.getOperation('foo.bar');

        expect(getSpy).to.have.been.calledWith('foo.bar');
    });

    it('should instantiate operation from adapter', function () {
        Manager.instantiateOperation('foo.bar', 'config');

        expect(instantiateSpy).to.have.been.calledWith('foo.bar', 'config');
    });
});
