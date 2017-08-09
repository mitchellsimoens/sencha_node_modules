const { expect } = require('chai');
const index      = require('../../');

describe('lib/index.js', function () {
    it('should retrieve App', function () {
        const test = index.App;

        expect(test).to.be.equal(require('../../lib/App'));
    });

    it('should retrieve db', function () {
        const test = index.db;

        expect(test).to.be.equal(require('../../lib/db'));
    });

    it('should retrieve error', function () {
        const test = index.error;

        expect(test).to.be.equal(require('../../lib/error'));
    });

    it('should retrieve module', function () {
        const test = index.module;

        expect(test).to.be.equal(require('../../lib/module'));
    });

    it('should retrieve step', function () {
        const test = index.step;

        expect(test).to.be.equal(require('../../lib/step'));
    });

    it('should retrieve storage', function () {
        const test = index.storage;

        expect(test).to.be.equal(require('../../lib/storage'));
    });

    it('should retrieve transfer', function () {
        const test = index.transfer;

        expect(test).to.be.equal(require('../../lib/transfer'));
    });

    it('should retrieve util', function () {
        const test = index.util;

        expect(test).to.be.equal(require('../../lib/util'));
    });
});
