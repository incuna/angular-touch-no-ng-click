'use strict';

// Set bower resolutions for Angular packages to value of --angular-version.
// Without a resolution, `bower install` will ask for one, which isn't possible
// in Travis.

var fs = require('fs');

var DEBUG = false;
if (process.env.DEBUG === 'true') {
    DEBUG = true;
}

var log = function () {
    if (DEBUG) {
        console.log.apply(console, arguments);
    }
};

log('Setting version of Angular...');

if (!process.env.CI) {
    log('Not in Continuous Integration. Skipping');
    process.exit(0);
}

// Get the Angular version
var angularVersion = process.env.ANGULAR_VERSION;
if (!angularVersion) {
    log('No Angular Version given. Skipping');
    process.exit(0);
}
log('Angular version: ' + angularVersion);

log('Writing bower dependencies...');

// Get bower.json
var bowerJSON = JSON.parse(fs.readFileSync('bower.json'));

// Set the precise dependency versions.
bowerJSON.dependencies.angular = angularVersion;
bowerJSON.dependencies['angular-touch'] = angularVersion;
bowerJSON.devDependencies['angular-mocks'] = angularVersion;
log('dependencies', bowerJSON.dependencies);
log('devDependencies', bowerJSON.devDependencies);

// Write bower.json
fs.writeFileSync('bower.json', JSON.stringify(bowerJSON, null, 2));

log('Done');
