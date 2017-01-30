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
                // getNumClicks: function() {
                //
                //     $http.get("http://localhost:3000/clicks").then(function (results) {
                //
                //     };
                //
                // }
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
                        accessKeyId: 'AKIAJANYG2Z6DURTB6XA',
                        secretAccessKey: '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',
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
                $scope.imageData = data.Contents;
            }
        });

        $scope.open=function(indx){
            
            $scope.imageData[indx].active=true;

            $scope.modalInstance=$modal.open({
                animation: true,
                templateUrl: 'pic-modal.html'
                //scope: $scope
            });
        };

        $scope.ok = function () {
            $modalInstance.close();
        };
        
        // $scope.upload = function () {
        //
        //     /*
        //
        //     if($scope.file) {
        //         // Perform File Size Check First
        //         // var fileSize = Math.round(parseInt($scope.file.size));
        //         // if (fileSize > $scope.sizeLimit) {
        //         //     toastr.error('Sorry, your attachment is too big. <br/> Maximum '  + $scope.fileSizeLabel() + ' file attachment allowed','File Too Large');
        //         //     return false;
        //         // }
        //         // Prepend Unique String To Prevent Overwrites
        //         var uniqueFileName = $scope.uniqueString() + '-' + $scope.file.name;
        //
        //         var params = { Key: uniqueFileName, ContentType: $scope.file.type, Body: $scope.file, ServerSideEncryption: 'AES256' };
        //
        //         bucket.putObject(params, function(err, data) {
        //             if(err) {
        //                 toastr.error(err.message,err.code);
        //                 return false;
        //             }
        //             else {
        //                 // Upload Successfully Finished
        //                 toastr.success('File Uploaded Successfully', 'Done');
        //
        //                 // Reset The Progress Bar
        //                 setTimeout(function() {
        //                     $scope.uploadProgress = 0;
        //                     $scope.$digest();
        //                 }, 4000);
        //             }
        //         })
        //             .on('httpUploadProgress',function(progress) {
        //                 $scope.uploadProgress = Math.round(progress.loaded / progress.total * 100);
        //                 $scope.$digest();
        //             });
        //     }
        //     else {
        //         // No File Selected
        //         toastr.error('Please select a file to upload');
        //     }
        //
        //     */
        // };

    });
