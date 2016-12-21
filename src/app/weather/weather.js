angular.module( 'ngBoilerplate.weather', [
  'ui.router',
  'placeholders',
  'ui.bootstrap',
  'geolocation'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'weather', {
    url: '/weather',
    views: {
      "main": {
        controller: 'WeatherCtrl',
        templateUrl: 'weather/weather.tpl.html'
      }
    }
  });
})

.factory('weatherService', function($http, $q){

  var weatherObj = {
    //currentForecast: '',

  }

  return {

    getWeather: function(lat,long){

      var deferred = $q.defer();

      $http.get("http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" +
          long + "&APPID=60f3ccf4f2627d5542ff29c39ad87d13").then(function(results){

            weatherObj.currentForecast = results.data;
            weatherObj.weatherIcon = results.data;
            weatherObj.precipitation = results.data;
            weatherObj.humidity = results.data;
            weatherObj.wind = results.data;
            deferred.resolve(weatherObj);
            return deferred.promise;

      });

    },
    setWeather: function(data){
        // vm.weatherObjs[0].push({
        //   weatherData: data
        // });
    }

  }

})

.controller( 'WeatherCtrl', function WeatherCtrl( $scope ) {

})

    .directive('pslWeather', ['geolocation', 'weatherService', function (geolocation, weatherService) {
      return {
        restrict: 'E',
        templateUrl: 'weather/pslWeather.tpl.html',
        controller: function () {

          var vm = this;

          vm.getLoc = '';
          vm.geocoder = new google.maps.Geocoder();
          vm.cityState = '';
          vm.weatherObjs= [];
          vm.weatherIcon = '';
          //vm.lat


        },
        controllerAs: 'weatherCtrl',
        link: function (scope, element, attrs, weatherCtrl) {

          var lat,long;

          weatherCtrl.getLoc = geolocation.getLocation().then(function(data){
            lat = data.coords.latitude;
            long = data.coords.longitude;

            var latlng = new google.maps.LatLng(lat, long);

            weatherCtrl.geocoder.geocode({
              'latLng': latlng
            }, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                  weatherCtrl.weatherObjs.push({
                     cityState:  results[0]['address_components'][2].long_name + ', ' +
                     results[0]['address_components'][4].short_name
                  });

                } else {
                  alert("city not found");
                }
              } else {
                alert("Geocoder failed due to: " + status);
              }
            });

            weatherService.getWeather(lat,long).then(function(result){

              console.log(result);

            });
            var setWeatherData = weatherService.setWeather(weatherData);

            // weatherCtrl.weatherObjs[0].push({
            //     weatherIcon: "http://openweathermap.org/img/w/" + weatherCtrl.weatherObjs[0].weather.icon + ".png"
            // });


          });

            function initialize() {

                var input = document.getElementById('search-new-city');
                var autocomplete = new google.maps.places.Autocomplete(input);
            }

            google.maps.event.addDomListener(window, 'load', initialize);





        }
      };
    }]);
