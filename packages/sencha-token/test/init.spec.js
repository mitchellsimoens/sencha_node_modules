const chai      = require('chai');
const sinon     = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(
    require('chai-as-promised')
);

require('co-mocha');
require('sinon-as-promised');

before(function () {
    chai.use(sinonChai);
});

beforeEach(function () {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function () {
    this.sandbox.restore();
});
