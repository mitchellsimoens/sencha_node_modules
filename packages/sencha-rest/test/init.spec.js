const chai      = require('chai');
const Helper    = require('./helpers/Helper');
const sinon     = require('sinon');
const sinonChai = require('sinon-chai');

before(function () {
    chai.use(sinonChai);

    Helper(
        this,
        []
    );
});

beforeEach(function () {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function () {
    this.sandbox.restore();
});
