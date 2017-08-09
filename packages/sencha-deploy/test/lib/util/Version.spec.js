const { expect } = require('chai');

const { util : { Version } } = require('../../../');

function doTest (fn, left, right) {
    left  = new Version(left);
    right = new Version(right);

    return left[fn](right);
}

describe('Version', function () {
    let instance;

    afterEach(function () {
        instance = null;
    });

    describe('instantiation', function () {
        it('should create parts from verison', function () {
            instance = new Version('1.0.0');

            expect(instance.parts).to.be.an('array');
            expect(instance.parts).to.have.lengthOf(3);
        });

        it('should create parts if no verison is passed', function () {
            instance = new Version();

            expect(instance.parts).to.be.an('array');
            expect(instance.parts).to.be.empty;
        });

        it('should handle hanging versions', function () {
            instance = new Version('1.0.');

            expect(instance.parts).to.be.an('array');
            expect(instance.parts).to.have.lengthOf(3);
        });
    });

    describe('isOlder', function () {
        const fn = 'isOlder';

        it('1 should be older than 2', function () {
            expect(
                doTest(
                    fn,
                    1,
                    2
                )
            ).to.be.true;
        });

        it('1 should be older than 1.1', function () {
            expect(
                doTest(
                    fn,
                    1,
                    1.1
                )
            ).to.be.true;
        });

        it('1 should not be older than 0.6', function () {
            expect(
                doTest(
                    fn,
                    1,
                    0.6
                )
            ).to.be.false;
        });

        it('0.6 should be older than .6.1', function () {
            expect(
                doTest(
                    fn,
                    0.6,
                    '.6.1'
                )
            ).to.be.true;
        });
    });

    describe('isNewer', function () {
        const fn = 'isNewer';

        it('2 should be newer than 1', function () {
            expect(
                doTest(
                    fn,
                    2,
                    1
                )
            ).to.be.true;
        });

        it('6 should be newer than 3.4', function () {
            expect(
                doTest(
                    fn,
                    6,
                    3.4
                )
            ).to.be.true;
        });

        it('4.7.32.1 should not be newer than 4.7.32.2', function () {
            expect(
                doTest(
                    fn,
                    '4.7.32.2',
                    '4.7.32.2'
                )
            ).to.be.false;
        });

        it('1.1 should be newer than 1', function () {
            expect(
                doTest(
                    fn,
                    1.1,
                    1
                )
            ).to.be.true;
        });
    });

    describe('isSame', function () {
        const fn = 'isSame';

        it('1 should be the same as 1', function () {
            expect(
                doTest(
                    fn,
                    1,
                    1
                )
            ).to.be.true;
        });

        it('6.3 should be the same as 6.3', function () {
            expect(
                doTest(
                    fn,
                    6.3,
                    6.3
                )
            ).to.be.true;
        });

        it('4.7.5 should be the same as 4.7.5', function () {
            expect(
                doTest(
                    fn,
                    '4.7.5',
                    '4.7.5'
                )
            ).to.be.true;
        });

        it('10.5.3.100 should be the same as 10.5.3.100', function () {
            expect(
                doTest(
                    fn,
                    '10.5.3.100',
                    '10.5.3.100'
                )
            ).to.be.true;
        });

        it('5 should not be the same as 5.1', function () {
            expect(
                doTest(
                    fn,
                    5,
                    5.1
                )
            ).to.be.false;
        });

        it('5 should not be the same as 5.1', function () {
            expect(
                doTest(
                    fn,
                    5,
                    5.1
                )
            ).to.be.false;
        });

        it('5.1 should not be the same as 5.1.3', function () {
            expect(
                doTest(
                    fn,
                    5.1,
                    '5.1.3'
                )
            ).to.be.false;
        });

        it('5.65.4321 should not be the same as 5.65.4321.23', function () {
            expect(
                doTest(
                    fn,
                    '5.65.4321',
                    '5.65.4321.23'
                )
            ).to.be.false;
        });
    });
});
