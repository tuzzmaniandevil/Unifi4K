(function () {
    'use strict';

    // Sites Module
    angular.module('unifiApp.sites', ['ngRoute', 'ngResource'])
            .config(['$routeProvider', function ($routeProvider) {
                    $routeProvider
                            .when('/sites', {
                                templateUrl: '/theme/apps/unifiHotspot/sites/sites.html',
                                controller: 'sitesCtrl'
                            });
                }
            ])
            .factory('sitesService', ['$resource', function ($resource) {
                    return $resource('sites.json');
                }])
            .controller('sitesCtrl', ['sitesService', '$scope', function (sitesService, $scope) {
                    $scope.sites = sitesService.query();
                }]);

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

    // UniFi App
    var unifiApp = angular.module('unifiApp', [
        'ngRoute',
        'unifiApp.sites',
        'unifiApp.site'
    ]);

    unifiApp.config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                    .otherwise({redirectTo: '/sites'});
        }
    ]);
})();