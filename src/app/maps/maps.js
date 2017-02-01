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


    .factory('mapsService', function ($http, $q) {

            return {

                getMarkers: function () {

                    var deferred = $q.defer();

                    $http.get("http://localhost:3000/markers").then(function (results) {

                        deferred.resolve({
                            data: results.data
                        });
                        // }).error(function(msg, code) {
                        //     deferred.reject(msg);
                        //     $log.error(msg, code);
                    });

                    return deferred.promise;

                },
                setMarkers: function(latLng, clicks, addOrDel) {

                    $http.post("http://localhost:3000/markers", { latLng: latLng, markerNum: clicks, addOrDel: addOrDel });

                }
            };

        })



    .controller('MapsCtrl', function MapsCtrl($scope) {

    })

    .directive('pslMaps', ['geolocation', 'mapsService', '$modal', '$document', function (geolocation, mapsService, $modal, $document) {
        return {
            restrict: 'E',
            templateUrl: 'maps/pslMaps.tpl.html',
            controller: function () {

                var vm = this;

                vm.map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 7,
                    center: {lat: -25.363882, lng: 131.044922}
                });

            },
            controllerAs: 'mapsCtrl',
            link: function (scope, element, attrs, mapsCtrl) {

                var clicks;

                initMap = function () {

                    AWS.config.update({
                        accessKeyId: '',
                        secretAccessKey: '',
                        region: 'us-west-1'
                    });

                    mapsCtrl.map.addListener('click', function (e) {

                        clicks = clicks + 1;
                        placeOrDelMarker(e.latLng, mapsCtrl.map, clicks);

                        var myLatLng = {
                            lat: e.latLng.lat(),
                            lng: e.latLng.lng()
                        };
                        mapsService.setMarkers(myLatLng, clicks, 'add');
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
                            //handleLocationError();
                        });

                    }

                    mapsService.getMarkers().then(function (result) {

                        if (result.data.length === 0) {
                            clicks = 0;
                        }

                        for (var i = 0; i < result.data.length; i++) {

                            placeOrDelMarker(result.data[i].latLng, mapsCtrl.map, result.data[i].markerNum);

                            if (i == result.data.length - 1) {
                                clicks = result.data[i].markerNum;
                            }
                        }
                    });

                };

                initMap();

                function placeOrDelMarker(latLng, map, numClicks) {

                    var marker = new google.maps.Marker
                    ({
                        position: latLng,
                        map: map,
                        markerNum: numClicks
                    });

                    google.maps.event.addListener(marker, 'rightclick', function(e) {

                        var conf = confirm('Are you sure you wish to delete this marker?');
                        if (conf) {
                            marker.setMap(null);
                            mapsService.setMarkers(latLng, 'del');
                        }

                    });

                    google.maps.event.addListener(marker, 'click', function() {
                        var modalInstance = $modal.open({
                            animation: true,
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'myModalContent.html',
                            controller: 'modalCtrl',
                            size: 'lg'
                        });
                    });

                    // var lat = latLng.lat();
                    // var lng = latLng.lng();


                    // var s3bucket = new AWS.S3();
                    // s3bucket.createBucket(function() {
                    //     var params = {Bucket: 'bucket/sub-bucket', Key: 'pasalo92TestBucket', Body: 'Hello!'};
                    //     s3bucket.putObject(params, function(err, data) {
                    //         if (err) {
                    //             console.log("Error uploading data: ", err);
                    //         }
                    //     });
                    // });
                }
            }
        };
    }])

    .controller('modalCtrl', function modalCtrl($scope, $modal, $modalInstance) {

        $scope.s3Url = "https://s3-us-west-1.amazonaws.com/pasalo92imageupload/";
        // var deferred = $q.defer();
        var picObjects = [];

        var bucket = new AWS.S3({
            params: {
                Bucket: 'pasalo92imageupload'
            }
        });

        bucket.listObjects(function (err, data) {
            if (err) {
                console.log(err);
            } else {
                //console.log(data);
                $scope.thumbData = data.Contents;
                picObjects = data.Contents;
            }
        });



        $scope.open = function(indx){
            
            $scope.modalInstance = $modal.open({
                animation: true,
                templateUrl: 'pic-modal.html',
                controller: function ($scope) {
                    $scope.imageData = picObjects;
                    $scope.s3Url2 = "https://s3-us-west-1.amazonaws.com/pasalo92imageupload/";
                    $scope.imageData[indx].active = true;
                }
            });
        };

        $scope.ok = function () {
            $modalInstance.close();
        };

        var uniqueString = function() {
            var text     = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for( var i=0; i < 8; i++ ) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        };
        
        $scope.upload = function (file) {

            if(file) {
                // Perform File Size Check First
                // var fileSize = Math.round(parseInt($scope.file.size));
                // if (fileSize > $scope.sizeLimit) {
                //     toastr.error('Sorry, your attachment is too big. <br/> Maximum '  + $scope.fileSizeLabel() + ' file attachment allowed','File Too Large');
                //     return false;
                // }
                // Prepend Unique String To Prevent Overwrites
                var uniqueFileName = uniqueString() + '-' + file.name;

                var params = { Key: uniqueFileName, ContentType: file.type, Body: file, ServerSideEncryption: 'AES256' };

                bucket.putObject(params, function(err) {
                    if(err) {
                        console.log(err.message);
                        return false;
                    }
                    else {
                        // Upload Successfully Finished
                        alert('File Uploaded Successfully');

                    }
                });
            }
            else {
                // No File Selected
                alert('Please select a file to upload');
            }

        };

    });
