class Observable {
    constructor () {
        this.events = {};
    }

    on (event, callback) {
        const arr = this.events[event];

        if (arr) {
            if (arr.indexOf(callback) < 0) {
                arr.push(callback);
            }
        } else {
            this.events[event] = [ callback ];
        }

        return this;
    }

    emit (event, ...args) {
        const callbacks = this.events[event];

        if (Array.isArray(callbacks) && callbacks.length) {
            callbacks.forEach(callback => callback.apply(this, args));
        }

        return this;
    }
}

module.exports = {
    createObservable (superCls, properties) {
        if (!properties && superCls !== Observable) {
            properties = superCls;
            superCls   = Observable;
        }

        const cls = class ObservableChild extends superCls {};

        if (properties) {
            for (const prop in properties) {
                cls.prototype[prop] = properties[prop];
            }
        }

        return cls;
    }
};
