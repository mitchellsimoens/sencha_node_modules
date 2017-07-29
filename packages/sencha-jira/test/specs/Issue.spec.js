const { expect } = require('chai');
const { Issue }  = require('../../');

describe('Issue', function () {
    let instance;

    afterEach(function () {
        if (instance && !instance.destroyed) {
            instance.destroy();
        }

        instance = null;
    });

    describe('instantiation', function () {
        beforeEach(function () {
            instance = new Issue();
        });

        it('should be a jira issue', function () {
            expect(instance).to.have.property('isInstance', true);
            expect(instance).to.have.property('isJiraIssue', true);
        });
    });
});
