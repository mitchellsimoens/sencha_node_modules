const { expect } = require('chai');
const index      = require('../../');

describe('/index.js', () => {
    it('should retrieve Issue', () => {
        const test = index.Issue;

        expect(test).to.be.equal(require('../../Issue')); // eslint-disable-line global-require
    });

    it('should retrieve Jira', () => {
        const test = index.Jira;

        expect(test).to.be.equal(require('../../Jira')); // eslint-disable-line global-require
    });
});
