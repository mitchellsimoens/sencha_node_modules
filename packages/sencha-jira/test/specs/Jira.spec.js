const { expect }      = require('chai');
const { Issue, Jira } = require('../../');
const JiraApi         = require('jira-client');
const proxyquire      = require('proxyquire');
const sinon           = require('sinon');

describe('Jira', () => {
    let instance;

    afterEach(() => {
        if (instance && !instance.destroyed) {
            instance.destroy();
        }

        instance = null;
    });

    describe('instantiation', () => {
        beforeEach(() => {
            instance = new Jira();
        });

        it('should be a jira', () => {
            expect(instance).to.have.property('isInstance', true);
            expect(instance).to.have.property('isJira',      true);
        });
    });

    describe('ctor', () => {
        beforeEach(() => {
            instance = new Jira();
        });

        it('should create a jira api instance', () => {
            expect(instance).to.have.property('jira');
            expect(instance.jira).to.be.instanceOf(JiraApi);
        });
    });

    describe('get', () => {
        it('should handle a jira api error', () => {
            const findIssue = sinon.stub().callsArgWith(1, new Error('failed'));
            const JiraApi   = class {
                findIssue (...args) {
                    findIssue(...args);
                }
            };
            const Jira      = proxyquire(
                '../../Jira',
                {
                    'jira-client' : JiraApi
                }
            );

            instance = new Jira();

            const promise = instance.get('ABC-123');

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    findIssue.should.have.been.calledWith('ABC-123');

                    expect(error.message).to.equal('failed');
                });
        });

        it('should create an issue on success', () => {
            const findIssue = sinon.stub().callsArgWith(1, null, { foo : 'bar' });
            const JiraApi   = class {
                findIssue (...args) {
                    findIssue(...args);
                }
            };
            const Jira      = proxyquire(
                '../../Jira',
                {
                    'jira-client' : JiraApi
                }
            );

            instance = new Jira();

            const promise = instance.get('ABC-123');

            expect(promise).to.be.a('promise');

            return promise
                .then(issue => {
                    findIssue.should.have.been.calledWith('ABC-123');

                    expect(issue).to.be.instanceOf(Issue);
                    expect(issue).to.have.property('foo', 'bar');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('search', () => {
        it('should handle a jira api error', () => {
            const searchJira = sinon.stub().callsArgWith(2, new Error('failed'));
            const JiraApi    = class {
                searchJira (...args) {
                    searchJira(...args);
                }
            };
            const Jira       = proxyquire(
                '../../Jira',
                {
                    'jira-client' : JiraApi
                }
            );

            instance = new Jira();

            const promise = instance.search('SOME JQL');

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    searchJira.should.have.been.calledWith('SOME JQL');

                    expect(error.message).to.equal('failed');
                });
        });

        it('should create an issue on success', () => {
            const searchJira = sinon.stub().callsArgWith(2, null, { issues : [ { foo : 'bar' } ] });
            const JiraApi    = class {
                searchJira (...args) {
                    searchJira(...args);
                }
            };
            const Jira      = proxyquire(
                '../../Jira',
                {
                    'jira-client' : JiraApi
                }
            );

            instance = new Jira();

            const options = 'options';
            const promise = instance.search('SOME JQL', options);

            expect(promise).to.be.a('promise');

            return promise
                .then(issues => {
                    searchJira.should.have.been.calledWith('SOME JQL', options);

                    expect(issues).to.be.an('object');

                    expect(issues).to.have.property('issues');
                    expect(issues.issues).to.be.an('array');
                    expect(issues.issues).to.have.lengthOf(1);

                    expect(issues.issues[ 0 ]).to.be.instanceOf(Issue);
                    expect(issues.issues[ 0 ]).to.have.property('foo', 'bar');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle having no issues', () => {
            const searchJira = sinon.stub().callsArgWith(2, null, {  });
            const JiraApi    = class {
                searchJira (...args) {
                    searchJira(...args);
                }
            };
            const Jira      = proxyquire(
                '../../Jira',
                {
                    'jira-client' : JiraApi
                }
            );

            instance = new Jira();

            const options = 'options';
            const promise = instance.search('SOME JQL', options);

            expect(promise).to.be.a('promise');

            return promise
                .then(issues => {
                    searchJira.should.have.been.calledWith('SOME JQL', options);

                    expect(issues).to.be.an('object');
                    expect(issues).to.not.have.property('issues');
                    expect(issues).to.be.empty;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });
});
