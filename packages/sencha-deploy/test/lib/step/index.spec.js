const { expect } = require('chai');
const index      = require('../../../lib/step/index.js');

describe('lib/step/index.js', () => {
    it('should retrieve CDN', () => {
        const test = index.CDN;

        expect(test).to.be.equal(require('../../../lib/step/CDN')); // eslint-disable-line global-require
    });

    it('should retrieve CheckProductExistence', () => {
        const test = index.CheckProductExistence;

        expect(test).to.be.equal(require('../../../lib/step/CheckProductExistence')); // eslint-disable-line global-require
    });

    it('should retrieve GetProduct', () => {
        const test = index.GetProduct;

        expect(test).to.be.equal(require('../../../lib/step/GetProduct')); // eslint-disable-line global-require
    });

    it('should retrieve HashFile', () => {
        const test = index.HashFile;

        expect(test).to.be.equal(require('../../../lib/step/HashFile')); // eslint-disable-line global-require
    });

    it('should retrieve PruneNightly', () => {
        const test = index.PruneNightly;

        expect(test).to.be.equal(require('../../../lib/step/PruneNightly')); // eslint-disable-line global-require
    });

    it('should retrieve QA', () => {
        const test = index.QA;

        expect(test).to.be.equal(require('../../../lib/step/QA')); // eslint-disable-line global-require
    });

    it('should retrieve SaveToDatabase', () => {
        const test = index.SaveToDatabase;

        expect(test).to.be.equal(require('../../../lib/step/SaveToDatabase')); // eslint-disable-line global-require
    });

    it('should retrieve SaveToStorage', () => {
        const test = index.SaveToStorage;

        expect(test).to.be.equal(require('../../../lib/step/SaveToStorage')); // eslint-disable-line global-require
    });

    it('should retrieve ValidateArguments', () => {
        const test = index.ValidateArguments;

        expect(test).to.be.equal(require('../../../lib/step/ValidateArguments')); // eslint-disable-line global-require
    });
});
