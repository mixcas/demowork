angular.module('ngBoilerplate.weather', [
    'ui.router',
    'placeholders',
    'ui.bootstrap',
    'geolocation'
])

    .config(function config($stateProvider) {
        $stateProvider.state('weather', {
            url: '/weather',
            views: {
                "main": {
                    controller: 'WeatherCtrl',
                    templateUrl: 'weather/weather.tpl.html'
                }
            }
        });
    })

    .factory('weatherService', function ($http, $q, $log) {

        return {

            getWeather: function (lat, lng) {

                var deferred = $q.defer();

                $http.get("http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" +
                    lng + "&APPID=60f3ccf4f2627d5542ff29c39ad87d13").then(function (results) {

                    deferred.resolve({

                        currentForecast: results.data.weather[0].description,
                        weatherIcon: results.data.weather[0].icon,
                        temperature: results.data.main.temp,
                        humidity: results.data.main.humidity,
                        wind: results.data.wind.speed

                    });
                    // }).error(function(msg, code) {
                    //     deferred.reject(msg);
                    //     $log.error(msg, code);
                });

                return deferred.promise;

            }
        };

    })

    .controller('WeatherCtrl', function WeatherCtrl($scope) {

    })

    .directive('pslWeather', ['geolocation', 'weatherService', function (geolocation, weatherService) {
        return {
            restrict: 'E',
            templateUrl: 'weather/pslWeather.tpl.html',
            controller: function () {

                var vm = this;

                vm.getLoc = '';
                vm.geocoder = new google.maps.Geocoder();
                vm.weatherObjs = [];
                vm.weatherIcon = '';

            },
            controllerAs: 'weatherCtrl',
            link: function (scope, element, attrs, weatherCtrl) {

                var lat, lng;

                weatherCtrl.getLoc = geolocation.getLocation().then(function (data) {
                    lat = data.coords.latitude;
                    lng = data.coords.longitude;

                    var latlng = new google.maps.LatLng(lat, lng);

                    weatherCtrl.geocoder.geocode({
                        'latLng': latlng
                    }, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results[0]) {

                                weatherService.getWeather(lat, lng).then(function (result) {

                                    weatherCtrl.weatherObjs.push({
                                        cityState: results[2]['address_components'][0].long_name + ', ' +
                                        results[2]['address_components'][2].short_name,
                                        currentForecast: toTitleCase(result.currentForecast),
                                        weatherIcon: "http://openweathermap.org/img/w/" + result.weatherIcon + ".png",
                                        temperature: (Math.round(result.temperature - 273)).toString() + " °C",
                                        humidity: "Humidity: " + result.humidity.toString() + "%",
                                        wind: "Wind: " + result.wind.toString() + " m/s",
                                        cityFlag: "http://openweathermap.org/images/flags/" +
                                        results[2]['address_components'][2].short_name.toLocaleLowerCase() + ".png"
                                    });
                                });

                            } else {
                                alert("city not found");
                            }
                        } else {
                            alert("Geocoder failed due to: " + status);
                        }
                    });

                });

                scope.addCity = function () {

                    var newLat = document.getElementById('cityLat').value;
                    var newLng = document.getElementById('cityLng').value;
                    var newCity = document.getElementById('city2').value;
                    var newCountry = document.getElementById('country2').value;

                    weatherService.getWeather(newLat, newLng).then(function (result) {

                        weatherCtrl.weatherObjs.push({
                            cityState: newCity + ', ' + newCountry,
                            currentForecast: toTitleCase(result.currentForecast),
                            weatherIcon: "http://openweathermap.org/img/w/" + result.weatherIcon + ".png",
                            temperature: (Math.round(result.temperature - 273)).toString() + " °C",
                            humidity: "Humidity: " + result.humidity.toString() + "%",
                            wind: "Wind: " + result.wind.toString() + " m/s",
                            cityFlag: "http://openweathermap.org/images/flags/" + newCountry.toLocaleLowerCase() + ".png"
                        });
                    });

                };


                function initialize() {

                    var input = document.getElementById('search-new-city');
                    var autocomplete = new google.maps.places.Autocomplete(input);
                    google.maps.event.addListener(autocomplete, 'place_changed', function () {
                        var place = autocomplete.getPlace();
                        document.getElementById('city2').value = place.name;
                        document.getElementById('country2').value = place.address_components[place.address_components.length-1].short_name;
                        document.getElementById('cityLat').value = place.geometry.location.lat();
                        document.getElementById('cityLng').value = place.geometry.location.lng();

                    });
                }

                function toTitleCase(str) {

                    return str.replace(/\w\S*/g, function(txt){
                        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}
                    );

                }

                google.maps.event.addDomListener(window, 'load', initialize);


            }
        };
    }]);
