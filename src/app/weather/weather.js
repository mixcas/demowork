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

.factory('weatherService', function($http){

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

  }

})

.controller( 'WeatherCtrl', function AboutCtrl( $scope ) {

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

            var weatherData = weatherService.getWeather(lat,long);
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
