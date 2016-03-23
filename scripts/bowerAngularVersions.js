'use strict';

// Set bower resolutions for Angular packages to value of --angular-version.
// Without a resolution, `bower install` will ask for one, which isn't possible
// in Travis.

var fs = require('fs');

var checkInCI = function () {
    if (!process.env.CI) {
        console.log('Not in Continuous Integration. Skipping');
        return false;
    }
    return true;
};

var checkAngularVersion = function (angularVersion) {
    if (!angularVersion) {
        console.log('No Angular Version given. Skipping');
        return false;
    }
    console.log('Angular version: ' + angularVersion);
    return true;
};

exports.set = function (angularVersion) {
    console.log('Setting version of Angular...');

    if (!checkInCI()) {
        return;
    }

    // Get the Angular version
    if (!checkAngularVersion(angularVersion)) {
        return;
    }

    console.log('Writing bower dependencies...');

    // Get bower.json
    var bowerJSON = JSON.parse(fs.readFileSync('bower.json'));

    // Set the precise dependency versions.
    bowerJSON.dependencies.angular = angularVersion;
    bowerJSON.dependencies['angular-touch'] = angularVersion;
    bowerJSON.devDependencies['angular-mocks'] = angularVersion;
    console.log('dependencies', bowerJSON.dependencies);
    console.log('devDependencies', bowerJSON.devDependencies);

    // Write bower.json
    fs.writeFileSync('bower.json', JSON.stringify(bowerJSON, null, 2));

    console.log('Done');
    return true;
};

exports.test = function (angularVersion) {
    console.log('Testing version of Angular...');

    var fs = require('fs');
    var path = require('path');
    var glob = require('glob');
    var bower = require('bower');
    var semver = require('semver');

    if (!checkInCI()) {
        return;
    }

    // Get the Angular version
    if (!checkAngularVersion(angularVersion)) {
        return;
    }

    console.log('Finding current versions...');

    // Get bower.json for each lib
    var bowerDir = bower.config.directory;
    var angularDirs = 'angular{,-touch,-mocks}';
    var libBowerJSONFiles = glob.sync(path.join(bowerDir, angularDirs, 'bower.json'));
    console.log('Found Angular libs:');
    console.log(libBowerJSONFiles);

    console.log('Testing bower dependencies...');

    // Compare each version against angularVersion
    var results = libBowerJSONFiles.map(file => {
        var config = JSON.parse(fs.readFileSync(file));
        var isCorrect = semver.satisfies(config.version, angularVersion);
        console.log(config.name, config.version, isCorrect ? 'correct' : 'incorrect');
        return isCorrect;
    });

    if (results.every(isCorrect => isCorrect)) {
        console.log('Success');
        return true;
    } else {
        console.log('Fail');
        return false;
    }
};
