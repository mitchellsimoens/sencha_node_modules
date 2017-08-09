const {
    step : { fiddle : { Base } },
    util : { Logger }
} = require('../../')

class BuildSQL extends Base {
    constructor () {
        super();

        this.incrementor = 0;
    }

    execute (runner) {
        return new Promise((resolve, reject) => {
            const {
                info : {
                    group,
                    app : { database }
                }
            } = runner;

            const inserts = [];
            const sqls    = [];

            Object.assign(this, {
                inserts,
                runner,
                sqls
            });

            return resolve();

            this
                .buildMasterSql(group)
                .buildChildSqls(group.children, group, undefined, '@mastergroupid');

            database
                .query(sqls, inserts)
                .then(() => resolve())
                .catch(reject);
        });
    }

    finish () {
        this.runner = null;
    }

    buildMasterSql (group) {
        const { inserts, sqls } = this;
        const databaseName      = this.getDatabase();

        const {
            runner : {
                info : {
                    args : { product, version }
                }
            }
        } = this;

        sqls.push(
            `INSERT INTO ${databaseName}.fiddle_groups (\`name\`, \`description\`, \`creator\`, \`creator_username\`, \`created\`, \`product\`, \`version\`) VALUES (?, ?, ?, ?, NOW(), ?, ?);`,
            'SET @mastergroupid = LAST_INSERT_ID();'
        );

        inserts.push(
            group.name,
            group.description,
            group.creator,
            group.creator_username,
            product,
            version
        );

        return this;
    }

    buildChildSqls (children, group, toolkit, parentid, rootparentid) {
        if (Array.isArray(children) && children.length) {
            children.forEach((child) => {
                const { $pkg : { fiddle } } = child;

                if (fiddle.toolkit) {
                    this.buildToolkitSqls(child, group, toolkit, parentid, parentid);
                } else if (fiddle.group) {
                    this.buildGroupSqls(child, group, toolkit, parentid, rootparentid);
                } else if (fiddle.example) {
                    this.buildExampleSqls(child, group, toolkit, parentid);
                }
            });
        }

        return this;
    }

    buildToolkitSqls (child, group, toolkit, parentid, rootparentid) {
        const { inserts, sqls } = this;
        const databaseName      = this.getDatabase();
        const upperName         = `${child.name.substr(0, 1).toUpperCase()}${child.name.substr(1)}`;

        const {
            runner : {
                info : {
                    args : { product, version }
                }
            }
        } = this;

        sqls.push(
            `INSERT INTO ${databaseName}.fiddle_groups (\`parentid\`, \`rootparentid\`, \`name\`, \`description\`, \`creator\`, \`creator_username\`, \`created\`, \`product\`, \`version\`) VALUES (${parentid}, ${rootparentid}, ?, ?, ?, ?, NOW(), ?, ?);`,
            `SET @toolkitgroupid = LAST_INSERT_ID();`
        );

        inserts.push(
            `${upperName} Toolkit`,
            `${upperName} Examples`,
            group.creator,
            group.creator_username,
            product,
            version
        );

        this.buildChildSqls(child.children, group, child, '@toolkitgroupid', rootparentid);
    }

    buildGroupSqls (child, group, toolkit, parentid, rootparentid) {
        const { inserts, sqls } = this;
        const databaseName      = this.getDatabase();
        const { $pkg : pkg }    = child;
        const groupVar          = `@group_id_${++this.incrementor}`;

        const {
            runner : {
                info : {
                    args : { product, version }
                }
            }
        } = this;

        sqls.push(
            `INSERT INTO ${databaseName}.fiddle_groups (\`parentid\`, \`rootparentid\`, \`name\`, \`description\`, \`creator\`, \`creator_username\`, \`created\`, \`product\`, \`version\`) VALUES (${parentid}, ${rootparentid}, ?, ?, ?, ?, NOW(), ?, ?);`,
            `SET ${groupVar} = LAST_INSERT_ID();`
        );

        inserts.push(
            pkg.fiddle.title,
            pkg.description,
            group.creator,
            group.creator_username,
            product,
            version
        );

        this.buildChildSqls(child.children, group, toolkit, groupVar, rootparentid);
    }

    buildExampleSqls (child, group, toolkit, parentid) {
        const {
            inserts, sqls,
            runner : {
                info : {
                    args : { team }
                }
            }
        } = this;

        const databaseName   = this.getDatabase();
        const { $pkg : pkg } = child;
        const { fiddle }     = pkg;

        sqls.push(
            `INSERT INTO ${databaseName}.fiddles (\`userid\`, \`username\`, \`frameworkid\`, \`createdDate\`, \`modifiedDate\`, \`title\`, \`description\`) VALUES (?, ?, ?, NOW(), NOW(), ?, ?);`,
            `SET @fiddleid = LAST_INSERT_ID();`,
            `INSERT INTO ${databaseName}.fiddle_groups_fiddles (\`groupid\`, \`fiddleid\`, \`added\`) VALUES (${parentid}, @fiddleid, NOW());`
        );

        inserts.push(
            group.creator,
            group.creator_username,
            toolkit.framework.id,
            fiddle.title,
            pkg.description
        );

        child.assets.forEach(this.buildAssetSqls.bind(this, child));

        if (Array.isArray(child.mockdata) && child.mockdata.length) {
            child.mockdata.forEach(this.buildMockdataSqls.bind(this, child));
        }

        if (fiddle.packages) {
            fiddle.packages.forEach(this.buildPackagesSqls.bind(this, child, toolkit));
        }

        if (fiddle.tags) {
            fiddle.tags.forEach(this.buildTagsSqls.bind(this, child));
        }

        if (team) {
            this.buildTeamSqls(child, team);
        }
    }

    buildAssetSqls (example, asset) {
        const { inserts, sqls } = this;
        const databaseName      = this.getDatabase();

        sqls.push(
            `INSERT INTO ${databaseName}.fiddle_assets (\`fiddleid\`, \`name\`, \`code\`, \`type\`) VALUES (@fiddleid, ?, ?, ?);`
        );

        inserts.push(
            asset.name,
            asset.code,
            asset.type
        );
    }

    buildMockdataSqls (example, asset) {
        const { inserts, sqls }     = this;
        const databaseName          = this.getDatabase();
        const { $pkg : { fiddle } } = example;
        const files                 = fiddle && fiddle.files;
        const file                  = files && files[ asset.url ];

        sqls.push(
            `INSERT INTO ${databaseName}.fiddle_mockdata (\`fiddleid\`, \`url\`, \`data\`, \`type\`, \`delay\`, \`dynamic\`) VALUES (@fiddleid, ?, ?, ?, ?, ?);`
        );

        inserts.push(
            asset.url,
            asset.data,
            asset.type,
            file ? file.delay   || 0     : 0,
            file ? file.dynamic || false : false
        );
    }

    buildPackagesSqls (example, toolkit, packageName) {
        const { inserts, sqls } = this;
        const databaseName      = this.getDatabase();
        const { packages }      = toolkit;
        const pkg               = packages.find(pkg => pkg.name.toLowerCase() === packageName.toLowerCase());

        if (pkg) {
            sqls.push(
                `INSERT INTO ${databaseName}.fiddle_packages (\`packageid\`, \`fiddleid\`) VALUES (?, @fiddleid);`
            );

            inserts.push(
                pkg.id
            );
        } else {
            Logger.error(new Error(`Unable to match "${packageName}" with the "${toolkit.name}" toolkit packages:`));
            Logger.error(`${JSON.stringify(packages)}`);
        }
    }

    buildTagsSqls (example, tag) {
        const { inserts, sqls } = this;
        const databaseName      = this.getDatabase();

        sqls.push(
            `INSERT INTO ${databaseName}.tags (\`name\`, \`active\`) VALUES (?, 1) ON DUPLICATE KEY UPDATE active = IF((@previous_tag := id) <> NULL IS NULL, VALUES(active), NULL);`,
            `INSERT INTO ${databaseName}.tags_fiddles (\`tag_id\`, \`fiddle_id\`, \`tag_dt\`) SELECT * FROM (SELECT id, @fiddleid, NOW() FROM ${databaseName}.tags WHERE name = ?) AS tmp;`
        );

        inserts.push(
            tag,
            tag
        );
    }

    buildTeamSqls (example, team) {
        const { inserts, sqls } = this;
        const databaseName      = this.getDatabase();

        sqls.push(
            `INSERT INTO ${databaseName}.fiddle_teams_fiddles (\`teamid\`, \`fiddleid\`, \`added\`) VALUES (?, @fiddleid, NOW());`
        );

        inserts.push(
            team
        );
    }
}

module.exports = BuildSQL;
