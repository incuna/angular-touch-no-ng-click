// Set bower resolutions for Angular packages to value of --angular-version.
// Without a resolution, `bower install` will ask for one, which isn't possible
// in Travis.

if (!process.env.CI) {
    process.exit(0);
}

'use strict';

var fs = require('fs');
var argv = require('yargs').argv;

// Get --angular-version
var angularVersion = argv.angularVersion;
if (!angularVersion) {
    process.exit(0);
}

// Get bower.json
var bowerJSON = JSON.parse(fs.readFileSync('bower.json'));

// Set the precise dependency versions.
bowerJSON.dependencies.angular = angularVersion;
bowerJSON.dependencies['angular-touch'] = angularVersion;
bowerJSON.devDependencies['angular-mocks'] = angularVersion;

// Write bower.json
fs.writeFileSync('bower.json', JSON.stringify(bowerJSON, null, 2));
