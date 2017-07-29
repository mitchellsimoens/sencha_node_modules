const { expect } = require('chai');
const index      = require('../../');

describe('/index.js', function () {
    it('should retrieve Base', function () {
        const test = index.Base;

        expect(test).to.be.equal(require('../../Base'));
    });

    it('should retrieve Class', function () {
        const test = index.Class;

        expect(test).to.be.equal(require('../../Class'));
    });

    it('should retrieve ClassMixin', function () {
        const test = index.ClassMixin;

        expect(test).to.be.equal(require('../../ClassMixin'));
    });

    it('should retrieve Config', function () {
        const test = index.Config;

        expect(test).to.be.equal(require('../../Config'));
    });

    it('should retrieve Deferrable', function () {
        const test = index.Deferrable;

        expect(test).to.be.equal(require('../../Deferrable'));
    });

    it('should retrieve Deferred', function () {
        const test = index.Deferred;

        expect(test).to.be.equal(require('../../Deferred'));
    });

    it('should retrieve Managerable', function () {
        const test = index.Managerable;

        expect(test).to.be.equal(require('../../Managerable'));
    });

    it('should retrieve Mixin', function () {
        const test = index.Mixin;

        expect(test).to.be.equal(require('../../Mixin'));
    });

    it('should retrieve combiner', function () {
        const test = index.combiner;

        expect(test).to.be.equal(require('../../combiner'));
    });

    it('should retrieve event', function () {
        const test = index.event;

        expect(test).to.be.equal(require('../../event'));
    });

    it('should retrieve operation', function () {
        const test = index.operation;

        expect(test).to.be.equal(require('../../operation'));
    });
});
