const proxyquire = require('proxyquire');
const { expect } = require('chai');
const sinon      = require('sinon');

const { util : { Logger, Update } } = require('../../../');

const GitHub = function () {
    //
};

GitHub.prototype.authenticate = () => {
    //
};

GitHub.prototype.repos = {
    getContent () {
        //
    }
};

describe('Update', () => {
    describe('instantiation', () => {
        it('should set default configs', () => {
            const Update = proxyquire(
                '../../../lib/util/Update',
                {
                    '../../package.json' : {
                        repository : {
                            type : 'git',
                            url  : 'git+https://github.com/sencha/sencha-deploy-cli.git'
                        }
                    }
                }
            );

            const update = new Update();
            const info   = update.getRepoInfo();

            expect(info).to.be.have.property('owner', 'sencha');
            expect(info).to.be.have.property('repo',  'sencha-deploy-cli');
        });

        it('should inspect package.json repository info', () => {
            const update = new Update();

            expect(update.continueIfOutdated).to.be.false;
        });
    });

    describe('github', () => {
        it('should create GitHub instance', () => {
            const update = new Update();

            expect(update).to.have.property('github');
        });

        it('should alread have a GitHub instance', () => {
            const update = new Update();

            update._github = 'foo';

            expect(update).to.have.property('github', 'foo');
        });

        it('should authenticate', () => {
            sinon.stub(process, 'env').value({
                GITHUB_TOKEN : 'foo'
            });

            const GitHub = function GitHub () {
                return this;
            };

            const stub = sinon.stub();

            GitHub.prototype.authenticate = stub;

            const Update = proxyquire(
                '../../../lib/util/Update',
                {
                    github : GitHub
                }
            );

            const update = new Update();

            const { github } = update;

            expect(github).to.be.instanceOf(GitHub);

            expect(stub).to.be.calledOnce;
            expect(stub).to.be.calledWithExactly({
                token : 'foo',
                type  : 'oauth'
            });
        });
    });

    describe('getRepoInfo', () => {
        it('should already have repo info', () => {
            const update = new Update();

            update.repoInfo = 'foo';

            update.getRepoInfo();

            expect(update).to.have.property('repoInfo', 'foo');
        });

        it('should not match package repo url', () => {
            const Update = proxyquire(
                '../../../lib/util/Update',
                {
                    '../../package.json' : {
                        repository : {
                            type : 'git',
                            url  : 'foo'
                        }
                    }
                }
            );

            const update = new Update();
            const info   = update.getRepoInfo();

            expect(info).to.be.undefined;
        });
    });

    describe('parseResponse', () => {
        let update;

        beforeEach(() => {
            update = new Update();
        });

        afterEach(() => {
            update = null;
        });

        it('should parse content as an object', () => {
            const response = update.parseResponse({
                content : {
                    version : '1.0.0'
                }
            });

            // expect(response).to.have.deep.property('content.version', '1.0.0');
            expect(response.content).to.have.property('version', '1.0.0');
        });

        it('should parse content as JSON', () => {
            const response = update.parseResponse({
                content : JSON.stringify({
                    version : '1.0.0'
                })
            });

            // expect(response).to.have.deep.property('content.version', '1.0.0');
            expect(response.content).to.have.property('version', '1.0.0');
        });

        it('should parse content as a Buffer', () => {
            const response = update.parseResponse({
                content : Buffer.from(
                    JSON.stringify({
                        version : '1.0.0'
                    })
                )
            });

            // expect(response).to.have.deep.property('content.version', '1.0.0');
            expect(response.content).to.have.property('version', '1.0.0');
        });

        it('should parse content as a Base64 string', () => {
            const response = update.parseResponse({
                content : Buffer.from(
                    JSON.stringify({
                        version : '1.0.0'
                    })
                ).toString('base64'),
                encoding : 'base64'
            });

            // expect(response).to.have.deep.property('content.version', '1.0.0');
            expect(response.content).to.have.property('version', '1.0.0');
        });

        it('should not parse content if no content is given', () => {
            const response = update.parseResponse({});

            expect(response).to.be.empty;
        });
    });

    describe('checkVersion', () => {
        it('should match version', () => {
            const Update = proxyquire(
                '../../../lib/util/Update',
                {
                    '../../package.json' : {
                        version : '1.0.0'
                    }
                }
            );

            const mock = sinon.mock(Logger);

            mock.expects('log').once();

            const update = new Update();
            const res    = update.checkVersion({
                content : {
                    version : '1.0.0'
                }
            });

            mock.verify();

            // expect(res).to.have.deep.property('content.version', '1.0.0');
            expect(res.content).to.have.property('version', '1.0.0');
        });

        it('should throw error if a new version is available', () => {
            const Update = proxyquire(
                '../../../lib/util/Update',
                {
                    '../../package.json' : {
                        version : '1.0.0'
                    }
                }
            );

            const update = new Update();
            const fn     = () => update.checkVersion({
                content : {
                    version : '2.0.0'
                }
            });

            expect(fn).to.throw(Error, /^Please update script to version/);
        });

        it('should not throw an error if a new version is available', () => {
            const Update = proxyquire(
                '../../../lib/util/Update',
                {
                    '../../package.json' : {
                        version : '1.0.0'
                    }
                }
            );

            const mock = sinon.mock(Logger);

            mock.expects('log').twice();

            const update = new Update({
                versioning : {
                    continueIfOutdated : true
                }
            });
            const fn     = () => update.checkVersion({
                content : {
                    version : '2.0.0'
                }
            });

            expect(fn).to.not.throw(Error, /^Please update script to version/);
            // expect(fn()).to.have.deep.property('content.version', '2.0.0');
            expect(fn().content).to.have.property('version', '2.0.0');

            mock.verify();
        });

        it('should not check version if no content is provided', () => {
            const Update = proxyquire(
                '../../../lib/util/Update',
                {
                    '../../package.json' : {
                        version : '1.0.0'
                    }
                }
            );

            const mock = sinon.mock(Logger);

            mock.expects('log').never();

            const update = new Update();
            const res    = update.checkVersion({});

            mock.verify();

            expect(res).to.be.empty;
        });
    });

    describe('checkIfOutdated', () => {
        let stub;

        beforeEach(() => {
            stub = sinon.stub(process, 'env').value({
                GITHUB_TOKEN : 'abcd'
            });
        });

        afterEach(() => {
            stub.restore();
        });

        it('should check if new version is available', function * () {
            sinon.stub(GitHub.prototype.repos, 'getContent').resolves({
                content : JSON.stringify({
                    version : '1.0.0'
                })
            });

            const Update = proxyquire(
                '../../../lib/util/Update',
                {
                    '../../package.json' : {
                        version : '1.0.0'
                    },
                    github : GitHub
                }
            );

            const mock = sinon.mock(Logger);

            mock.expects('log').once();

            const update = new Update();
            const res    = yield update.checkIfOutdated();

            mock.verify();

            expect(res).to.be.false;
        });

        it('should stop execution if new version is available', () => {
            sinon.stub(GitHub.prototype.repos, 'getContent').resolves({
                content : JSON.stringify({
                    version : '2.0.0'
                })
            });

            const Update = proxyquire(
                '../../../lib/util/Update',
                {
                    '../../package.json' : {
                        version : '1.0.0'
                    },
                    github : GitHub
                }
            );

            const update = new Update();
            const res    = update.checkIfOutdated();

            return res
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('Please update script to version 2.0.0 by "npm install -g @extjs/sencha-deploy"');
                });
        });

        it('should continue execution if new version is available', function * () {
            sinon.stub(GitHub.prototype.repos, 'getContent').resolves({
                content : JSON.stringify({
                    version : '2.0.0'
                })
            });

            const Update = proxyquire(
                '../../../lib/util/Update',
                {
                    '../../package.json' : {
                        version : '1.0.0'
                    },
                    github : GitHub
                }
            );

            const mock = sinon.mock(Logger);

            mock.expects('log').once();

            const update = new Update({
                versioning : {
                    continueIfOutdated : true
                }
            });
            const res    = yield update.checkIfOutdated();

            mock.verify();

            expect(res).to.be.false;
        });
    });
});
