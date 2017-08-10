# Sencha Deploy Client

[![Sencha Deploy Status](https://teamcity.sencha.com/app/rest/builds/buildType:EngineeringOperations_Deployments_SenchaDeploy/statusIcon "Sencha Deploy Status")](https://teamcity.sencha.com/viewType.html?buildTypeId=EngineeringOperations_Deployments_SenchaDeploy&guest=1)

This util is supposed to bring a simplified and better way of managing deployments, particularly how we take a release and make it available to our customers.

## Install

To install, you must have [Node.js](https://nodejs.org/) and [NPM](https://www.npmjs.com/) installed.

Util could be installed as NPM module:

    npm install -g sencha/sencha-deploy-cli

or

    npm install -g git+ssh://git@github.com/sencha/sencha-deploy-cli.git

## Configuration

Before you could use the tool, you need to confugure it with a settings that are specific for your environment. Although all config is located in ./config.json file, if you have installed the util as a global NPM module, you need to provide a path to external config.json on startup, or a config itself in a stringified JSON format. This way you won't loose your settings in case of future util updates.

Besides, you need to declare this ENV variables:

* `DB_HOST` Database host
* `DB_DATABASE` Database name
* `DB_USER` Database user name
* `DB_PASSWORD` Database user password
* `DB_PORT` Database port

* `S3_KEY` AWS Access key
* `S3_SECRET` AWS Secret key
* `S3_BUCKET` AWS S3 Bucket name

* `NODE_ENV` Env, could be either `development`, `testing` or `production`

## Release Module

To release a product, you should use the `release` module:

    sencha-deploy-cli release ./test.zip --version=1.2.1 --platform='windows-64' --product=ext --license=commercial

Here are a list of available options:

* `--path` Path to file to upload, will be used if target is not defined.
* `--log` Path to file to write the entire log to.
* `--failOnDup` By default, we do not stop the process if a match exists in the `product_release` table. Setting this arg will stop the process. Defaults to `false` from the module's `failOnDup` config.
* `--forceStorageUpload` By default, we skip uploading the file to storage if a match was found in the `product_release` table. Setting thsi arg will force the upload which is useful if we need to reupload. Defaults to `false` from the module's `forceStorageUpload` config.
* `--version` The Version string that is used for display.
* `--product` Product code thit is used in product lookup.
* `--name` (optional) Name to give to this release. If not specified, name would be compiled automatically: `product.name version platform`.
* `--platform` (optional) Platform file was build for. Full platform name should be specified here, like `windows-64`.
* `--license` (optional) The License this release is using (gpl, commercial, beta).
* `--jre` (optional) Set this if this release is a JRE included release.
* `--active` (optional) Set this to make this release active, otherwise this release will be inactive and not show up in the portal.
* `--dashboard` (optional) Whether to show this release on the dashboard.
* `--database` The type of database to use, defaults to `mysql`.
* `--storage` The type of database to use, defaults to `s3`.
* `--cdn` The destination where the uploaded bits whould land.
* `--cdn-stage` If a staging area is wanted, this is the path of the staging area. Files will be uploaded here and then moved to the path given in the `--cdn` path.
* `--cdn-extract` If set, when the zip has been uploaded, this will extract the zip. If set to a path, this will be used as the source to move from. The destination is either the `--cdn-extract-destination` or `--cdn` paths. If set but not to a path, this will extract the zip to the `--cdn` path and will delete the zip meaning only the extracted bits are wanted.
* `--cdn-extract-destination` If set and `--cdn-extract` is set to a path, this is the destination the extracted bits will reside. This also signifies the zip file should be kept and located at the `--cdn` path.
* `--cpath` (optional) Path to external config file.
* `--config` (optional) Config JSON as string.

## Nightly Module

To release a nightly, you should use the `nightly` module:

    sencha-deploy-cli nightly ./test.zip --version=1.2.1 --platform='windows-64' --product=ext --license=commercial

Here are a list of available options:

* `--path` Path to file to upload, will be used if target is not defined.
* `--log` Path to file to write the entire log to.
* `--failOnDup` By default, we do not stop the process if a match exists in the `product_nightly` table. Setting this arg will stop the process. Defaults to `false` from the module's `failOnDup` config.
* `--forceStorageUpload` By default, we skip uploading the file to storage if a match was found in the `product_nightly` table. Setting thsi arg will force the upload which is useful if we need to reupload. Defaults to `false` from the module's `forceStorageUpload` config.
* `--version` The Version string that is used for display.
* `--product` Product code thit is used in product lookup.
* `--name` (optional) Name to give to this nightly. If not specified, name would be compiled automatically: `product.name version platform`.
* `--platform` (optional) Platform file was build for. Full platform name should be specified here, like `windows-64`.
* `--license` (optional) The License this nightly is using (gpl, commercial, beta).
* `--jre` (optional) Set this if this nightly is a JRE included nightly.
* `--active` (optional) Set this to make this nightly active, otherwise this nightly will be inactive and not show up in the portal.
* `--dashboard` (optional) Whether to show this nightly on the dashboard.
* `--database` The type of database to use, defaults to `mysql`.
* `--storage` The type of database to use, defaults to `s3`.
* `--cdn` The destination where the uploaded bits whould land.
* `--cdn-stage` If a staging area is wanted, this is the path of the staging area. Files will be uploaded here and then moved to the path given in the `--cdn` path.
* `--cdn-extract` If set, when the zip has been uploaded, this will extract the zip. If set to a path, this will be used as the source to move from. The destination is either the `--cdn-extract-destination` or `--cdn` paths. If set but not to a path, this will extract the zip to the `--cdn` path and will delete the zip meaning only the extracted bits are wanted.
* `--cdn-extract-destination` If set and `--cdn-extract` is set to a path, this is the destination the extracted bits will reside. This also signifies the zip file should be kept and located at the `--cdn` path.
* `--cpath` (optional) Path to external config file.
* `--config` (optional) Config JSON as string.

## Deploying to CDN or QA server

Deploying to CDN or the QA server uses SSH/SCP to upload a zip file to the server. Once on the server, the zip can be extracted. There are four command line arguments that will control this process but are prefixed for each deployment (CDN vs QA server). Below are notes on each individual deployment.

### CDN deployment

The basic usage for CDN deployment is to upload a ZIP file only using the `--cdn` argument:

    sencha-deploy-cli nightly ./test.zip \
        --version=1.2.1 \
        --platform='windows-64' \
        --product=ext \
        --license=commercial \
        --cdn=/path/to/destination/

This will upload the `test.zip` to `/path/to/destination/test.zip`.

If you would like to extract the zip, you can then use the `--cdn-stage` and `--cdn-extract` arguments:

    sencha-deploy-cli nightly ./test.zip \
        --version=1.2.1 \
        --platform='windows-64' \
        --product=ext \
        --license=commercial \
        --cdn=/path/to/destination/ \
        --cdn-stage=/path/to/stage/ \
        --cdn-extract

This will upload `test.zip` to `/path/to/stage/test.zip` and extract it to `/path/to/destination/`.

**NOTE** The staged directory will be deleted with all contents.

There may be times where the ZIP, once extracted will have the source you want to be at the `--cdn` path nested within a directory. For that, the `--cdn-extract` argument can be set to a path that is the source that you want to be moved to the `--cdn` path:

    sencha-deploy-cli nightly ./test.zip \
        --version=1.2.1 \
        --platform='windows-64' \
        --product=ext \
        --license=commercial \
        --cdn=/path/to/destination/ \
        --cdn-stage=/path/to/stage/ \
        --cdn-extract=/path/to/stage/foo/

Once `test.zip` has been uploaded to `/path/to/stage/` and extracted to `/path/to/stage/foo/`, the contents within `/path/to/stage/foo/` will be moved to `/path/to/destination/`. If a path wasn't provided to `--cdn-extract` the `/path/to/destination/foo/` would exist. Remember, the ZIP is still in the staged area so it will be deleted.

There may be times you want the ZIP to be kept. In order to support this and have the extracted source you can use the `--cdn-extract-destination` argument:

    sencha-deploy-cli nightly ./test.zip \
        --version=1.2.1 \
        --platform='windows-64' \
        --product=ext \
        --license=commercial \
        --cdn=/path/to/destination/ \
        --cdn-stage=/path/to/stage/ \
        --cdn-extract=/path/to/stage/foo/ \
        --cdn-extract-destination=/path/to/extracted/

This will upload `test.zip` to `/path/to/stage/` and extract it. It will move the `/path/to/stage/foo` source to `/path/to/extracted/` and move the ZIP file to `/path/to/destination/test.zip`.

### QA Deployment

The workflow for the CDN deployment is the same however instead you should use the `--qa`, `--qa-stage`, `--qa-extract` and `--qa-extract-destination` arguments. The one difference is the current date (`YYYYMMDD`) will be appended onto the destination paths (`--qa` and `--qa-extract-destination`). This is because the QA server is meant to hold nightly builds.

## Logging

By default, this tool will log everything but DEBUG level items to the console. This tool is capable of writing the entire log (including DEBUG level items) to a log file using the `--log` argument. You must pass a path to this argument:

    sencha-deploy-cli nightly ./test.zip \
        --log=/path/to/log.txt \
        --version=1.2.1 \
        --platform='windows-64' \
        --product=ext \
        --license=commercial

## Running tests

Once installed,

    npm test

## Ignoring Test Scripts

In the `test/ignored/` directory there are two shell scripts that are run via `npm run nightly` or `npm run release`, if you
want to update these shell scripts but ignore any updates (the dir is in `.gitignore` but the files are checked in) then
you can tell git to assume they are unchanged:

    git update-index --assume-unchanged test/ignored/nightly.sh test/ignored/release.sh

This way they will not show as being changed and you won't commit any ENV stuff. If you want to undo this, then run this command:

    git update-index --no-assume-unchanged test/ignored/nightly.sh test/ignored/release.sh
