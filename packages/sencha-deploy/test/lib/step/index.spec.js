const { expect } = require('chai');
const index      = require('../../../lib/step/index.js');

describe('lib/step/index.js', function () {
    it('should retrieve CDN', function () {
        const test = index.CDN;

        expect(test).to.be.equal(require('../../../lib/step/CDN'));
    });

    it('should retrieve CheckProductExistence', function () {
        const test = index.CheckProductExistence;

        expect(test).to.be.equal(require('../../../lib/step/CheckProductExistence'));
    });

    it('should retrieve CheckUpdate', function () {
        const test = index.CheckUpdate;

        expect(test).to.be.equal(require('../../../lib/step/CheckUpdate'));
    });

    it('should retrieve GetProduct', function () {
        const test = index.GetProduct;

        expect(test).to.be.equal(require('../../../lib/step/GetProduct'));
    });

    it('should retrieve HashFile', function () {
        const test = index.HashFile;

        expect(test).to.be.equal(require('../../../lib/step/HashFile'));
    });

    it('should retrieve PruneNightly', function () {
        const test = index.PruneNightly;

        expect(test).to.be.equal(require('../../../lib/step/PruneNightly'));
    });

    it('should retrieve QA', function () {
        const test = index.QA;

        expect(test).to.be.equal(require('../../../lib/step/QA'));
    });

    it('should retrieve SaveToDatabase', function () {
        const test = index.SaveToDatabase;

        expect(test).to.be.equal(require('../../../lib/step/SaveToDatabase'));
    });

    it('should retrieve SaveToStorage', function () {
        const test = index.SaveToStorage;

        expect(test).to.be.equal(require('../../../lib/step/SaveToStorage'));
    });

    it('should retrieve ValidateArguments', function () {
        const test = index.ValidateArguments;

        expect(test).to.be.equal(require('../../../lib/step/ValidateArguments'));
    });
});
