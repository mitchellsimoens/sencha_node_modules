const { expect } = require('chai');
const index      = require('../../');

describe('/index.js', function () {
    it('should retrieve Issue', function () {
        const test = index.Issue;

        expect(test).to.be.equal(require('../../Issue'));
    });

    it('should retrieve Jira', function () {
        const test = index.Jira;

        expect(test).to.be.equal(require('../../Jira'));
    });
});
