const { Base }    = require('@extjs/sencha-core');
const { Issue }   = require('./');
const { JiraApi } = require('jira-client');

/**
 * @class Sencha.jira.Jira
 */
class Jira extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isJira
                 */
                isJira : true,

                config : { // eslint-disable-line sort-keys
                    /**
                     * @cfg {String} host The host to send API calls to.
                     */

                    /**
                     * @cfg {String} password The password of the user to authenticate with.
                     */

                    /**
                     * @cfg {Number} [port=443] The port to use for requests.
                     */
                    port : 443,

                    /**
                     * @cfg {String} [protocol=https] The protocol to use.
                     */
                    protocol : 'https',

                    /**
                     * @cfg {String} user The username of the user to authenticate with.
                     */

                    /**
                     * @cfg {Number} [version=2] The API version to use.
                     */
                    version : '2'
                }
            }
        };
    }

    ctor () {
        this.jira = new JiraApi(this.protocol, this.host, this.port, this.user, this.password, this.version);
    }

    get (id) {
        return new Promise((resolve, reject) => {
            this.jira.findIssue(
                id,
                (error, issue) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(new Issue(issue));
                    }
                }
            );
        });
    }

    search (jql, options) {
        return new Promise((resolve, reject) => {
            this.jira.searchJira(
                jql,
                options,
                (error, issues) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (issues.issues) {
                            issues.issues = issues.issues.map(issue => new Issue(issue));
                        }

                        resolve(issues);
                    }
                }
            );
        });
    }
}

module.exports = Jira;
