const { expect }    = require('chai');
const { Operation } = require('../../../operation');

describe('Operation', function () {
    let instance;

    afterEach(function () {
        if (instance) {
            instance.destroy();
            instance = null;
        }
    });

    describe('instantiation', function () {
        beforeEach(function () {
            instance = new Operation();
        });

        it('should be an operation', function () {
            expect(instance).to.have.property('isOperation', true);
        });
    });

    describe('flatten', function () {
        beforeEach(function () {
            instance = new Operation();
        });

        it('should flatten shallow array', function () {
            const array  = [ 'foo', 'bar', 'baz' ];
            const result = instance.flatten(array);

            expect(result).to.be.an('array');
            expect(result).to.have.lengthOf(3);
            expect(result).to.have.deep.property('[0]', 'foo');
            expect(result).to.have.deep.property('[1]', 'bar');
            expect(result).to.have.deep.property('[2]', 'baz');
        });

        it('should flatten array with one array', function () {
            const array  = [ [ 'foo', 1, 2 ], 'bar', 'baz' ];
            const result = instance.flatten(array);

            expect(result).to.be.an('array');
            expect(result).to.have.lengthOf(5);
            expect(result).to.have.deep.property('[0]', 'foo');
            expect(result).to.have.deep.property('[1]', 1);
            expect(result).to.have.deep.property('[2]', 2);
            expect(result).to.have.deep.property('[3]', 'bar');
            expect(result).to.have.deep.property('[4]', 'baz');
        });

        it('should not flatten non-array', function () {
            const result = instance.flatten('foo');

            expect(result).to.equal('foo');
        });
    });

    describe('singularize', function () {
        beforeEach(function () {
            instance = new Operation();
        });

        it('should return first array item', function () {
            const array  = [ 'foo', 'bar', 'baz' ];
            const result = instance.singularize(array);

            expect(result).to.equal('foo');
        });

        it('should return non-array', function () {
            const result = instance.singularize('bar');

            expect(result).to.equal('bar');
        });
    });
});
