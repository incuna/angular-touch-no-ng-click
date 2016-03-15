# angular-touch-no-ng-click

Allows you to use `ngTouch` without its touch-enabled `ngClick` override.

`ngTouchNoNgClick` stores the core `ngClick` directive before it's removed by `ngTouch`, then restores it after, all in Angular's Config phase.

If you're **using Angular v1.5.0 or greater**, you don't need this module: ngTouch's ngClick override is disabled by default. See https://code.angularjs.org/1.5.0/docs/api/ngTouch/directive/ngClick

## Usage

Install:

```shell
bower install angular-touch-no-ng-click
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

```
Error: ngTouchNoNgClick: original ngClickDirective is not accessible. ngTouch must not be set as a dependency before ngTouchNoNgClick. Either remove ngTouch from your app dependencies, or make ngTouchNoNgClick the very first dependency before any others that may have a dependency on ngTouch
```

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

```
Error: ngTouchNoNgClick is incompatible with apps or modules that have registered their own ngClickDirectives
```

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
