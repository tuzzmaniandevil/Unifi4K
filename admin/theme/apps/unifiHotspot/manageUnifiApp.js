(function () {
    'use strict';

    // Site Module
    angular.module('unifiApp.site', ['ngRoute', 'ngResource', 'ngAnimate'])
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
                        var result;
                        $.ajax({
                            url: '/unifiHotspot/' + siteId + '/site.json',
                            dataType: 'JSON',
                            async: false
                        }).done(function (data) {
                            result = data;
                        });
                        return result;
                    };
                }])
            .controller('siteCtrl',
                    ['$scope', '$routeParams', '$http', '$location', 'siteService',
                        function ($scope, $routeParams, $http, $location, siteService) {
                            $scope.siteId = $routeParams.siteId;
                            $scope.site = siteService($scope.siteId);

                            if (angular.isUndefined($scope.site)) {
                                $location.path('/sites');
                            }

                            $scope.refreshSite = function () {
                                $scope.site = siteService($scope.siteId);
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
                'ngMaterial',
                'ngExDialog',
                'unifiApp.site'
            ])
            .factory('sitesService', ['$resource', '$location', function ($resource, $location) {
                    return {
                        getSites: function () {
                            return $resource('/unifiHotspot/sites.json').query();;
                        },
                        getLocation: function () {
                            return $location;
                        }
                    };
                }
            ])
            .controller('sitesCtrl', ['sitesService', 'exDialog', '$scope', '$rootScope', '$location', '$filter', function (sitesService, exDialog, $scope, $rootScope, $location, $filter) {
                    $rootScope.sites = sitesService.getSites();
                    $scope.rootScope = $rootScope;
                    $scope.location = sitesService.getLocation();

                    $scope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
                        if (newUrl != oldUrl && exDialog.hasOpenDialog()) {
                            exDialog.closeAll();
                        }
                    });

                    $scope.nav = {};
                    $scope.nav.isActive = function (siteId) {
                        var path = '/sites/' + siteId;
                        if (path === $location.path()) {
                            return true;
                        }

                        return false;
                    };

                    $scope.addSiteDialog = function (ev) {
                        exDialog.openPrime({
                            scope: $scope,
                            template: '/theme/apps/unifiHotspot/ngExDialog/addNewSite.html',
                            controller: 'addSiteController',
                            width: '450px',
                            grayBackground: true,
                            draggable: false
                        });
                    };

                    $scope.currentSite = function () {
                        var siteId = $scope.location.path().replace('/sites/', '');
                        var site = siteId;

                        var sorted = $filter('orderBy')($rootScope.sites, 'title');

                        if (siteId === '/sites') {
                            if (sorted.length > 0) {
                                $scope.location.path('/sites/' + sorted[0].id);
                                return;
                            } else {
                                return "No sites";
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
            .controller('addSiteController', ['$scope', '$rootScope', 'sitesService', function ($scope, $rootScope, sitesService) {
                    $scope.newSite = {};
                    $scope.save = function () {
                        if (isBlank($scope.newSite.name) || isBlank($scope.newSite.title)) {

                        } else {
                            $.ajax({
                                url: '/unifiHotspot/',
                                type: 'POST',
                                dataType: 'JSON',
                                data: {
                                    createNew: 'createNew',
                                    id: $scope.newSite.name,
                                    title: $scope.newSite.title
                                },
                                success: function (resp) {
                                    if (resp.status) {
                                        $rootScope.sites = sitesService.getSites();
                                        $scope.closeThisDialog("close");
                                        flog('success', resp);
                                    } else {

                                    }
                                },
                                error: function () {

                                }
                            });
                        }
                    };

                    $scope.cancel = function () {
                        $scope.closeThisDialog("close");
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

    function isBlank(s) {
        if (s === null || typeof s === 'undefined') {
            return true;
        }
        return s.toString().trim().length < 1;
    }
})();