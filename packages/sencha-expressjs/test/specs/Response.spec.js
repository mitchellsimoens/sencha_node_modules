const { expect }   = require('chai');
const { Response } = require('../../');

function createMockExpressRes (method, spy) {
    let obj = {};

    if (typeof method === 'string') {
        obj[method] = spy;
    } else if (typeof method === 'object') {
        for (let key in method) {
            obj[key] = method[key];
        }
    }

    return obj;
}

describe('Response', function() {
    let response;

    afterEach(function() {
        if (response && !response.destroyed) {
            response.destroy();
        }

        response = null;
    });

    describe('instantiation', function() {
        it('should be a response', function() {
            response = new Response();

            expect(response).to.have.property('isExpressResponse', true);
        });
    });

    describe('output', function() {
        describe('successful output', function() {
            it('should output success', function() {
                let spy = this.sandbox.spy(),
                    ret = {
                        success : true
                    };

                response = new Response({
                    data : ret
                });

                response.output(
                    createMockExpressRes('json', spy)
                );

                spy.should.have.been.calledWithExactly(ret);
            });

            it('should render view', function(done) {
                let spy = this.sandbox.spy(view => {
                    expect(view).to.be.equal('test');

                    done();
                });

                response = new Response({
                    data : 'test'
                });

                response.output(
                    createMockExpressRes('render', spy)
                );

                expect(spy).to.have.been.called;
            });

            it('should send plain string', function(done) {
                let spy = this.sandbox.spy(view => {
                    expect(view).to.be.equal('test');

                    done();
                });

                response = new Response({
                    data  : 'test',
                    extra : {
                        isView : false
                    }
                });

                response.output(
                    createMockExpressRes('send', spy)
                );

                expect(spy).to.have.been.called;
            });

            it('should set status code', function(done) {
                let statusSpy   = this.sandbox.spy(function(code) {
                        expect(code).to.be.equal(300);
                    }),
                    responseSpy = this.sandbox.spy(view => {
                        expect(view).to.be.equal('test');

                        done();
                    });

                response = new Response({
                    data  : 'test',
                    extra : {
                        isView : false,
                        status : 300
                    }
                });

                response.output(
                    createMockExpressRes({
                        send   : responseSpy,
                        status : statusSpy
                    })
                );

                expect(responseSpy).to.have.been.called;
                expect(statusSpy).to.have.been.called;
            });

            it('should set status code from object', function(done) {
                let statusSpy   = this.sandbox.spy(function(code) {
                        expect(code).to.be.equal(404);
                    }),
                    responseSpy = this.sandbox.spy(view => {
                        expect(view).to.be.equal('test');

                        done();
                    });

                response = new Response({
                    data  : 'test',
                    extra : {
                        isView : false,
                        status : {
                            code : 404
                        }
                    }
                });

                response.output(
                    createMockExpressRes({
                        send   : responseSpy,
                        status : statusSpy
                    })
                );

                expect(responseSpy).to.have.been.called;
                expect(statusSpy).to.have.been.called;
            });

            it('should set headers', function(done) {
                let headerSpy   = this.sandbox.spy(function(header, value) {
                        if (header == 'Content-Length') {
                            expect(value).to.be.equal(500);
                        } else if (header === 'Content-Type') {
                            expect(value).to.be.equal('foo/bar');
                        } else if (header === 'Cache-Control') {
                            expect(value).to.be.equal('max-age 0')
                        }
                    }),
                    responseSpy = this.sandbox.spy(view => {
                        expect(view).to.be.equal('test');

                        done();
                    });

                response = new Response({
                    data  : 'test',
                    extra : {
                        isView  : false,
                        headers : {
                            CacheControl  : 'max-age 0',
                            ContentLength : 500,
                            ContentType   : 'foo/bar'
                        }
                    }
                });

                response.output(
                    createMockExpressRes({
                        send : responseSpy,
                        set  : headerSpy
                    })
                );

                expect(responseSpy).to.have.been.called;
                expect(headerSpy).to.have.been.calledThrice;
            });
        });

        describe('failure output', function() {
            it('should output failure from Error instance', function(done) {
                let spy = this.sandbox.spy(function(error) {
                    expect(error).to.have.property('success', false);
                    expect(error).to.have.property('msg',     'something bad');

                    done();
                });

                response = new Response({
                    error : new Error('something bad')
                });

                response.output(
                    createMockExpressRes('json', spy)
                );

                expect(spy).to.have.been.called;
            });

            it('should output failure from string', function(done) {
                let spy = this.sandbox.spy(function(error) {
                    expect(error).to.have.property('success', false);
                    expect(error).to.have.property('msg',     'something bad');

                    done();
                });

                response = new Response({
                    error : 'something bad'
                });

                response.output(
                    createMockExpressRes('json', spy)
                );

                expect(spy).to.have.been.called;
            });

            it('should output failure from Error instance changing msgProperty', function(done) {
                let spy = this.sandbox.spy(function(error) {
                    expect(error).to.have.property('success', false);
                    expect(error).to.have.property('foo',     'something bad');

                    done();
                });

                response = new Response({
                    msgProperty : 'foo',
                    error       : new Error('something bad')
                });

                response.output(
                    createMockExpressRes('json', spy)
                );

                expect(spy).to.have.been.called;
            });

            it('should output failure from object matching msgProperty', function(done) {
                let spy = this.sandbox.spy(function(error) {
                    expect(error).to.have.property('success', false);
                    expect(error).to.have.property('msg',     'something bad');

                    done();
                });

                response = new Response({
                    error : {
                        msg : 'something bad'
                    }
                });

                response.output(
                    createMockExpressRes('json', spy)
                );

                expect(spy).to.have.been.called;
            });

            it('should output failure from object not matching msgProperty', function(done) {
                let spy = this.sandbox.spy(function(error) {
                    expect(error).to.have.property('success', false);
                    expect(error).to.have.property('foo',     'something bad');

                    done();
                });

                response = new Response({
                    error : {
                        foo : 'something bad'
                    }
                });

                response.output(
                    createMockExpressRes('json', spy)
                );

                expect(spy).to.have.been.called;
            });
        });
    });
});
