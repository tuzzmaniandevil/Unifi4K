(function () {
    'use strict';

    // Site Module
    angular.module('unifiApp.site', ['ngRoute', 'ngResource'])
            .config(['$routeProvider', function ($routeProvider) {
                    $routeProvider
                            .when('/sites/:siteId', {
                                templateUrl: '/theme/apps/unifiHotspot/sites/site.html',
                                controller: 'siteCtrl'
                            });
                }
            ])
            .factory('siteService', ['$resource', function ($resource) {
                    return function (siteId) {
                        return $resource('/unifiHotspot/' + siteId + '/site.json').get();
                    };
                }])
            .controller('siteCtrl',
                    ['$scope', '$routeParams', 'siteService',
                        function ($scope, $routeParams, siteService) {
                            $scope.siteId = $routeParams.siteId;
                            $scope.site = siteService($scope.siteId);
                        }
                    ]);

    angular.element(document).ready(function () {
        $('[ng-app=unifiApp]').removeClass('hide');
        $('#loading').addClass('hide');
    });

    // UniFi App
    angular
            .module('unifiApp', [
                'ngRoute',
                'unifiApp.site'
            ])
            .factory('sitesService', ['$resource', '$location', function ($resource, $location) {
                    return {
                        getSites: function () {
                            return $resource('/unifiHotspot/sites.json').query();
                        },
                        getLocation:
                                function () {
                                    return $location;
                                }
                    };
                }
            ])
            .controller('sitesCtrl', ['sitesService', '$scope', '$location', function (sitesService, $scope, $location) {
                    $scope.sites = sitesService.getSites();
                    $scope.location = sitesService.getLocation();

                    $scope.nav = {};
                    $scope.nav.isActive = function (siteId) {
                        var path = '/sites/' + siteId;
                        if (path === $location.path()) {
                            return true;
                        }

                        return false;
                    };
                }
            ])
            .config(['$routeProvider', function ($routeProvider) {
                    $routeProvider
                            .otherwise({
                                redirectTo: "/sites"
                            })
                }
            ])
            .filter('formatCode', function () {
                return function (code) {
                    var c = code.toString();
                    return c.substring(0, 5) + '-' + c.substring(5);
                };
            });

})();