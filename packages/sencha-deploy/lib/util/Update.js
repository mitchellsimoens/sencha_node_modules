const GitHub = require('github');
const pkg    = require('../../package.json');

const {
    error : { FatalError },
    util  : { Logger, Version }
} = require('../');

const repoRe = /github\.com\/(.*)\/(.*)\.git/i;

class Update {
    constructor (config = { versioning : { continueIfOutdated : false } }) {
        this.continueIfOutdated = config.versioning.continueIfOutdated;
    }

    get github () {
        let github = this._github;

        if (!github && process.env.GITHUB_TOKEN) {
            github = new GitHub();

            this.github = github;

            github.authenticate({
                token : process.env.GITHUB_TOKEN,
                type  : 'oauth'
            });
        }

        return github;
    }

    set github (github) {
        this._github = github;
    }

    getRepoInfo () {
        let { repoInfo } = this;

        if (!repoInfo) {
            const matches = pkg.repository.url.match(repoRe);

            if (matches) {
                repoInfo = {
                    owner : matches[ 1 ],
                    repo  : matches[ 2 ]
                };

                this.repoInfo = repoInfo;
            }
        }

        return repoInfo;
    }

    checkIfOutdated () {
        return new Promise((resolve, reject) => {
            const { github } = this;
            const repoInfo   = this.getRepoInfo();

            if (github) {
                const request = github.repos.getContent({
                    owner : repoInfo.owner,
                    path  : 'package.json',
                    repo  : repoInfo.repo
                });

                request
                    .then(this.parseResponse.bind(this))
                    .then(this.checkVersion .bind(this)) // eslint-disable-line no-whitespace-before-property
                    .then(() => false)
                    .then(resolve)
                    .catch(reject);
            } else {
                resolve(false);
            }
        });
    }

    parseResponse (response) {
        if (response.content) {
            if (response.encoding === 'base64') {
                response.content = Buffer.from(response.content, 'base64');
            }

            if (Buffer.isBuffer(response.content)) {
                response.content = response.content.toString();
            }

            if (typeof response.content === 'string') {
                response.content = JSON.parse(response.content);
            }
        }

        return response;
    }

    checkVersion (response) {
        const { content } = response;

        if (content) {
            const localVersion  = new Version(pkg.version);
            const remoteVersion = new Version(content.version);

            if (!localVersion.isOlder(remoteVersion)) {
                Logger.info(`You have the latest version (${pkg.version}).`);
            } else if (this.continueIfOutdated) {
                Logger.info(`A New version is available, you could update your script with "npm install -g ${pkg.name}"`);
            } else {
                throw new FatalError(`Please update script to version ${content.version} by "npm install -g ${pkg.name}"`);
            }

            return response;
        } else {
            return response;
        }
    }
}

module.exports = Update;
