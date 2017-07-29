const chai      = require('chai');
const Helper    = require('./helpers/Helper');
const sinon     = require('sinon');
const sinonChai = require('sinon-chai');

before(function () {
    chai.use(sinonChai);

    Helper(
        this,
        [
            require('./helpers/Batch'),
            require('./helpers/Payload'),
            require('./helpers/Query')
        ]
    );
});

beforeEach(function () {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function () {
    this.sandbox.restore();
});
