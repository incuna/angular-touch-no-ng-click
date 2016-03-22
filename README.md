# angular-touch-no-ng-click [![Build Status](https://travis-ci.org/incuna/angular-touch-no-ng-click.svg?branch=master)](https://travis-ci.org/incuna/angular-touch-no-ng-click)

Allows you to use `ngTouch` without its touch-enabled `ngClick` override.

`ngTouchNoNgClick` stores the core `ngClick` directive before it's removed by `ngTouch`, then restores it after, all in Angular's Config phase.

If you're **using Angular v1.5.0 or greater**, you don't need this module: ngTouch's ngClick override is disabled by default. See https://code.angularjs.org/1.5.0/docs/api/ngTouch/directive/ngClick

## Modules

This library provides the `ngTouchNoNgClick` module. Use it as a dependency in place of `ngTouch`, but keep sourcing `angular-touch.js`.

It also exposes two other modules named `ngTouchNoNgClickBefore` and `ngTouchNoNgClickAfter`. Do not use these yourself: they are for internal configuration. Using them may cause errors.

## Usage

Install:

```shell
bower install angular-touch-no-ng-click
```

### In your app

Add to your index:

```html
<script src="bower_components/dist/angular-touch-no-ng-click.min.js"></script>
```

Before, using `ngTouch`:

```js
angular.module('app', [
    'ngTouch'
]);
```

After, using `ngTouchNoNgClick`:

```js
angular.module('app', [
    'ngTouchNoNgClick'
]);
```

## Errors and fixes

### ngTouch has already loaded

`Error: ngTouchNoNgClick: original ngClickDirective is not accessible. ngTouch must not be set as a dependency before ngTouchNoNgClick. Either remove ngTouch from your app dependencies, or make ngTouchNoNgClick the very first dependency before any others that may have a dependency on ngTouch`

Fix:
- Make `ngTouchNoNgClick` the very first dependency of your app

This module must be the first dependency of your app that has a dependency on `ngTouch`. If any come before it, the core `ngClick` directive will be inaccessible and this module won't be able to restore it.

Before:
```js
angular.module('app', [
    'libraryThatDependsOnNgTouch',
    'ngTouchNoNgClick'
]);
```

After:
```js
angular.module('app', [
    'ngTouchNoNgClick',
    'libraryThatDependsOnNgTouch'
]);
```

### With other ngClick directives

`Error: ngTouchNoNgClick is incompatible with apps or modules that have registered their own ngClickDirectives`

Fix:
- remove/rename all custom `ngClick` directives
- remove all libraries that register their own `ngClick` directives

This module is incompatible with apps that register `ngClick` directives, as it becomes impossible to differentiate the core and `ngTouch` directives from the others.

Before:
```js
var module = angular.module('app', [
    'ngTouchNoNgClick'
]);
module.directive('ngClick', function () {
    return {
        link: function (scope, element, attrs) {
            element.on('click', function () {
                console.log('Custom ngClick');
            });
        }
    };
});
```
```html
<div ng-click="foo = true">Click me</div>
```

After:
```js
var module = angular.module('app', [
    'ngTouchNoNgClick'
]);
module.directive('ngClickCustom', function () {
    return {
        link: function (scope, element, attrs) {
            element.on('click', function () {
                console.log('Custom ngClick');
            });
        }
    };
});
```
```html
<div ng-click-custom="foo = true">Click me</div>
```

## Development

This repository uses npm scripts: `install`, `start`, `test`, and `version`. See `package.json` for more info.

Setup:
```shell
npm install
```

Run tests:
```shell
npm test
```

Repeatedly run tests whilst writing code:
```shell
npm start
```

## Releases

- Update the changelog with the relevant changes
- Determine the new version based on [Semver](http://semver.org/)
- Set the version number in the changelog and commit
- Use `npm version` to make a new release: see `npm help version`

`npm version` will create a distribution, test it, and commit the dist files and the changelog. If the tests fail, something is wrong with the distrubition: check the minifier options.

The `preversion` script will make a distribution and test it, then the distribution is remade in the `version` script to have access to the new version.
