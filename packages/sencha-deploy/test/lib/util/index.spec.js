const { expect } = require('chai');
const index      = require('../../../lib/util/index.js');

describe('lib/util/index.js', function () {
    it('should retrieve Args', function () {
        const test = index.Args;

        expect(test).to.be.equal(require('../../../lib/util/Args'));
    });

    it('should retrieve Config', function () {
        const test = index.Config;

        expect(test).to.be.equal(require('../../../lib/util/Config'));
    });

    it('should retrieve Logger', function () {
        const test = index.Logger;

        expect(test).to.be.equal(require('../../../lib/util/Logger'));
    });

    it('should retrieve Progress', function () {
        const test = index.Progress;

        expect(test).to.be.equal(require('../../../lib/util/Progress'));
    });

    it('should retrieve Runner', function () {
        const test = index.Runner;

        expect(test).to.be.equal(require('../../../lib/util/Runner'));
    });

    it('should retrieve Shutdown', function () {
        const test = index.Shutdown;

        expect(test).to.be.equal(require('../../../lib/util/Shutdown'));
    });

    it('should retrieve Update', function () {
        const test = index.Update;

        expect(test).to.be.equal(require('../../../lib/util/Update'));
    });

    it('should retrieve Version', function () {
        const test = index.Version;

        expect(test).to.be.equal(require('../../../lib/util/Version'));
    });
});
