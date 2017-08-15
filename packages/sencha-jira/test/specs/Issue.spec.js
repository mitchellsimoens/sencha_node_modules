const { expect } = require('chai');
const { Issue }  = require('../../');

describe('Issue', () => {
    let instance;

    afterEach(() => {
        if (instance && !instance.destroyed) {
            instance.destroy();
        }

        instance = null;
    });

    describe('instantiation', () => {
        beforeEach(() => {
            instance = new Issue();
        });

        it('should be a jira issue', () => {
            expect(instance).to.have.property('isInstance', true);
            expect(instance).to.have.property('isJiraIssue', true);
        });
    });
});
