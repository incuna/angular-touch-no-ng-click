/* jshint es3: false, esnext: true */

(function () {

    'use strict';

    var noopDirectiveCompileFn = function noopDirectiveCompileFn () {};
    var noopDirectiveDefinition = function () {
        return {
            compile: noopDirectiveCompileFn
        };
    };

    var mockDirective = function (directiveName) {
        module(function ($compileProvider) {
            $compileProvider.directive(directiveName, noopDirectiveDefinition);
        });
    };

    describe('angular-touch-no-ng-click', function () {

        beforeEach(function () {

            // We have to add a custom matcher to compare the message property
            // of the caught error because jasmine's toThrowError is failing for
            // errors thrown from inside an injector.invoke() call: the type of
            // the error is odd, it's like a special Karma thing and jasmine
            // fails with:
            // "Expected function to throw Error: my error message, but instead threw Error: my error message"

            jasmine.addMatchers({
                toThrowInjectorInvokeError: function (utils) {
                    return {
                        compare: function (actual, expected) {
                            var result = {};
                            result.pass = false;
                            try {
                                actual();
                            } catch (actualError) {
                                result.pass = utils.equals(actualError.message, expected);
                                if (result.pass) {
                                    result.message = 'Expected function to throw ' + expected + ', but it threw ' + actualError.message;
                                } else {
                                    result.message = 'Expected function not to throw ' + expected;
                                }
                                return result;
                            }
                        }
                    };
                }
            });

            this.addOtherNgClick = () => mockDirective('ngClick');

            this.loadThisModule = () => module('ngTouchNoNgClick');

            this.run = () => {
                // Run the injector.
                inject(function (ngClickDirective) {});
            };

        });

        describe('without project ngClick directives', function () {

            beforeEach(function () {

                // Allow checking on the registered and resulting
                // ngClick directives.
                var self = this;
                module(function ($provide) {
                    $provide.decorator('ngClickDirective', function ($delegate) {
                        // $delegate is the value stored in Angular. We
                        // can access it by reference and see changes
                        // to it.
                        self.ngClickRegistry = $delegate;
                        // Here we save just the compile functions of
                        // all registered directives, thus providing a
                        // copy for comparing against the registry.
                        self.ngClickCompileFns = $delegate.map(directive => directive.compile);
                        // Return without modification.
                        return $delegate;
                    })
                });

            });

            it('should run without error', function () {
                this.loadThisModule();
                expect(this.run).not.toThrow();
            });

            it('should restore the original ngClick directive', function () {
                this.loadThisModule();
                this.run();
                // Two ngClick directives registered.
                expect(this.ngClickCompileFns.length).toBe(2);
                // One left after the config phase.
                expect(this.ngClickRegistry.length).toBe(1);
                // It's the first one registered, the original ngClick.
                expect(this.ngClickRegistry[0].compile).toBe(this.ngClickCompileFns[0]);
            });

        });

        describe('with project ngClick directives already registered', function () {

            it('should error that this module is incompatible', function () {
                this.addOtherNgClick();
                this.loadThisModule();

                expect(this.run).toThrowInjectorInvokeError('ngTouchNoNgClick is incompatible with apps or modules that have registered their own ngClick directives');
            });

        });

        describe('with project ngClick directives registered after', function () {

            it('should error that this module is incompatible', function () {
                this.loadThisModule();
                this.addOtherNgClick();

                expect(this.run).toThrowInjectorInvokeError('ngTouchNoNgClick is incompatible with apps or modules that have registered their own ngClick directives');
            });

        });

        describe('with ngTouch already loaded', function () {

            it('should error that the original ngClick directive is inaccessible', function () {
                module('ngTouch');
                this.loadThisModule();
                // Use a regex to match because a `[$injector:modulerr]`
                // error is thrown, which contains the module initialise
                // stack trace.
                expect(this.run).toThrowError(/ngTouchNoNgClick: original ngClick directive is not accessible. ngTouch must not be set as a dependency before ngTouchNoNgClick. Either remove ngTouch from your app dependencies, or make ngTouchNoNgClick the very first dependency before any others that may have a dependency on ngTouch/);
            });

        });

        describe('with ngTouch loaded after', function () {

            it('should not error that the original ngClick directive is inaccessible', function () {
                this.loadThisModule();
                module('ngTouch');
                // Use a regex to match because a `[$injector:modulerr]`
                // error is thrown, which contains the module initialise
                // stack trace.
                expect(this.run).not.toThrowError(/ngTouchNoNgClick: original ngClick directive is not accessible. ngTouch must not be set as a dependency before ngTouchNoNgClick. Either remove ngTouch from your app dependencies, or make ngTouchNoNgClick the very first dependency before any others that may have a dependency on ngTouch/);
            });

        });

        // Angular v1.5.0+ is not supported – it's useless because ngTouch's
        // ngClick is disabled by default, so if you don't want it, don't enable
        // it – but we can keep this test as proof of concept.
        describe('with ngClick from ngTouch disabled and not overriding the original (Angular v1.5.0+ by default)', function () {

            beforeEach(function () {

                // Mock ngTouch so no ngClick directive is registered by it.
                angular.module('ngTouch', []);
                module('ngTouchNoNgClick');

                this.run = () => {
                    // Run the injector.
                    inject(function (ngClickDirective) {});
                };

            });

            it('should do nothing and not error', function () {
                expect(this.run).not.toThrow();
            });

        });

    });

}());
