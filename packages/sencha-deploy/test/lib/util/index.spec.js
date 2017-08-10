const { expect } = require('chai');
const index      = require('../../../lib/util/index.js');

describe('lib/util/index.js', () => {
    it('should retrieve Args', () => {
        const test = index.Args;

        expect(test).to.be.equal(require('../../../lib/util/Args')); // eslint-disable-line global-require
    });

    it('should retrieve Config', () => {
        const test = index.Config;

        expect(test).to.be.equal(require('../../../lib/util/Config')); // eslint-disable-line global-require
    });

    it('should retrieve Logger', () => {
        const test = index.Logger;

        expect(test).to.be.equal(require('../../../lib/util/Logger')); // eslint-disable-line global-require
    });

    it('should retrieve Progress', () => {
        const test = index.Progress;

        expect(test).to.be.equal(require('../../../lib/util/Progress')); // eslint-disable-line global-require
    });

    it('should retrieve Runner', () => {
        const test = index.Runner;

        expect(test).to.be.equal(require('../../../lib/util/Runner')); // eslint-disable-line global-require
    });

    it('should retrieve Shutdown', () => {
        const test = index.Shutdown;

        expect(test).to.be.equal(require('../../../lib/util/Shutdown')); // eslint-disable-line global-require
    });

    it('should retrieve Version', () => {
        const test = index.Version;

        expect(test).to.be.equal(require('../../../lib/util/Version')); // eslint-disable-line global-require
    });
});
