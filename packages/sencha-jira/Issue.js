const { Base } = require('@extjs/sencha-core');

/**
 * @class Sencha.jira.Issue
 * @extends Sencha.core.Base
 */
class Issue extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isJiraIssue
                 */
                isJiraIssue : true
            }
        };
    }
}

module.exports = Issue;
