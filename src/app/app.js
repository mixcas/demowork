angular.module('ngBoilerplate', [
    'templates-app',
    'templates-common',
    'ngBoilerplate.calculator',
    'ngBoilerplate.weather',
    'ngBoilerplate.maps',
    //'ngBoilerplate.test',
    'psl.upload',
    'ui.router'
])

    .config(function myAppConfig($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/calculator');
    })

    .run(function run() {
    })

    .controller('AppCtrl', function AppCtrl($scope, $location) {

    });

