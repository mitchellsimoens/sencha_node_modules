const { Adapter } = require('../../');

module.exports = {
    createAdapter ( { getSpy, instantiateSpy, callThru = false, ForumGet, ForumSave, LoginGet, SenchaGet, SenchaSave } = {} ) {
        class FakeAdapter extends Adapter {
            static get meta () {
                return {
                    prototype : {
                        rootPath : __dirname
                    }
                };
            }

            get operations () {
                const ops = super.operations;

                if (ForumGet) {
                    ops['forum.get'] = ForumGet;
                }

                if (ForumSave) {
                    ops['forum.save'] = ForumSave;
                }

                if (LoginGet) {
                    ops['login.get'] = LoginGet;
                }

                if (SenchaGet) {
                    ops['sencha.get'] = SenchaGet;
                }

                if (SenchaSave) {
                    ops['sencha.save'] = SenchaSave;
                }

                return ops;
            }

            getOperation (...args) {
                if (getSpy) {
                    getSpy.call(this, ...args);
                }

                if (callThru) {
                    return super.getOperation(...args);
                }
            }

            instantiateOperation (...args) {
                if (instantiateSpy) {
                    instantiateSpy.call(this, ...args);
                }

                if (callThru) {
                    return super.instantiateOperation(...args);
                }
            }

            createBatch () {
                return {};
            }
        }

        return new FakeAdapter();
    }
};
