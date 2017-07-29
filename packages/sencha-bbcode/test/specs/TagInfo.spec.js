const { expect }  = require('chai');
const { TagInfo } = require('../../');

describe('TagInfo', function () {
    let instance;

    afterEach(function () {
        if (instance) {
            instance.destroy();
            instance = null;
        }
    });

    describe('instantiation', function () {
        beforeEach(function () {
            instance = new TagInfo();
        });

        it('should be a BBCode TagInfo', function () {
            expect(instance).to.have.property('isBBCodeTagInfo', true);
        });
    });
});
