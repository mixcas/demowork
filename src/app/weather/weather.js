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

                $http.get("http://api.openweathermap.org/data/2.5/forecast/daily?lat=" + lat + "&lon=" +
                    lng + "&units=metric&APPID=60f3ccf4f2627d5542ff29c39ad87d13").then(function (results) {

                    deferred.resolve({

                        country: results.data.city.country,
                        currentForecast: results.data.list[0].weather[0].description,
                        weatherIcon: results.data.list[0].weather[0].icon,
                        temperature: results.data.list[0].temp.day,
                        humidity: results.data.list[0].humidity,
                        wind: results.data.list[0].speed,
                        dayOneForecast: {
                            day: results.data.list[1].dt,
                            currentForecast: results.data.list[1].weather[0].description,
                            weatherIcon: results.data.list[1].weather[0].icon,
                            temperature: results.data.list[1].temp.day
                        },
                        dayTwoForecast: {
                            day: results.data.list[2].dt,
                            currentForecast: results.data.list[2].weather[0].description,
                            weatherIcon: results.data.list[2].weather[0].icon,
                            temperature: results.data.list[2].temp.day
                        },
                        dayThreeForecast: {
                            day: results.data.list[3].dt,
                            currentForecast: results.data.list[3].weather[0].description,
                            weatherIcon: results.data.list[3].weather[0].icon,
                            temperature: results.data.list[3].temp.day
                        }

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

            },
            controllerAs: 'weatherCtrl',
            link: function (scope, element, attrs, weatherCtrl) {

                var lat, lng, city, country;

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

                                    city = results[2]['address_components'][0].long_name;
                                    country = result.country;


                                    weatherCtrl.weatherObjs.push({
                                        cityState: city + ', ' + country,
                                        currentForecast: toTitleCase(result.currentForecast),
                                        weatherIcon: "http://openweathermap.org/img/w/" + result.weatherIcon + ".png",
                                        temperature: result.temperature.toString() + " °C",
                                        humidity: "Humidity: " + result.humidity.toString() + "%",
                                        wind: "Wind: " + result.wind.toString() + " m/s",
                                        cityFlag: "http://openweathermap.org/images/flags/" + country.toLocaleLowerCase() + ".png",
                                        dayOneForecast: {
                                            day: timeConverter(result.dayOneForecast.day),
                                            currentForecast: toTitleCase(result.dayOneForecast.currentForecast),
                                            weatherIcon: "http://openweathermap.org/img/w/" +
                                                         result.dayOneForecast.weatherIcon + ".png",
                                            temperature: result.dayOneForecast.temperature.toString() + " °C"
                                        },
                                        dayTwoForecast: {
                                            day: timeConverter(result.dayTwoForecast.day),
                                            currentForecast: toTitleCase(result.dayTwoForecast.currentForecast),
                                            weatherIcon: "http://openweathermap.org/img/w/" +
                                                          result.dayTwoForecast.weatherIcon + ".png",
                                            temperature: result.dayTwoForecast.temperature.toString() + " °C"
                                        },
                                        dayThreeForecast: {
                                            day: timeConverter(result.dayThreeForecast.day),
                                            currentForecast: toTitleCase(result.dayThreeForecast.currentForecast),
                                            weatherIcon: "http://openweathermap.org/img/w/" +
                                                         result.dayThreeForecast.weatherIcon + ".png",
                                            temperature: result.dayThreeForecast.temperature.toString() + " °C"
                                        }

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
                            temperature: result.temperature.toString() + " °C",
                            humidity: "Humidity: " + result.humidity.toString() + "%",
                            wind: "Wind: " + result.wind.toString() + " m/s",
                            cityFlag: "http://openweathermap.org/images/flags/" + newCountry.toLocaleLowerCase() + ".png",
                            dayOneForecast: {
                                day: timeConverter(result.dayOneForecast.day),
                                currentForecast: toTitleCase(result.dayOneForecast.currentForecast),
                                weatherIcon: "http://openweathermap.org/img/w/" +
                                result.dayOneForecast.weatherIcon + ".png",
                                temperature: result.dayOneForecast.temperature.toString() + " °C"
                            },
                            dayTwoForecast: {
                                day: timeConverter(result.dayTwoForecast.day),
                                currentForecast: toTitleCase(result.dayTwoForecast.currentForecast),
                                weatherIcon: "http://openweathermap.org/img/w/" +
                                result.dayTwoForecast.weatherIcon + ".png",
                                temperature: result.dayTwoForecast.temperature.toString() + " °C"
                            },
                            dayThreeForecast: {
                                day: timeConverter(result.dayThreeForecast.day),
                                currentForecast: toTitleCase(result.dayThreeForecast.currentForecast),
                                weatherIcon: "http://openweathermap.org/img/w/" +
                                result.dayThreeForecast.weatherIcon + ".png",
                                temperature: result.dayThreeForecast.temperature.toString() + " °C"
                            }
                        });
                    });

                };


                function initialize() {

                    var input = document.getElementById('search-new-city');
                    var autocomplete = new google.maps.places.Autocomplete(input);
                    google.maps.event.addListener(autocomplete, 'place_changed', function () {
                        var place = autocomplete.getPlace();
                        document.getElementById('city2').value = place.name;
                        document.getElementById('cityLat').value = place.geometry.location.lat();
                        document.getElementById('cityLng').value = place.geometry.location.lng();

                        if (isNaN(place.address_components[place.address_components.length - 1].short_name)) {

                            document.getElementById('country2').value = place.address_components[place.address_components.length - 1].short_name;

                        } else {

                            document.getElementById('country2').value = place.address_components[place.address_components.length - 2].short_name;

                        }


                    });
                }

                function toTitleCase(str) {

                    return str.replace(/\w\S*/g, function (txt) {
                            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                        }
                    );

                }

                function timeConverter(UNIX_timestamp){
                    var a = new Date(UNIX_timestamp * 1000);
                    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                    var year = a.getFullYear();
                    var month = months[a.getMonth()];
                    var date = a.getDate();
                    var time = date + ' ' + month + ' ' + year ;
                    return time;
                }

                google.maps.event.addDomListener(window, 'load', initialize);


            }
        };
    }]);
