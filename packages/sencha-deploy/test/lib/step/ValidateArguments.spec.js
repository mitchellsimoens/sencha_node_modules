const { expect } = require('chai');

const {
    error : { FatalError },
    step  : { ValidateArguments }
} = require('../../../');

describe('ValidateArguments step', function () {
    describe('execute', function () {
        it('should successfully validate arguments', function () {
            const instance = new ValidateArguments();
            const fn       = function () {
                return instance.execute({
                    info : {
                        args : {
                            product : 'foo',
                            version : '1.0.0'
                        }
                    }
                });
            };

            expect(fn).to.not.throw();
        });

        it('should require product argument', function () {
            const instance = new ValidateArguments();
            const fn       = function () {
                return instance.execute({
                    info : {
                        args : {
                            version : '1.0.0'
                        }
                    }
                });
            };

            expect(fn).to.throw(FatalError, 'Product code is undefined');
        });

        it('should require version argument', function () {
            const instance = new ValidateArguments();
            const fn       = function () {
                return instance.execute({
                    info : {
                        args : {
                            product : 'foo'
                        }
                    }
                });
            };

            expect(fn).to.throw(FatalError, 'Version is undefined');
        });

        it('should get args off the app', function () {
            const instance = new ValidateArguments();
            const fn       = function () {
                return instance.execute({
                    info : {
                        app : {
                            args : {
                                product : 'foo',
                                version : '1.0.0'
                            }
                        }
                    }
                });
            };

            expect(fn).to.not.throw();
        });
    });
});
