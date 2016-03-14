/*

    Modules:
    - ngTouchNoNgClick
    - ngTouchNoNgClick-v1.1

    Support:
    - v1.1.5+ for ngMobile
    - v1.2.0 to latest v1.4.x for ngTouch

    ngTouchNoNgClick allows the disabling of ngTouch's ngClickDirective override
    by saving the original directive definition before ngTouch's config phase
    can override it and restoring it after.

    Angular 1.2.0 renamed ngMobile to ngTouch, so we have to provide two
    separate modules: one depending on ngMobile, the other depending on ngTouch.
    Since ngTouch is going to be the most used (considering applicable versions
    and that ngMobile was deprecated), we suffix the ngMobile module with -v1.1
    to signify that it should be used with Angular v1.1.x.

    ngMobile is available in Angular v1.1.4, but there is nothing else in it but
    ngClickDirective, so we cannot test if ngTouch has been loaded before this
    as a dependency. It is imperative that we can test for that, otherwise we
    cannot know the original ngClickDirective is inaccessible. As such, this
    does not support v1.1.4, but it does support v1.1.5 because it introduced
    ngSwipeLeftDirective and ngSwipeRightDirective.

    ngTouchNoNgClick is incompatible with an app if any other ngClickDirectives
    are registered.

*/

(function (angular, _) {

    'use strict';

    // Semver: ~1.1.5
    // From 1.1.5 to the last 1.1.x patch version.
    // 1.1.4 first introduced ngMobile but we cannot work with that because it
    // doesn't have anything other than ngClickDirective for us to test if the
    // module has been loaded before this.
    angular.module('ngTouchNoNgClick-v1.1', [
        'ngTouchNoNgClickBefore',
        'ngMobile',
        'ngTouchNoNgClickAfter'
    ]);

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
                // this and the original ngClickDirective will no longer be
                // available. All we can do now is error.
                throw new Error(
                    'ngTouchNoNgClick: original ngClickDirective is not ' +
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
                    if ($delegate.length > 2) {
                        // There are extra ngClickDirectives, so we cannot know
                        // the $delegate index position of ngTouch's override to
                        // restore the original.
                        // Throwing an error here may not stop app execution, so
                        // we need a flag to know to not to override the
                        // ngClickDirectives in the ngTouchNoNgClickAfter
                        // module's config phase, below.
                        state.incompatible = true;
                        throw new Error(
                            'ngTouchNoNgClick is incompatible with apps or ' +
                            'modules that have registered their own ' +
                            'ngClickDirectives'
                        );
                    }
                    if ($delegate.length > 1) {
                        // ngTouch has registered its own ngClickDirective, so save
                        // the original one.
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
                        // The original ngClickDirective has been removed by ngTouch
                        // so write over the ngTouch override with the original.
                        $delegate[0] = state.ngClickDirectiveOriginal;
                    }
                    return $delegate;
                }
            ]);

        }
    ]);

}(window.angular, window._));
