/* jshint es3: false, esnext: true */

(function () {

    'use strict';

    // TODO: test against all latest supported Angular versions.

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

    // Replicate ngMobile simply by decorating ngClickDirective in the same
    // manner and provide a new ngClickDirective.
    // TODO: test against Angular v1.1.5 with ngMobile instead of mocking.
    var mockNgMobile = function () {
        var ngMobileMock = angular.module('ngMobile', []);
        // Copied from ngMobile, and it's identical in the versions of ngTouch
        // this module supports.
        ngMobileMock.config(function ($provide) {
            $provide.decorator('ngClickDirective', function($delegate) {
                // drop the default ngClick directive
                $delegate.shift();
                return $delegate;
            });
        });
        // This directive can be empty, it isn't used, just needs to be defined.
        mockDirective('ngClick');
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
            })

        });

        // The code is the same for both dependencies, so add the same tests.
        var makeSuiteForVersion = function (ngDependency) {
            if (ngDependency !== 'ngMobile' && ngDependency !== 'ngTouch') {
                throw new Error('Unsupported ngDependency');
            }

            describe('with ' + ngDependency + ':', function () {

                beforeEach(function () {

                    this.moduleName = 'ngTouchNoNgClick';
                    if (ngDependency === 'ngMobile') {
                        this.moduleName = 'ngTouchNoNgClick-v1.1';
                        // Mock the ngMobile module.
                        mockNgMobile();
                    }

                    this.addOtherNgClick = () => mockDirective('ngClick');

                    this.loadThisModule = () => module(this.moduleName);

                    this.run = () => {
                        // Run the injector.
                        inject(function (ngClickDirective) {});
                    };

                });

                describe('without project ngClickDirectives', function () {

                    beforeEach(function () {

                        // Allow checking on the registered and resulting
                        // ngClickDirectives.
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

                    it('should restore the original ngClickDirective', function () {
                        this.loadThisModule();
                        this.run();
                        // Two ngClickDirectives registered.
                        expect(this.ngClickCompileFns.length).toBe(2);
                        // One left after the config phase.
                        expect(this.ngClickRegistry.length).toBe(1);
                        // It's the first one registered, the original ngClick.
                        expect(this.ngClickRegistry[0].compile).toBe(this.ngClickCompileFns[0]);
                    });

                });

                describe('with project ngClickDirectives already registered', function () {

                    it('should error that this module is incompatible', function () {
                        this.addOtherNgClick();
                        this.loadThisModule();

                        expect(this.run).toThrowInjectorInvokeError('ngTouchNoNgClick is incompatible with apps or modules that have registered their own ngClickDirectives');
                    });

                });

                describe('with project ngClickDirectives registered after', function () {

                    it('should error that this module is incompatible', function () {
                        this.loadThisModule();
                        this.addOtherNgClick();

                        expect(this.run).toThrowInjectorInvokeError('ngTouchNoNgClick is incompatible with apps or modules that have registered their own ngClickDirectives');
                    });

                });

                describe('with ngTouch already loaded', function () {

                    it('should error that the original ngClickDirective is inaccessible', function () {
                        module('ngTouch');
                        this.loadThisModule();
                        // Use a regex to match because a `[$injector:modulerr]`
                        // error is thrown, which contains the module initialise
                        // stack trace.
                        expect(this.run).toThrowError(/ngTouchNoNgClick: original ngClickDirective is not accessible. ngTouch must not be set as a dependency before ngTouchNoNgClick. Either remove ngTouch from your app dependencies, or make ngTouchNoNgClick the very first dependency before any others that may have a dependency on ngTouch/);
                    });

                });

                describe('with ngTouch loaded after', function () {

                    it('should not error that the original ngClickDirective is inaccessible', function () {
                        this.loadThisModule();
                        module('ngTouch');
                        // Use a regex to match because a `[$injector:modulerr]`
                        // error is thrown, which contains the module initialise
                        // stack trace.
                        expect(this.run).not.toThrowError(/ngTouchNoNgClick: original ngClickDirective is not accessible. ngTouch must not be set as a dependency before ngTouchNoNgClick. Either remove ngTouch from your app dependencies, or make ngTouchNoNgClick the very first dependency before any others that may have a dependency on ngTouch/);
                    });

                });

            });
        };

        makeSuiteForVersion('ngMobile');
        makeSuiteForVersion('ngTouch');

        // TODO: this can be tested by testing with Angular v1.5.0+
        describe('with ngClick from ngTouch disabled and not overriding the original (Angular v1.5.0+)', function () {

            beforeEach(function () {

                // Mock ngTouch so no ngClickDirective is registered by it.
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
