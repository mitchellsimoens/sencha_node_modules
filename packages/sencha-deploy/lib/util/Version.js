class Version {
    constructor (version) {
        let parts;

        if (version) {
            if (typeof version === 'number') {
                version = version.toString();
            }

            parts = version
                .split('.')
                .map(version => version ? parseInt(version) : 0);
        } else {
            parts = [];

            this.parts = parts;
        }

        this.full  = version;
        this.parts = parts;

        [
            this.major,
            this.minor,
            this.patch,
            this.build
        ] = parts;
    }

    static compare (lhsVersion, rhsVersion) {
        const lhsParts  = lhsVersion.parts;
        const lhsLength = lhsParts.length;
        const rhsParts  = rhsVersion.parts;
        const rhsLength = rhsParts.length;

        for (let i = 0, length = Math.max(lhsLength, rhsLength); i < length; i++) {
            const lhs = i < lhsLength ? lhsParts[ i ] : null;
            const rhs = i < rhsLength ? rhsParts[ i ] : null;

            // When one or both of the values are NaN these tests produce false
            // and we end up treating NaN as equal to anything.
            if (lhs < rhs) {
                return -1;
            }

            if (lhs > rhs) {
                return 1;
            }
        }

        return 0;
    }

    isNewer (other) {
        return this.constructor.compare(this, other) === 1;
    }

    isOlder (other) {
        return this.constructor.compare(this, other) === -1;
    }

    isSame (other) {
        return this.constructor.compare(this, other) === 0;
    }
}

module.exports = Version;
