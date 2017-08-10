const { Type } = require('switchit');

const path = require('path');

class PathType extends Type {
    constructor () {
        super({
            default : '',
            help    : 'A path relative to the location the script is executed at',
            name    : 'path'
        });
    }

    convert (value) {
        if (Array.isArray(value)) {
            return value.map(value => this.convert(value));
        }

        value = this.parse(value);

        if (!value) {
            return value;
        }

        return path.resolve(process.cwd(), value.trim());
    }

    parse (value) {
        if (value == null || value === false || typeof value === 'function') {
            return null;
        }

        return String(value);
    }

    is () {
        return false;
    }
}

Type.define(new PathType());
