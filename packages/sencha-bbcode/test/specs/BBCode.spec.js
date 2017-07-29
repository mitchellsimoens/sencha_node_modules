const Autolinker = require('autolinker');
const { expect } = require('chai');
const { BBCode } = require('../../');
const { Config } = require('@extjs/sencha-core');

describe('BBCode', function () {
    let instance;

    const doTest = (test, expected) => {
        instance = new BBCode();

        const parsed = instance.parse(test);

        expect(parsed).to.equal(expected);
    };

    afterEach(function () {
        if (instance) {
            instance.destroy();
            instance = null;
        }
    });

    describe('instantiation', function () {
        it('should be a BBCode', function () {
            instance = new BBCode();

            expect(instance).to.have.property('isBBCode', true);
        });

        it('should not override tags', function () {
            instance = new BBCode({
                tags : {
                    b : 'fakeParseB'
                }
            });

            expect(instance.tags).to.have.property('b', 'fakeParseB');
            expect(instance.tags).to.not.have.property('code');
        });

        it('should not override tagname_re', function () {
            instance = new BBCode({
                tagname_re : /foo/
            });

            const result = instance.tagname_re.test('foo');

            expect(result).to.be.true;
        });
    });

    describe('static autolink', function () {
        it('should set autolink static', function () {
            expect(BBCode._autolink).to.be.undefined;

            const { autolink } = BBCode;

            expect(autolink).to.be.instanceOf(Autolinker);
            expect(BBCode._autolink).to.not.be.undefined;

            BBCode.autolink = undefined;

            expect(BBCode._autolink).to.be.undefined;
        });
    });

    describe('doAutoLink', function () {
        it('should autolink url in text', function () {
            const expected = `Go to: <a target="_blank" href="https://www.sencha.com">https://www.sencha.com</a>`;
            const test     = `Go to: https://www.sencha.com`;

            doTest(test, expected);
        });

        it('should turn fiddle link into using [FIDDLE] bbcode', function () {
            const expected = `Check this fiddle: <br>[FIDDLE]abc[/FIDDLE]<br> Isn't that cool?`;
            const test     = `Check this fiddle: https://fiddle.sencha.com/#fiddle/abc Isn't that cool?`;

            doTest(test, expected);
        });

        it('should not autolink ftp url', function () {
            const expected = `Use ftp://www.sencha.com as the url`;
            const test     = `Use ftp://www.sencha.com as the url`;

            doTest(test, expected);
        });
    });

    describe('encodeHtml', function () {
        it('should not encode anything', function () {
            const expected = `Hello there`;
            const test     = `Hello there`;

            doTest(test, expected);
        });

        it('should encode a HTML tag', function () {
            const expected = `&lt;p&gt;Hello there&lt;/p&gt;`;
            const test     = `<p>Hello there</p>`;

            doTest(test, expected);
        });

        it('should encode multiple HTML tags', function () {
            const expected = `&lt;p&gt;Hello there&lt;/p&gt;<br>&lt;div&gt;A test&lt;/div&gt;`;
            const test     = `<p>Hello there</p>
<div>A test</div>`;

            doTest(test, expected);
        });
    });

    describe('parse', function () {
        describe('static', function () {
            it('should parse text', function () {
                const expected = `This is <strong>a</strong> test`;
                const test     = `This is [b]a[/b] test`;
                const parsed   = BBCode.parse(test);

                expect(parsed).to.equal(expected);
            });

            it('should not parse if nothing to parse', function () {
                const expected = ``;
                const test     = ``;
                const parsed   = BBCode.parse(test);

                expect(parsed).to.equal(expected);
            });

            it('should parse [fiddle] tag', function () {
                const expected = `<iframe src="https://fiddle.sencha.com/fiddle/abc?height=600" style="border:0;height:600px;width:600px;" class="sencha-fiddle"></iframe>`;
                const test     = `[FIDDLE]abc[/FIDDLE]`;
                const parsed   = BBCode.parse(test);

                expect(parsed).to.equal(expected);
            });

            describe('[issue]', function () {
                it('should parse the issue tag', function () {
                    Config.set('server.vhost', 'https://foo.com');

                    const expected = `<iframe src="https://https://foo.com/v1.0/issue/ABC-1234" class="sencha-issue"></iframe>`;
                    const test     = `[ISSUE]ABC-1234[/ISSUE]`;
                    const parsed   = BBCode.parse(test);

                    expect(parsed).to.equal(expected);

                    Config.set('server', null);
                });

                it('should not parse issue tag if no server config', function () {
                    const expected = `[ISSUE]ABC-1234[/ISSUE]`;
                    const test     = `[ISSUE]ABC-1234[/ISSUE]`;
                    const parsed   = BBCode.parse(test);

                    expect(parsed).to.equal(expected);
                });
            });
        });

        describe('prototype', function () {
            it('should not parse if nothing to parse', function () {
                const expected = ``;
                const test     = ``;

                doTest(test, expected);
            });
        });
    });

    describe('default tags', function () {
        describe('[b]', function () {
            it('should parse a code tag', function () {
                const expected = `This is <strong>a</strong> test`;
                const test     = `This is [b]a[/b] test`;

                doTest(test, expected);
            });
        });

        describe('[center]', function () {
            it('should parse a color tag', function () {
                const expected = `This is a <div style="text-align: center;">test</div>`;
                const test     = `This is a [center]test[/center]`;

                doTest(test, expected);
            });
        });

        describe('[code]', function () {
            it('should parse a code tag', function () {
                const expected = `<div class="code"><pre class="php"><code>var foo = 'bar';</code></pre></div>`;
                const test     = `[code]var foo = 'bar';[/code]`;

                doTest(test, expected);
            });

            it('should parse a code tag with an attribute', function () {
                const expected = `<div class="code"><pre class="javascript"><code>var foo = 'bar';</code></pre></div>`;
                const test     = `[code=javascript]var foo = 'bar';[/code]`;

                doTest(test, expected);
            });

            it('should not parse unclosed bbcode within a code tag', function () {
                const expected = `<div class="code"><pre class="javascript"><code>if (!target[s]) {}</code></pre></div>`;
                const test     = `[code=javascript]if (!target[s]) {}[/code]`;

                doTest(test, expected);
            });

            it('should not parse closed bbcode within a code tag', function () {
                const expected = `<div class="code"><pre class="javascript"><code>target[s] target[/s]</code></pre></div><br><br>end`;
                const test     = `[code=javascript]target[s] target[/s][/code]

end`;

                doTest(test, expected);
            });

            it('should parse multiple code tags in a row', function () {
                const expected = `<div class="code"><pre class="javascript"><code>target[s] target[/s]</code></pre></div><br><br><div class="code"><pre class="php"><code>$i = 0;<br>$foo[i] = \'bar\';</code></pre></div>`;
                const test     = `[code=javascript]target[s] target[/s][/code]

[code]$i = 0;
$foo[i] = 'bar';[/code]`;

                doTest(test, expected);
            });
        });

        describe('[color]', function () {
            it('should parse a color tag', function () {
                const expected = `This is a <span style="color: inherit">test</span>`;
                const test     = `This is a [color]test[/color]`;

                doTest(test, expected);
            });

            it('should parse a color tag with an attribute', function () {
                const expected = `This is a <span style="color: red">test</span>`;
                const test     = `This is a [color=red]test[/color]`;

                doTest(test, expected);
            });

            it('should parse a color tag with an invalid attribute', function () {
                const expected = `This is a <span style="color: inherit">test</span>`;
                const test     = `This is a [color=foobar]test[/color]`;

                doTest(test, expected);
            });
        });

        describe('[font]', function () {
            it('should parse a font tag', function () {
                const expected = `This is a <span style="font-family: monospace">test</span>`;
                const test     = `This is a [font=monospace]test[/font]`;

                doTest(test, expected);
            });
        });

        describe('[i]', function () {
            it('should parse a i tag', function () {
                const expected = `This is <em>not</em> a test`;
                const test     = `This is [i]not[/i] a test`;

                doTest(test, expected);
            });
        });

        describe('[img]', function () {
            it('should parse a img tag', function () {
                const expected = `<img src="https://www.sencha.com/logo.png" />`;
                const test     = `[img]https://www.sencha.com/logo.png[/img]`;

                doTest(test, expected);
            });

            it('should parse a img tag with an attribute', function () {
                const expected = `<img src="https://www.sencha.com/logo.png" alt="Sencha Logo" />`;
                const test     = `[img=https://www.sencha.com/logo.png]Sencha Logo[/img]`;

                doTest(test, expected);
            });
        });

        describe('[list]', function () {
            describe('ol', function () {
                it('should parse a list tag as ol', function () {
                    const expected = `<ol><br><li>Foo<br></li><li>Bar<br></li></ol>`;
                    const test     = `[LIST=1]
[*]Foo
[*]Bar
[/LIST]`;

                    doTest(test, expected);
                });
            });

            describe('ul', function () {
                it('should parse a list tag as ul', function () {
                    const expected = `<ul><br><li>Foo<br></li><li>Bar<br></li></ul>`;
                    const test     = `[LIST]
[*]Foo
[*]Bar
[/LIST]`;

                    doTest(test, expected);
                });
            });
        });

        describe('[noparse]', function () {
            it('should parse a noparse tag', function () {
                const expected = `This is a [FIDDLE]abc[/FIDDLE]`;
                const test     = `This is a [noparse][FIDDLE]abc[/FIDDLE][/noparse]`;

                doTest(test, expected);
            });
        });

        describe('[pre]', function () {
            it('should parse a pre tag', function () {
                const expected = `This is a <pre>test</pre>`;
                const test     = `This is a [pre]test[/pre]`;

                doTest(test, expected);
            });
        });

        describe('[quote]', function () {
            const makeSpecs = (bbcode, html) => {
                describe(`[${bbcode}]`, function () {
                    it(`should parse a ${bbcode} tag`, function () {
                        const expected = `<${html || bbcode} class="quote"><div class="quote-reference">quote</div>I am a great man.</${html || bbcode}>`;
                        const test     = `[${bbcode}]I am a great man.[/${bbcode}]`;

                        doTest(test, expected);
                    });

                    it(`should parse a ${bbcode} tag with a reference`, function () {
                        const expected = `<${html || bbcode} class="quote"><div class="quote-reference">quote: Sherlock Holmes</div>Once you eliminate the impossible, whatever remains, no matter how improbable, must be the truth.</${html || bbcode}>`;
                        const test     = `[${bbcode}=Sherlock Holmes]Once you eliminate the impossible, whatever remains, no matter how improbable, must be the truth.[/${bbcode}]`;

                        doTest(test, expected);
                    });

                    it('should parse ticket info', function () {
                        const expected = `<${html || bbcode} class="quote"><div class="quote-reference">quote: Sherlock Holmes <a href="#ticket-1234-4">#4</a></div>Once you eliminate the impossible, whatever remains, no matter how improbable, must be the truth.</${html || bbcode}>`;
                        const test     = `[${bbcode}=Sherlock Holmes;1234;4]Once you eliminate the impossible, whatever remains, no matter how improbable, must be the truth.[/${bbcode}]`;

                        doTest(test, expected);
                    });

                    describe(`nested ${bbcode}`, function () {
                        it(`should parse an inner ${bbcode}`, function () {
                            const expected = `<${html || bbcode} class="quote"><div class="quote-reference">quote: Sherlock Holmes <a href="#ticket-1234-4">#4</a></div>Once you eliminate the impossible, whatever remains, no matter how improbable, must be the truth.<br><${html || bbcode} class="quote"><div class="quote-reference">quote</div>Hello there</${html || bbcode}><br></${html || bbcode}>`;
                            const test     = `[${bbcode}=Sherlock Holmes;1234;4]Once you eliminate the impossible, whatever remains, no matter how improbable, must be the truth.
[${bbcode}]Hello there[/${bbcode}]
[/${bbcode}]`;

                            doTest(test, expected);
                        });

                        it(`should parse an inner ${bbcode} with a reference`, function () {
                            const expected = `<${html || bbcode} class="quote"><div class="quote-reference">quote: Sherlock Holmes <a href="#ticket-1234-4">#4</a></div>Once you eliminate the impossible, whatever remains, no matter how improbable, must be the truth.<br><${html || bbcode} class="quote"><div class="quote-reference">quote: Foo Man</div>Hello there</${html || bbcode}><br></${html || bbcode}>`;
                            const test     = `[${bbcode}=Sherlock Holmes;1234;4]Once you eliminate the impossible, whatever remains, no matter how improbable, must be the truth.
[${bbcode}=Foo Man]Hello there[/${bbcode}]
[/${bbcode}]`;

                            doTest(test, expected);
                        });

                        it(`should parse an inner ${bbcode} with ticket info`, function () {
                            const expected = `<${html || bbcode} class="quote"><div class="quote-reference">quote: Sherlock Holmes <a href="#ticket-1234-4">#4</a></div>Once you eliminate the impossible, whatever remains, no matter how improbable, must be the truth.<br><${html || bbcode} class="quote"><div class="quote-reference">quote: Foo Man <a href="#ticket-123-3">#3</a></div>Hello there</${html || bbcode}><br></${html || bbcode}>`;
                            const test     = `[${bbcode}=Sherlock Holmes;1234;4]Once you eliminate the impossible, whatever remains, no matter how improbable, must be the truth.
[${bbcode}=Foo Man;123;3]Hello there[/${bbcode}]
[/${bbcode}]`;

                            doTest(test, expected);
                        });
                    });

                    describe('nested code', function () {
                        it('should parse an inner code', function () {
                            const expected = `<${html || bbcode} class="quote"><div class="quote-reference">quote: Sherlock Holmes <a href="#ticket-1234-4">#4</a></div>Once you eliminate the impossible, whatever remains, no matter how improbable, must be the truth.<br><div class="code"><pre class="php"><code>var foo = 'bar';</code></pre></div><br></${html || bbcode}>`;
                            const test     = `[${bbcode}=Sherlock Holmes;1234;4]Once you eliminate the impossible, whatever remains, no matter how improbable, must be the truth.
[code]var foo = 'bar';[/code]
[/${bbcode}]`;

                            doTest(test, expected);
                        });

                        it('should parse an inner code with an attribute', function () {
                            const expected = `<${html || bbcode} class="quote"><div class="quote-reference">quote: Sherlock Holmes <a href="#ticket-1234-4">#4</a></div>Once you eliminate the impossible, whatever remains, no matter how improbable, must be the truth.<br><div class="code"><pre class="javascript"><code>var foo = 'bar';</code></pre></div><br></${html || bbcode}>`;
                            const test     = `[${bbcode}=Sherlock Holmes;1234;4]Once you eliminate the impossible, whatever remains, no matter how improbable, must be the truth.
[code=javascript]var foo = 'bar';[/code]
[/${bbcode}]`;

                            doTest(test, expected);
                        });

                        it('should parse a nested code within a nested quote', function () {
                            const expected = `<${html || bbcode} class="quote"><div class="quote-reference">quote</div>I said this:<br><${html || bbcode} class="quote"><div class="quote-reference">quote: You</div>It doesn't work for me when you told me to do:<br><${html || bbcode} class="quote"><div class="quote-reference">quote</div>Fix it</${html || bbcode}><br></${html || bbcode}><br></${html || bbcode}><br><br>Does this make sense?`;
                            const test     = `[${bbcode}]I said this:
[${bbcode}=You]It doesn't work for me when you told me to do:
[${bbcode}]Fix it[/${bbcode}]
[/${bbcode}]
[/${bbcode}]

Does this make sense?`;

                            doTest(test, expected);
                        });

                        it('should handle multiple quotes in a row', function () {
                            const expected = `<${html || bbcode} class="quote"><div class="quote-reference">quote: Sherlock Holmes <a href="#ticket-1234-4">#4</a></div>Once you eliminate the impossible, whatever remains, no matter how improbable, must be the truth.<br><div class="code"><pre class="javascript"><code>var foo = \'bar\';</code></pre></div><br></${html || bbcode}><br><br>How about this:<br><br><div class="code"><pre class="php"><code>var foo = \'baz\';</code></pre></div><br><br><${html || bbcode} class="quote"><div class="quote-reference">quote</div>Good one!</${html || bbcode}><br><br>Did that work?`;
                            const test     = `[${bbcode}=Sherlock Holmes;1234;4]Once you eliminate the impossible, whatever remains, no matter how improbable, must be the truth.
[code=javascript]var foo = 'bar';[/code]
[/${bbcode}]

How about this:

[code]var foo = 'baz';[/code]

[${bbcode}]Good one![/${bbcode}]

Did that work?`

                            doTest(test, expected);
                        });
                    });
                });
            };

            makeSpecs('quote', 'blockquote');
            makeSpecs('q');
        });

        describe('[s]', function () {
            it('should parse a s tag', function () {
                const expected = `This is <span style="text-decoration: line-through;">not</span> a test`;
                const test     = `This is [s]not[/s] a test`;

                doTest(test, expected);
            });
        });

        describe('[size]', function () {
            it('should parse a size tag', function () {
                const expected = `This is a <span style="font-size: 1em">test</span>`;
                const test     = `This is a [size]test[/size]`;

                doTest(test, expected);
            });

            it('should parse a size tag as px', function () {
                const expected = `This is a <span style="font-size: 10px">test</span>`;
                const test     = `This is a [size=10]test[/size]`;

                doTest(test, expected);
            });

            it('should parse a size tag as em size', function () {
                const expected = `This is a <span style="font-size: 3em">test</span>`;
                const test     = `This is a [size=4]test[/size]`;

                doTest(test, expected);
            });

            it('should handle non-number size', function () {
                const expected = `This is a <span style="font-size: 1em">test</span>`;
                const test     = `This is a [size=foo]test[/size]`;

                doTest(test, expected);
            });
        });

        describe('[u]', function () {
            it('should parse a ulist tag', function () {
                const expected = `This <span style="text-decoration: underline;">is a</span> test`;
                const test     = `This [u]is a[/u] test`;

                doTest(test, expected);
            });
        });

        describe('[ulist]', function () {
            it('should parse a ulist tag', function () {
                const expected = `<ul><br><li>Foo<br></li><li>Bar<br></li></ul>`;
                const test     = `[ulist]
[*]Foo
[*]Bar
[/ulist]`;

                doTest(test, expected);
            });
        });

        describe('[url]', function () {
            it('should parse a url tag', function () {
                const expected = `<a target="_blank" href="https://www.sencha.com">https://www.sencha.com</a>`;
                const test     = `[url]https://www.sencha.com[/url]`;

                doTest(test, expected);
            });

            it('should parse a url tag with attribute', function () {
                const expected = `<a target="_blank" href="https://www.sencha.com">Sencha</a>`;
                const test     = `[url=https://www.sencha.com]Sencha[/url]`;

                doTest(test, expected);
            });
        });

        describe('unbalanced tags', function () {
            it('should close a simple tag', function () {
                const expected = `<strong>Sencha</strong>`;
                const test     = `[b]Sencha`;

                doTest(test, expected);
            });

            it('should close a url tag', function () {
                const expected = `<a target="_blank" href="https://www.sencha.com">https://www.sencha.com</a>`;
                const test     = `[url]https://www.sencha.com`;

                doTest(test, expected);
            });

            it('should highlight mismatched tags', function () {
                const expected = `<strong><em>Sencha<span style="color: red">[/b]</span></em></strong>`;
                const test     = `[b][i]Sencha[/b]`;

                doTest(test, expected);
            });

            it('should reset noparse', function () {
                const expected = `Sencha`;
                const test     = `[noparse]Sencha`;

                doTest(test, expected);
            });
        });
    });
});
