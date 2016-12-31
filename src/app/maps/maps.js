angular.module('ngBoilerplate.maps', [
    'ui.router',
    'placeholders',
    'ui.bootstrap'
])

    .config(function config($stateProvider) {
        $stateProvider.state('maps', {
            url: '/maps',
            views: {
                "main": {
                    controller: 'MapsCtrl',
                    templateUrl: 'maps/maps.tpl.html'
                }
            }
        });
    })

    .factory('mapsService', function ($http) {
        /*
         return {

         getWeather: function(lat,long){

         $http.get("http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" +
         long + "&APPID=60f3ccf4f2627d5542ff29c39ad87d13").then(function(data){

         return(data.data);

         });

         },
         setWeather: function(data){
         vm.weatherObjs[0].push({
         weatherData: data
         });
         }

         }*/

    })

    .controller('MapsCtrl', function MapsCtrl($scope, $modal) {

    })

    .directive('pslMaps', ['geolocation', 'mapsService', function (geolocation, mapsService) {
        return {
            restrict: 'E',
            templateUrl: 'maps/pslMaps.tpl.html',
            controller: function () {

                var vm = this;

                vm.map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 6,
                    center: {lat: -25.363882, lng: 131.044922}
                });


            },
            controllerAs: 'mapsCtrl',
            link: function (scope, element, attrs, mapsCtrl) {

                window.initMap = function () {

                    mapsCtrl.map.addListener('click', function (e) {
                        placeMarkerAndPanTo(e.latLng, mapsCtrl.map);
                    });

                    // Try HTML5 geolocation.
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(function (position) {
                            var pos = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            };

                            mapsCtrl.map.setCenter(pos);
                        }, function () {
                            handleLocationError();
                        });

                    }

                };

                function handleLocationError() {
                    alert('Cannot find location');
                }

                function placeMarkerAndPanTo(latLng, map) {
                    var marker = new google.maps.Marker({
                        position: latLng,
                        map: map

                    });

                    // map.addListener(marker, 'click', function() {
                    //   $('#myModal').modal('show');
                    // });
                }

            }
        };
    }]);
