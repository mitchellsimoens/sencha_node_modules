const chai      = require('chai');
const Helper    = require('./helpers/Helper');
const sinon     = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(
    require('chai-as-promised')
);

require('co-mocha');

before(function () {
    chai.use(sinonChai);

    Helper(
        this,
        [
            require('./helpers/Action'),
            require('./helpers/Manager'),
            require('./helpers/Request')
        ]
    );
});

beforeEach(function () {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function () {
    this.sandbox.restore();
});
