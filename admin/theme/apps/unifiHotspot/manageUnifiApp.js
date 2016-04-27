(function () {
    'use strict';

    // Site Module
    angular.module('unifiApp.site', ['ngRoute', 'ngResource', 'ui.bootstrap', 'ngTouch', 'ngAnimate'])
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
                    ['$scope', '$routeParams', '$http', '$uibModal', 'siteService',
                        function ($scope, $routeParams, $http, $uibModal, siteService) {
                            $scope.siteId = $routeParams.siteId;
                            $scope.site = siteService($scope.siteId);

                            flog('site', $scope.site);

                            $scope.refreshSite = function () {
                                $scope.site = siteService($scope.siteId);
                            };

                            $scope.openAddVoucher = function () {

                            };

                            $scope.delVoucher = function (site) {
                                $http({
                                    method: 'DELETE',
                                    url: '/unifiHotspot/' + $scope.siteId + '/' + site.code
                                }).success(function () {
                                    var index = $scope.site.vouchers.indexOf(site);
                                    if (index > -1) {
                                        $scope.site.vouchers.splice(index, 1);
                                    }
                                });
                            };
                        }
                    ]);

    // UniFi App
    angular
            .module('unifiApp', [
                'ngRoute',
                'unifiApp.site'
            ])
            .factory('sitesService', ['$resource', '$location', '$filter', function ($resource, $location, $filter) {
                    return {
                        getSites: function () {
                            var result = $resource('/unifiHotspot/sites.json').query();
                            return result;
                        },
                        getLocation:
                                function () {
                                    return $location;
                                }
                    };
                }
            ])
            .controller('sitesCtrl', ['sitesService', '$scope', '$location', '$filter', function (sitesService, $scope, $location, $filter) {
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

                    $scope.refreshSites = function () {
                        $scope.sites = sitesService.getSites();
                        $scope.location.path('/sites');
                    };

                    $scope.currentSite = function () {
                        var siteId = $scope.location.path().replace('/sites/', '');
                        var site = siteId;

                        var sorted = $filter('orderBy')($scope.sites, 'title');

                        if (siteId === '/sites') {
                            if (sorted.length > 0) {
                                $scope.location.path('/sites/' + sorted[0].id);
                                return;
                            } else {
                                site = "None";
                            }
                        }

                        for (var i in sorted) {
                            var s = sorted[i];
                            if (s.id === siteId) {
                                site = s.title;
                                break;
                            }
                        }

                        return site;
                    };
                }
            ])
            .config(['$routeProvider', function ($routeProvider) {
                    $routeProvider
                            .otherwise({
                                redirectTo: "/sites"
                            });
                }
            ])
            .filter('formatCode', function () {
                return function (code) {
                    var c = code.toString();
                    return c.substring(0, 5) + '-' + c.substring(5);
                };
            });

    angular.element(document).ready(function () {
        $('[ng-app=unifiApp]').removeClass('hide');
        $('#loading').addClass('hide');
    });

    function dynamicSort(property) {
        var sortOrder = 1;
        if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a, b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        };
    }
})();