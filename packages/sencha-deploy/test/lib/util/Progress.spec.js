const { expect } = require('chai');

const { util : { Logger, Progress } } = require('../../../');

describe('Progress', function () {
    describe('instantiation', function () {
        it('should have only defaults with no config', function () {
            const progress = new Progress();

            expect(progress).to.have.property('completeToken',   '\u2587');
            expect(progress).to.have.property('length',          50);
            expect(progress).to.have.property('showComplete',    true);
            expect(progress).to.have.property('incompleteToken', ' ');
        });

        it('should set completeToken', function () {
            const progress = new Progress({
                completeToken : '#'
            });

            expect(progress).to.have.property('completeToken',   '#');
            expect(progress).to.have.property('length',          50);
            expect(progress).to.have.property('showComplete',    true);
            expect(progress).to.have.property('incompleteToken', ' ');
        });

        it('should set length', function () {
            const progress = new Progress({
                length : 100
            });

            expect(progress).to.have.property('completeToken',   '\u2587');
            expect(progress).to.have.property('length',          100);
            expect(progress).to.have.property('showComplete',    true);
            expect(progress).to.have.property('incompleteToken', ' ');
        });

        it('should set showComplete', function () {
            const progress = new Progress({
                showComplete : false
            });

            expect(progress).to.have.property('completeToken',   '\u2587');
            expect(progress).to.have.property('length',          50);
            expect(progress).to.have.property('showComplete',    false);
            expect(progress).to.have.property('incompleteToken', ' ');
        });

        it('should set incompleteToken', function () {
            const progress = new Progress({
                incompleteToken : ' '
            });

            expect(progress).to.have.property('completeToken',   '\u2587');
            expect(progress).to.have.property('length',          50);
            expect(progress).to.have.property('showComplete',    true);
            expect(progress).to.have.property('incompleteToken', ' ');
        });
    });

    describe('update', function () {
        it('should execute Logger.log once', function () {
            const mock     = this.sandbox.mock(Logger);
            const progress = new Progress();

            mock.expects('log').once();

            progress.update(.5);

            mock.verify();
        });

        it('should execute Logger.log once with multiple update calls', function () {
            const mock     = this.sandbox.mock(Logger);
            const progress = new Progress();

            mock.expects('log').once();

            progress.update(.5);
            progress.update(.5);

            mock.verify();
        });

        it('should execute Logger.log twice on complete', function () {
            const mock     = this.sandbox.mock(Logger);
            const progress = new Progress();

            mock.expects('log').twice();

            progress.update(1);

            mock.verify();
        });

        it('should skip if progress not unique', function () {
            const mock     = this.sandbox.mock(Logger);
            const progress = new Progress({
                showUniqueProgress : true
            });

            mock.expects('log').once();

            progress.update(.5);
            progress.update(.501);

            mock.verify();
        });

        it('should still log progress if unique', function () {
            const mock     = this.sandbox.mock(Logger);
            const progress = new Progress({
                showUniqueProgress : true
            });

            mock.expects('log').twice();

            progress.update(.5);
            progress.update(.51);

            mock.verify();
        });
    });

    describe('update message', function () {
        it('should log with proper format for double single progress', function () {
            const mock     = this.sandbox.mock(Logger);
            const progress = new Progress();

            const msg = [
                '[',
                ((i, length) => {
                    let data = [];

                    for (; i < length; i++) {
                        data.push('\u2587');
                    }

                    return data.join('');
                })(0, 3),
                ((i, length) => {
                    let data = [];

                    for (; i < length; i++) {
                        data.push(' ');
                    }

                    return data.join('');
                })(0, 47),
                ']'
            ].join('');

            mock.expects('log').once().withArgs('INFO', 'Progress:', msg, '  7', '%');

            progress.update(.07);

            mock.verify();
        });

        it('should log with proper format for double digit progress', function () {
            const mock     = this.sandbox.mock(Logger);
            const progress = new Progress();

            const msg = [
                '[',
                ((i, length) => {
                    let data = [];

                    for (; i < length; i++) {
                        data.push('\u2587');
                    }

                    return data.join('');
                })(0, 25),
                ((i, length) => {
                    let data = [];

                    for (; i < length; i++) {
                        data.push(' ');
                    }

                    return data.join('');
                })(0, 25),
                ']'
            ].join('');

            mock.expects('log').once().withArgs('INFO', 'Progress:', msg, ' 50', '%');

            progress.update(.5);

            mock.verify();
        });

        it('should log with proper format for triple digit progress', function () {
            const mock     = this.sandbox.mock(Logger);
            const progress = new Progress({
                showComplete : false
            });

            const msg = [
                '[',
                ((i, length) => {
                    let data = [];

                    for (; i < length; i++) {
                        data.push('\u2587');
                    }

                    return data.join('');
                })(0, 50),
                ']'
            ].join('');

            mock.expects('log').once().withArgs('INFO', 'Progress:', msg, 100, '%');

            progress.update(1);

            mock.verify();
        });
    });
});
