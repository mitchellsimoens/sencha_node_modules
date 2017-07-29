const chai      = require('chai');
const Helper    = require('./helpers/Helper');
const sinon     = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(
    require('chai-as-promised')
);

before(function () {
    chai.use(sinonChai);

    Helper(
        this,
        [
            require('./helpers/Email'),
            require('./helpers/Provider')
        ]
    );
});

beforeEach(function () {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function () {
    this.sandbox.restore();
});
