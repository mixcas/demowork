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

                function emptyFolder(folderName,callback){
                    var params = {
                        Bucket: 'pasalo92imageupload',
                        Prefix: folderName + "/"
                    };

                    var s3 = new AWS.S3();

                    s3.listObjects(params, function (err, data) {
                        if (err) {
                            return callback(err);
                        }

                        if (data.Contents.length === 0) {
                            return callback();
                        }

                        params = {Bucket: 'pasalo92imageupload'};
                        params.Delete = {Objects: []};

                        data.Contents.forEach(function (content) {
                            params.Delete.Objects.push({Key: content.Key});
                        });

                        s3.deleteObjects(params, function (err, data) {
                            if (err) {
                                return callback(err);
                            }
                            if (data.Deleted.length === 1000) {
                                emptyFolder(folderName, callback);
                            } else {
                                callback();
                            }
                        });
                    });
                }

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

                            emptyFolder(marker.markerNum);

                        }

                    });

                    google.maps.event.addListener(marker, 'click', function() {
                        var modalInstance = $modal.open({
                            animation: true,
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'myModalContent.html',
                            controller: 'modalCtrl',
                            size: 'lg',
                            resolve: {
                                markNum: function () {
                                    return marker.markerNum;
                                }
                            }
                        });
                    });

                }
            }
        };
    }])

    .controller('modalCtrl', function modalCtrl($scope, $modal, $modalInstance, markNum) {

        $scope.s3Url = "https://s3-us-west-1.amazonaws.com/pasalo92imageupload/";
        // var deferred = $q.defer();
        var picObjects = [];

        var bucket = new AWS.S3({
            params: {
                Bucket: 'pasalo92imageupload',
                Prefix:  markNum.toString() + "/"
            }
        });

        var callBucket = function () {
            bucket.listObjects(function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    $scope.thumbData = data.Contents;
                    picObjects = data.Contents;
                }
            });
        };
        
        var deletePic = function (key) {

            var params = { Key: key };

            bucket.deleteObject(params, function(err, data) {
                if(err) {
                    console.log(err, err.stack);  // error
                } else {
                    alert(key + " has been deleted");
                }
            });

        };

        callBucket();

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

        $scope.deleteImg = function(indx, key) {

            var conf = confirm("Are you sure you wish to delete this image?");

            if (conf) {
                deletePic(key);
                $scope.thumbData.splice(indx, indx+1);
            }

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
                // Prepend Unique String To Prevent Overwrites
                var uniqueFileName = uniqueString() + '-' + file.name;

                var params = { Key: markNum.toString() + "/" + uniqueFileName, ContentType: file.type, Body: file, ServerSideEncryption: 'AES256' };

                bucket.putObject(params, function(err) {
                    if(err) {
                        console.log(err.message);
                        return false;
                    }
                    else {
                        // Upload Successfully Finished
                        alert('File Uploaded Successfully');
                        callBucket();
                        $scope.uploadProgress = 0;
                        $scope.$digest();
                        $scope.showProgress = false;
                    }
                })
                    .on('httpUploadProgress',function(progress) {
                        $scope.showProgress = true;
                        $scope.uploadProgress = Math.round(progress.loaded / progress.total * 100);
                        $scope.$digest();
                    });
            }
            else {
                // No File Selected
                alert('Please select a file to upload');
            }

        };

    });
