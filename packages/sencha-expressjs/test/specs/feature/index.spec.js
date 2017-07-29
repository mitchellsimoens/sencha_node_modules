const { expect } = require('chai');
const index      = require('../../../feature/');

describe('/feature/index.js', function () {
    it('should retrieve BodyParserable', function () {
        const test = index.BodyParserable;

        expect(test).to.be.equal(require('../../../feature/BodyParserable'));
    });

    it('should retrieve Compressable', function () {
        const test = index.Compressable;

        expect(test).to.be.equal(require('../../../feature/Compressable'));
    });

    it('should retrieve Cookieable', function () {
        const test = index.Cookieable;

        expect(test).to.be.equal(require('../../../feature/Cookieable'));
    });

    it('should retrieve Expressable', function () {
        const test = index.Expressable;

        expect(test).to.be.equal(require('../../../feature/Expressable'));
    });

    it('should retrieve FavIconable', function () {
        const test = index.FavIconable;

        expect(test).to.be.equal(require('../../../feature/FavIconable'));
    });

    it('should retrieve Minifyable', function () {
        const test = index.Minifyable;

        expect(test).to.be.equal(require('../../../feature/Minifyable'));
    });

    it('should retrieve Multerable', function () {
        const test = index.Multerable;

        expect(test).to.be.equal(require('../../../feature/Multerable'));
    });

    it('should retrieve SocketIOable', function () {
        const test = index.SocketIOable;

        expect(test).to.be.equal(require('../../../feature/SocketIOable'));
    });

    it('should retrieve SSLForceable', function () {
        const test = index.SSLForceable;

        expect(test).to.be.equal(require('../../../feature/SSLForceable'));
    });
});
