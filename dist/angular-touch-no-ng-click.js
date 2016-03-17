/*
    angular-touch-no-ng-click - v1.0.0

    Copyright (c) 2016 Incuna Ltd.
    Licensed under the MIT license.
*/
/*

    Modules:
    - ngTouchNoNgClick

    Support:
    - v1.2.0 to latest v1.4.x

    ngTouchNoNgClick allows the disabling of ngTouch's ngClick directive
    override by saving the original directive definition before ngTouch's config
    phase can override it and restoring it after.

    ngTouchNoNgClick is incompatible with an app if any other ngClick directives
    are registered.

*/

(function (angular, _) {

    'use strict';

    // Semver: 1.2.x - 1.4.x
    // From 1.2.0 to the last 1.4.x patch version.
    angular.module('ngTouchNoNgClick', [
        'ngTouchNoNgClickBefore',
        'ngTouch',
        'ngTouchNoNgClickAfter'
    ]);

    // We need to store some things between the config phases. We cannot use
    // Angular Constants for that; we need to be outside of Angular itself, so
    // we manage a scoped variable of an object.
    var state;
    var reset = function () {
        // We must reset whenever this module is loaded.
        state = {};
    };
    reset();

    var before = angular.module('ngTouchNoNgClickBefore', []);
    var after = angular.module('ngTouchNoNgClickAfter', []);

    // Save the default ngClick directive.
    before.config([
        '$provide',
        '$injector',
        function (
            $provide,
            $injector
        ) {

            // We must reset whenever this module is loaded.
            reset();

            // Find out if the ngTouch module's components have been registered
            // already, for all Angular versions below 1.5.0.
            if ($injector.has('ngSwipeLeftDirective')) {
                // The ngTouch module has already been registered as a
                // dependency, meaning its config phase will have run before
                // this and the original ngClick directive will no longer be
                // available. All we can do now is error.
                state.incompatible = true;
                throw new Error(
                    'ngTouchNoNgClick: original ngClick directive is not ' +
                    'accessible. ngTouch must not be set as a dependency ' +
                    'before ngTouchNoNgClick. Either remove ngTouch from ' +
                    'your app dependencies, or make ngTouchNoNgClick the ' +
                    'very first dependency before any others that may have a ' +
                    'dependency on ngTouch'
                );
            }

            $provide.decorator('ngClickDirective', [
                '$delegate',
                function ($delegate) {
                    if (state.incompatible) {
                        // Do nothing.
                        return $delegate;
                    }
                    if ($delegate.length > 2) {
                        // There are extra ngClick directives, so we cannot know
                        // the $delegate index position of ngTouch's override to
                        // restore the original.
                        // Throwing an error here may not stop app execution, so
                        // we need a flag to know to not to override the
                        // ngClick directives in the ngTouchNoNgClickAfter
                        // module's config phase, below.
                        state.incompatible = true;
                        throw new Error(
                            'ngTouchNoNgClick is incompatible with apps or ' +
                            'modules that have registered their own ' +
                            'ngClick directives'
                        );
                    }
                    if ($delegate.length > 1) {
                        // ngTouch has registered its own ngClick directive, so
                        // save the original one.
                        state.ngClickDirectiveOriginal = $delegate[0];
                    }
                    return $delegate;
                }
            ]);

        }
    ]);

    // Restore the default ngClick directive.
    after.config([
        '$provide',
        function (
            $provide
        ) {

            $provide.decorator('ngClickDirective', [
                '$delegate',
                function ($delegate) {
                    if (state.incompatible) {
                        // Do nothing.
                        return $delegate;
                    }
                    if (state.ngClickDirectiveOriginal) {
                        // The original ngClick directive has been removed by
                        // ngTouch so write over the ngTouch override with the
                        // original.
                        $delegate[0] = state.ngClickDirectiveOriginal;
                    }
                    return $delegate;
                }
            ]);

        }
    ]);

}(window.angular, window._));
