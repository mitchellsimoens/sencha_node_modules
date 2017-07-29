const { expect }  = require('chai');
const path        = require('path');
const { Adapter } = require('../../');

describe('Adapter', function () {
    let adapter;

    afterEach(function () {
        if (adapter) {
            adapter.destroy();
            adapter = null;
        }
    });

    describe('initialization', function () {
        beforeEach(function () {
            adapter = new Adapter();
        });

        it('should be a mysql error adapter', function () {
            expect(adapter).to.have.property('isErrorMySQLAdapter', true);
        });

        it('should be an error adapter', function () {
            expect(adapter).to.have.property('isErrorAdapter', true);
        });

        it('should have rootPath set', function () {
            expect(adapter).to.have.property('rootPath', path.join(__dirname, '../../'));
        });
    });
});
