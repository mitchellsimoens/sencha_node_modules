const chai      = require('chai');
const Helper    = require('./Helper');
const sinon     = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
chai.should();

before(function () {
    this.$helper = Helper(this);
});

beforeEach(function () {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function () {
    this.sandbox.restore();
});
