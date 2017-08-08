const { Type } = require('switchit');

const path = require('path');

class PathType extends Type {
    constructor () {
        super({
            // Checks if the path begins with a dot (`.`) or has a slash (`foo/bar`)
            // in the path to not cause ambiguity with the String type since a path
            // is a relative path to `process.cwd()`.
            pathRe: /^\.|\//,

            default: '',
            name: 'path',
            help: 'A path relative to the location the script is executed at'
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

    is (value) {
        return value && typeof value === 'string' && this.pathRe.test(value);
    }
}

Type.define(new PathType());
