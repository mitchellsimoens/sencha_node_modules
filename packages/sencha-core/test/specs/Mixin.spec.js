const { expect } = require('chai');
const { Mixin }  = require('../../');

describe('Sencha.core.Mixin', function () {
    it('should be a mixin', function () {
        class Foo extends Mixin {}

        Foo.decorate();

        expect(Foo.prototype.isMixin).to.be.true;
    });
});
