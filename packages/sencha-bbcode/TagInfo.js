const { Base } = require('@extjs/sencha-core');

class TagInfo extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isBBCodeTagInfo
                 */
                isBBCodeTagInfo : true
            }
        };
    }
}

module.exports = TagInfo;
