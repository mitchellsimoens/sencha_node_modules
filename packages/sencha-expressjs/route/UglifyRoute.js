const { SimpleRoute } = require('./');

const fs       = require('fs');
const mkdirp   = require('mkdirp');
const path     = require('path');
const UglifyJS = require('uglify-js');

class UglifyRoute extends SimpleRoute {
    static get meta () {
        return {
            prototype : {
                /**
                 * @property {Boolean} [isExpressUglifyRoute=true]
                 * @readonly
                 */
                isExpressUglifyRoute : true,

                /**
                 * @cfg {Boolean} [minify=true] Allows for the minification to be
                 * turned off if set to `false`. This should not be changed for
                 * production but for development or testing this could be set
                 * to `false`.
                 */
                minify : true,

                /**
                 * @cfg {Boolean} [sourceMap=false] Turn source map creation on.
                 */
                sourceMap : false

                /**
                 * @cfg {String} tempDir A temporary directory to put the minified
                 * file and source map in. This will default to the directory that
                 * {@link #dir} is in.
                 */
            }
        };
    }

    applyDir (dir) {
        dir = super.applyDir(dir);

        if (dir && this.minify) {
            const parsed = path.parse(dir);
            const root   = super.applyDir(this.tempDir) || parsed.dir;

            this.rawPath = dir;

            if (this.sourceMap) {
                this.mapPath = path.resolve(root, `${parsed.base}.map`);
                this.mapName = `/${parsed.base}.map`;
            }

            mkdirp.sync(root);

            dir = path.resolve(root, `${parsed.name}.min${parsed.ext}`);
        }

        return dir;
    }

    connect (router) {
        if (this.minify) {
            try {
                fs.statSync(this.dir);
                fs.statSync(this.mapPath);
            } catch (e) {
                const result = UglifyJS.minify(this.rawPath, {
                    outSourceMap : this.mapName
                });

                if (result.code) {
                    fs.writeFileSync(this.dir, result.code);
                }

                if (this.sourceMap && result.map) {
                    fs.writeFileSync(this.mapPath, result.map);
                }
            }

            if (this.sourceMap) {
                const parsed = path.parse(this.url);

                router.app.use(`${parsed.dir}${parsed.base}.map`, this.connectMiddleware(this.mapPath));
            }
        }

        super.connect(router);
    }
}

module.exports = UglifyRoute;
