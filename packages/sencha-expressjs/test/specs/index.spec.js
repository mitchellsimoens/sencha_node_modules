const { expect } = require('chai');
const index      = require('../../');

describe('/index.js', function () {
    it('should retrieve Response', function () {
        const test = index.Response;

        expect(test).to.be.equal(require('../../Response'));
    });

    it('should retrieve Server', function () {
        const test = index.Server;

        expect(test).to.be.equal(require('../../Server'));
    });

    it('should retrieve SSLServer', function () {
        const test = index.SSLServer;

        expect(test).to.be.equal(require('../../SSLServer'));
    });
});
