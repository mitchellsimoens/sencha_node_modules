const { expect } = require('chai');
const index      = require('../../../feature/');

describe('/feature/index.js', () => {
    it('should retrieve BodyParserable', () => {
        const test = index.BodyParserable;

        expect(test).to.be.equal(require('../../../feature/BodyParserable')); // eslint-disable-line global-require
    });

    it('should retrieve Compressable', () => {
        const test = index.Compressable;

        expect(test).to.be.equal(require('../../../feature/Compressable')); // eslint-disable-line global-require
    });

    it('should retrieve Cookieable', () => {
        const test = index.Cookieable;

        expect(test).to.be.equal(require('../../../feature/Cookieable')); // eslint-disable-line global-require
    });

    it('should retrieve Corsable', () => {
        const test = index.Corsable;

        expect(test).to.be.equal(require('../../../feature/Corsable')); // eslint-disable-line global-require
    });

    it('should retrieve Expressable', () => {
        const test = index.Expressable;

        expect(test).to.be.equal(require('../../../feature/Expressable')); // eslint-disable-line global-require
    });

    it('should retrieve FavIconable', () => {
        const test = index.FavIconable;

        expect(test).to.be.equal(require('../../../feature/FavIconable')); // eslint-disable-line global-require
    });

    it('should retrieve Minifyable', () => {
        const test = index.Minifyable;

        expect(test).to.be.equal(require('../../../feature/Minifyable')); // eslint-disable-line global-require
    });

    it('should retrieve Multerable', () => {
        const test = index.Multerable;

        expect(test).to.be.equal(require('../../../feature/Multerable')); // eslint-disable-line global-require
    });

    it('should retrieve SocketIOable', () => {
        const test = index.SocketIOable;

        expect(test).to.be.equal(require('../../../feature/SocketIOable')); // eslint-disable-line global-require
    });

    it('should retrieve SSLForceable', () => {
        const test = index.SSLForceable;

        expect(test).to.be.equal(require('../../../feature/SSLForceable')); // eslint-disable-line global-require
    });
});
