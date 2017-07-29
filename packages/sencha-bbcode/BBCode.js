const Autolinker       = require('autolinker');
const { Base, Config } = require('@extjs/sencha-core');
const { TagInfo }      = require('./');

const regexp = {
    autoLinkSkip : new RegExp(
        [ 'code',
            'quote',
            'q',
            'img',
            'url' ]
            .map(tag => `(?:(\\[${tag}(?:=(?:"|'|)(?:[^\\x00-\\x1F"'\\(\\)<>\\[\\]]{1,256}))?(?:"|'|)\\]))(.*)(?:(\\[\\/${tag}\\]))?`)
            .join('|'),
        'ig'
    ),

    // split the text by [code] tags to autolink non-code tags
    codeSplitter : /(\[code\][\s\S]*?\[\/code\])|(\[url(?:=(?:"|'|)(?:[^\x00-\x1F"'\(\)<>\[\]]{1,256}))?(?:"|'|)\][\s\S]*?\[\/url\])/i,

    // color names or hex color
    // TODO don't need static names
    color : /^(:?black|silver|gray|white|maroon|red|purple|fuchsia|green|lime|olive|yellow|navy|blue|teal|aqua|#(?:[0-9a-f]{3})?[0-9a-f]{3})$/i,

    fiddle : /^https?:\/\/fiddle.sencha.com\/\s*#.*fiddle\/([a-z0-9]+).*$/i,

    fiddleLinkInAttr : /(\[url(?:="?https?:\/\/fiddle.sencha.com\/#.*fiddle\/([a-z0-9]+).*"?)+\].*\[\/url\])/igm,

    fiddleLinkInUrl : /(\[(?:code|url)\]\s*(?:\[noparse\])*\s*https?:\/\/fiddle.sencha.com\/\s*#.*fiddle\/([a-z0-9]+).*\s*(?:\[\/noparse\])*\[\/(?:code|url)\])/igm,

    nbsp : /&(.*;)/gm,

    // numbers
    number : /^[\\.0-9]{1,8}$/i,

    // parse inner code/quote content, recursion!
    parseMiddleContent : /(?:(\[[a-z]+(?:=(?:"|'|)(?:[^\x00-\x1F"'\(\)<>\[\]]{1,256}))?(?:"|'|)\]))(.*)(?:(\[\/[a-z]+\]))/gi,

    // main regular expression: CRLF, [tag=option], [tag="option"] [tag] or [/tag]
    postfmt : /([\r\n])|(?:\[([a-z]{1,16})(?:=(?:"|'|)([^\x00-\x1F"'\(\)<>\[\]]{1,256}))?(?:"|'|)\])|(?:\[\/([a-z]{1,16})\])/ig,

    // checks what protocol a uri is using
    protocol : /^https?.*$/i,

    // reserved, unreserved, escaped and alpha-numeric [RFC2396]
    uri : /^[-;#\/\?:@&=\+\$,_\.!~\*'\(\)%0-9a-z]{1,512}$/i
};

const defaultAutolinkConfig = {
    newWindow   : true,
    stripPrefix : false,
    twitter     : false,
    replaceFn (match) { // eslint-disable-line sort-keys
        if (match.getType() === 'url') {
            const text          = match.getMatchedText();
            const url           = match.getUrl();
            const matchesFiddle = url.match(regexp.fiddle);

            // Fiddle URI should be wrapped in FIDDLE tags
            if (matchesFiddle && matchesFiddle[ 1 ]) {
                return `\n\r[FIDDLE]${matchesFiddle[ 1 ]}[/FIDDLE]\n\r`;
            }

            // Any other URI should only be auto-linked if it was designed
            // to be a link with a defined protocol
            if (text.match(regexp.protocol)) {
                return `[url]${url}[/url]`;
            }

            // No fiddle URI or protocol explicitly defined so return the original text
            return false;
        }

        return true;
    }
};

class BBCode extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isBBCode
                 */
                isBBCode : true
            },

            statics : {
                regexp
            }
        };
    }

    static get autolink () {
        const autolink = this._autolink;

        if (autolink) {
            return autolink;
        } else {
            this.autolink = Object.assign({}, defaultAutolinkConfig, Config.get('bbcode.autolink'));

            return this._autolink;
        }
    }

    static set autolink (config) {
        if (config) {
            this._autolink = new Autolinker(config);
        } else {
            delete this._autolink;
        }
    }

    static get defaultTags () {
        return {
            b          : 'parseB',
            blockquote : 'parseQuote',
            center     : 'parseCenter',
            code       : 'parseCode',
            color      : 'parseColor',
            colour     : 'parseColor',
            font       : 'parseFont',
            i          : 'parseI',
            img        : 'parseImg',
            li         : null,
            link       : 'parseLink',
            list       : 'parseList',
            noparse    : 'parseNoparse',
            pre        : 'parsePre',
            q          : 'parseQuote',
            quote      : 'parseQuote',
            s          : 'parseS',
            size       : 'parseSize',
            u          : 'parseU',
            ulist      : 'parseUlist',
            url        : 'parseLink'
        };
    }

    static parse (text) {
        if (!text) {
            return text;
        }

        const { defaultTags } = this;
        const server          = Config.get('server');

        text = text.replace(regexp.nbsp, '&#38;$1');

        defaultTags.fiddle = function (tag, attr, opentags) {
            opentags.push(
                new TagInfo({
                    bbtag : tag,
                    etag  : '?height=600" style="border:0;height:600px;width:600px;" class="sencha-fiddle"></iframe>'
                })
            );

            return '<iframe src="https://fiddle.sencha.com/fiddle/';
        };

        if (server) {
            const { vhost } = server;

            defaultTags.issue = function (tag, attr, opentags) {
                opentags.push(
                    new TagInfo({
                        bbtag : tag,
                        etag  : '" class="sencha-issue"></iframe>'
                    })
                );

                return `<iframe src="https://${vhost}/v1.0/issue/`;
            };
        }

        return new this({
            tags : defaultTags
        })
            .parse(text);
    }

    constructor (config) {
        super(config);

        const me       = this;
        let   { tags } = me;

        if (!tags) {
            tags = me.constructor.defaultTags;

            me.tags = tags;
        }

        if (!me.tagnameRe) {
            const tagre = [];

            for (const tag in tags) {
                tagre.push(tag);
            }

            me.tagnameRe = new RegExp(`^\/?(?:${tagre.join('|')})$`, 'i');
        }
    }

    dtor () {
        Object.assign(this, {
            tagnameRe : null,
            tags      : null
        });
    }

    autolink (text) {
        const { autolink } = this.constructor;

        return autolink.link(text);
    }

    parse (post) {
        const me       = this;
        const { tags } = me;
        let crlf2br  = true,     // convert CRLF to <br>?
            noparse  = false,    // ignore BBCode tags?
            opentags = [],       // open tag stack
            urlstart = -1;       // beginning of the URL if zero or greater (ignored if -1)

        //
        // m1 - CR or LF
        // tag - the tag of the [tag=option] expression
        // attr - the option of the [tag=option] expression
        // tagEnd - the end tag of the [/tag] expression
        //
        function textToHtmlCB (mstr, m1, tag, attr, tagEnd, offset, string) {
            //
            // CR LF sequences
            //
            if (m1 && m1.length) {
                if (!crlf2br) {
                    return mstr;
                }

                switch (m1) {
                    case '\r' :
                        return '';
                    case '\n' :
                        return '<br>';
                }
            }

            // if noparse is true, we need to handle any possible
            // matching bbcode
            if (noparse && opentags.length) {
                const opentag = opentags.find(opentag => opentag.bbtag === tagEnd);

                // need to check if a matching inner bbcode is the same as
                // the tag end. This will prevent it from returning the
                // ending bbcode on error
                if (opentag) {
                    const idx = opentags.indexOf(opentag);

                    // since we are ending the tag, remove from opentags
                    opentags.splice(idx, 1);

                    // reset no parse since we are done with the tag
                    noparse = false;

                    return opentag.etag;
                }

                // return the tag so it's not mutated during a noparse op
                return mstr;
            }

            //
            // handle start tags
            //
            if (me.isValidTag(tag)) {
                const tagL = tag.toLowerCase();
                let   fn   = tags[ tagL ];

                // if in the noparse state, just echo the tag
                if (noparse) {
                    return `[${tag}]`;
                }

                // ignore any tags if there's an open option-less [url] tag
                if (
                    opentags.length &&                    (
                        opentags[ opentags.length - 1 ].bbtag === 'url' ||                        opentags[ opentags.length - 1 ].bbtag === 'link'
                    ) &&                    urlstart >= 0
                ) {
                    return `[${tag}]`;
                }

                if (fn) {
                    if (typeof fn === 'string') {
                        fn = me[ fn ]; // eslint-disable-line prefer-destructuring
                    }

                    const parsed = fn.call(me, tagL, attr, opentags, {
                        mstr,
                        offset
                    });

                    if (typeof parsed === 'string') {
                        return parsed;
                    }

                    if (typeof parsed.crlf2br !== 'undefined') {
                        crlf2br = parsed.crlf2br; // eslint-disable-line prefer-destructuring
                    }

                    if (typeof parsed.noparse !== 'undefined') {
                        noparse = parsed.noparse; // eslint-disable-line prefer-destructuring
                    }

                    if (typeof parsed.urlstart !== 'undefined') {
                        urlstart = parsed.urlstart; // eslint-disable-line prefer-destructuring
                    }

                    return parsed.text;
                } else {
                    // [samp] and [u] don't need special processing
                    opentags.push(
                        new TagInfo({
                            bbtag : tagL,
                            etag  : `</${tagL}>`
                        })
                    );

                    return `<${tagL}>`;
                }
            }

            //
            // process end tags
            //
            if (me.isValidTag(tagEnd)) {
                const tagEndL = tagEnd && tagEnd.toLowerCase();

                if (noparse) {
                    // if it's the closing noparse tag, flip the noparse state
                    if (tagEnd === 'noparse') {
                        noparse = false;

                        return '';
                    }

                    // otherwise just output the original text
                    return `[/${tagEnd}]`;
                }

                // highlight mismatched end tags
                if (!opentags.length || opentags[ opentags.length - 1 ].bbtag != tagEndL) {
                    return `<span style="color: red">[/${tagEnd}]</span>`;
                }

                if (tagEndL === 'url' || tagEndL === 'link') {
                    // if there was no option, use the content of the [url] tag
                    if (urlstart > 0) {
                        return `">${string.substr(urlstart, offset - urlstart)}${opentags.pop().etag}`;
                    }

                    // otherwise just close the tag
                    return opentags.pop().etag;
                } else if (tagEndL === 'code' || tagEndL === 'pre') {
                    crlf2br = true;
                }

                // other tags require no special processing, just output the end tag
                return opentags.pop().etag;
            }

            return mstr;
        }

        // actual parsing can begin
        let result = '', // eslint-disable-line one-var
            endtags; // eslint-disable-line sort-vars

        // convert CRLF to <br> by default
        crlf2br = true;

        // create a new array for open tags
        if (!opentags || opentags.length) {
            opentags = [];
        }

        // run the text through main regular expression matcher
        if (post) {
            // idea to replace single *'s from http://patorjk.com/bbcode-previewer/
            post = (function (_post) {
                return _post.replace(/(\[\*\])([^\[]*)/g, (m0, m1, tag) => `[li]${tag}[/li]`);
            })(post);

            post   = me.encodeHtml(post);
            post   = me.doAutoLink(post);
            post   = post
                .replace(regexp.fiddleLinkInUrl,  '[FIDDLE]$2[/FIDDLE]')  // replaces [url]https://fiddle.sencha.com/#fiddle/abc[/url]
                .replace(regexp.fiddleLinkInAttr, '[FIDDLE]$2[/FIDDLE]'); // replaces [url="https://fiddle.sencha.com/#fiddle/abc"]fiddle[/url]
            result = post.replace(regexp.postfmt, textToHtmlCB);

            // reset noparse, if it was unbalanced
            if (noparse) {
                noparse = false;
            }

            // if there are any unbalanced tags, make sure to close them
            if (opentags.length) {
                endtags = '';

                // if there's an open [url] at the top, close it
                if (opentags[ opentags.length - 1 ].bbtag === 'url' || opentags[ opentags.length - 1 ].bbtag === 'link') {
                    opentags.pop();

                    endtags += `">${post.substr(urlstart, post.length - urlstart)}</a>`;
                }

                // close remaining open tags
                while (opentags.length) {
                    endtags += opentags.pop().etag;
                }
            }
        }

        return endtags ? result + endtags : result;
    }

    isValidTag (str) {
        if (!str || !str.length) {
            return false;
        }

        return this.tagnameRe.test(str);
    }

    doAutoLink (text) {
        const { autoLinkSkip, codeSplitter } = regexp;

        return text
            .split(codeSplitter)
            .map(text => text && !text.match(autoLinkSkip) ? this.autolink(text) : text)
            .join('');
    }

    encodeHtml (text) {
        // encode < and >
        return text.replace(/(<|>)/gm, match => match === '<' ? '&lt;' : '&gt;');
    }

    parseB (tagL, attr, opentags) {
        opentags.push(
            new TagInfo({
                bbtag : tagL,
                etag  : '</strong>'
            })
        );

        return '<strong>';
    }

    parseCenter (tagL, attr, opentags) {
        opentags.push(
            new TagInfo({
                bbtag : tagL,
                etag  : '</div>'
            })
        );

        return {
            crlf2br : false,
            text    : '<div style="text-align: center;">'
        };
    }

    parseCode (tagL, attr = 'php', opentags) {
        opentags.push(
            new TagInfo({
                bbtag : tagL,
                etag  : '</code></pre></div>'
            })
        );

        return {
            noparse : true,
            text    : `<div class="code"><pre class="${attr}"><code>`
        };
    }

    parseColor (tagL, attr = 'inherit', opentags) {
        if (!regexp.color.test(attr)) {
            attr = 'inherit';
        }

        opentags.push(
            new TagInfo({
                bbtag : tagL,
                etag  : '</span>'
            })
        );

        return `<span style="color: ${attr}">`;
    }

    parseFont (tagL, attr, opentags) {
        opentags.push(
            new TagInfo({
                bbtag : tagL,
                etag  : '</span>'
            })
        );

        return `<span style="font-family: ${attr}">`;
    }

    parseI (tagL, attr, opentags) {
        opentags.push(
            new TagInfo({
                bbtag : tagL,
                etag  : '</em>'
            })
        );

        return '<em>';
    }

    parseImg (tagL, attr, opentags) {
        opentags.push(
            new TagInfo({
                bbtag : tagL,
                etag  : '" />'
            })
        );

        if (attr && regexp.uri.test(attr)) {
            return {
                text     : `<${tagL} src="${attr}" alt="`,
                urlstart : -1
            };
        }

        return `<${tagL} src="`;
    }

    parseLink (tagL, attr, opentags, opt) {
        const { mstr, offset } = opt;

        opentags.push(
            new TagInfo({
                bbtag : tagL,
                etag  : '</a>'
            })
        );

        // check if there's a valid option
        if (attr && regexp.uri.test(attr)) {
            // if there is, output a complete start anchor tag
            // urlstart = -1;

            return {
                text     : `<a target="_blank" href="${attr}">`,
                urlstart : -1
            };
        }

        // otherwise, remember the URL offset
        // urlstart = mstr.length + offset;

        // and treat the text following [url] as a URL
        return {
            text     : '<a target="_blank" href="',
            urlstart : mstr.length + offset
        };
    }

    parseList (tagL, attr, opentags) {
        const tag = attr ? 'ol' : 'ul';

        opentags.push(
            new TagInfo({
                bbtag : tagL,
                etag  : `</${tag}>`
            })
        );

        return `<${tag}>`;
    }

    parseNoparse () {
        return {
            noparse : true,
            text    : ''
        };
    }

    parsePre (tagL, attr, opentags) {
        opentags.push(
            new TagInfo({
                bbtag : tagL,
                etag  : '</pre>'
            })
        );

        return {
            crlf2br : false,
            text    : '<pre>'
        };
    }

    parseQuote (tagL, attr, opentags) {
        const tag = tagL === 'q' ? 'q' : 'blockquote';
        let   cite;

        opentags.push(
            new TagInfo({
                bbtag : tagL,
                etag  : `</${tag}>`
            })
        );

        if (attr) {
            attr = attr.split(';');

            if (attr.length === 3) {
                attr = `${attr[ 0 ]} <a href="#ticket-${attr[ 1 ]}-${attr[ 2 ]}">#${attr[ 2 ]}</a>`;
            } else {
                attr = attr[ 0 ]; // eslint-disable-line prefer-destructuring
            }

            cite = `quote: ${attr}`;
        } else {
            cite = 'quote';
        }

        return `<${tag} class="quote"><div class="quote-reference">${cite}</div>`;
    }

    parseS (tagL, attr, opentags) {
        opentags.push(
            new TagInfo({
                bbtag : tagL,
                etag  : '</span>'
            })
        );

        return '<span style="text-decoration: line-through;">';
    }

    parseSize (tagL, attr = 1, opentags) {
        if (regexp.number.test(attr)) {
            attr = parseInt(attr);
        } else {
            attr = 1;
        }

        opentags.push(
            new TagInfo({
                bbtag : tagL,
                etag  : '</span>'
            })
        );

        if (attr > 5) {
            attr = `${attr}px`;
        } else {
            attr = `${Math.min(Math.max(attr, 0.7), 3)}em`;
        }

        return `<span style="font-size: ${attr}">`;
    }

    parseU (tagL, attr, opentags) {
        opentags.push(
            new TagInfo({
                bbtag : tagL,
                etag  : '</span>'
            })
        );

        return '<span style="text-decoration: underline;">';
    }

    parseUlist (tagL, attr, opentags) {
        opentags.push(
            new TagInfo({
                bbtag : tagL,
                etag  : '</ul>'
            })
        );

        return '<ul>';
    }
}

module.exports = BBCode;
