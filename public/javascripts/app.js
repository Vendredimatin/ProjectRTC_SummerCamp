(function(){
    var app = angular.module('projectRtc', ['ngRoute', 'ngMaterial', 'ngMessages'],
        function($locationProvider){$locationProvider.html5Mode(true);}
    );

    var client = new PeerManager();
    var mediaConfig = {
        audio:true,
        video: {
            mandatory: {},
            optional: []
        }
    };

    app.config(function ($routeProvider) {
       $routeProvider.when(
           '/', {
               templateUrl: 'htmls/home.html'
           }
       ).when(
           '/view', {
               templateUrl: 'htmls/stream-view.html',
               controller: 'ViewController'
           }
       ).when(
           '/gps', {
               templateUrl: 'htmls/stream-gps.html',
               controller: 'GPSController'
           }
       ).when(
           '/guide', {
               templateUrl: 'htmls/stream-guide.html',
               controller: 'GuideController'
           }
       ).when(
           '/front-camera', {
               templateUrl: 'htmls/stream-frontcam.html',
               controller: 'FrontCameraController'
           }
       ).when(
           '/back-camera', {
               templateUrl: 'htmls/stream-backcam.html',
               controller: 'BackCameraController'
           }
       )
    });

    app.factory('camera', ['$rootScope', '$window', function($rootScope, $window){
        var camera = {};
        camera.preview = $window.document.getElementById('localVideo');

        camera.start = function(){
            return requestUserMedia(mediaConfig)
                .then(function(stream){
                    attachMediaStream(camera.preview, stream);
                    client.setLocalStream(stream);
                    camera.stream = stream;
                    $rootScope.$broadcast('cameraIsOn',true);
                })
                .catch(Error('Failed to get access to local media.'));
        };
        camera.stop = function(){
            return new Promise(function(resolve, reject){
                try {
                    //camera.stream.stop() no longer works
                    for( var track in camera.stream.getTracks() ){
                        track.stop();
                    }
                    camera.preview.src = '';
                    resolve();
                } catch(error) {
                    reject(error);
                }
            })
                .then(function(result){
                    $rootScope.$broadcast('cameraIsOn',false);
                });
        };
        return camera;
    }]);

    app.controller('RemoteStreamsController', ['camera', '$location', '$http', '$scope','$rootScope',
        function(camera, $location, $http, $scope, $rootScope){
        var rtc = this;
        rtc.remoteStreams = [];

        function getStreamById(id) {
            for(var i=0; i<rtc.remoteStreams.length;i++) {
                if (rtc.remoteStreams[i].id === id) {return rtc.remoteStreams[i];}
            }
        }

        rtc.loadData = function () {
            // get list of streams from the server
            $http.get('/streams.json').success(function(data){
                // filter own stream
                var streams = data.filter(function(stream) {
                    return stream.id != client.getId();
                });
                // get former state
                for(var i=0; i<streams.length;i++) {
                    var stream = getStreamById(streams[i].id);
                    streams[i].isPlaying = (!!stream) ? stream.isPLaying : false;
                }
                // save new streams
                rtc.remoteStreams = streams;
            });
        };

        $rootScope.$on("back", function (event, msg) {
            $scope.remoteStreamsIfShow = true;
        });

        rtc.call = function(stream){
            /* If json isn't loaded yet, construct a new stream
             * This happens when you load <serverUrl>/<socketId> :
             * it calls socketId immediatly.
            **/
            if(!stream.id){
                stream = {id: stream, isPlaying: false};
                rtc.remoteStreams.push(stream);
            }
            if(camera.isOn){
                client.toggleLocalStream(stream.id);
                if(stream.isPlaying){
                    client.peerRenegociate(stream.id);
                } else {
                    client.peerInit(stream.id);
                }
                stream.isPlaying = !stream.isPlaying;
            } else {
                camera.start()
                    .then(function(result) {
                        client.toggleLocalStream(stream.id);
                        if(stream.isPlaying){
                            client.peerRenegociate(stream.id);
                        } else {
                            client.peerInit(stream.id);
                        }
                        stream.isPlaying = !stream.isPlaying;
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            }
        };

        rtc.route = function (stream) {
            sessionStorage.setItem(stream.id, JSON.stringify(stream));
            $location.path('/guide').search({id: stream.id});
        };

        //initial load
        rtc.loadData();
        if($location.url() != '/'){
            rtc.call($location.url().slice(1));
        };
    }]);

    app.controller('GuideController', ['$location', '$http', '$scope', '$rootScope', '$window', '$route',
        function ($location, $http, $scope, $rootScope, $window, $route) {
        $scope.$route = $route;
        var streamId = $location.search().id;
        var stream = JSON.parse(sessionStorage.getItem(streamId));
        var guide = this;

        guide.view = function () {
            $rootScope.$broadcast("view",stream);
            $location.path('/view').search({id: streamId});
        };

        guide.gps = function () {
            client.peerInit(streamId);
            $location.path('/gps').search({id: streamId});
        };

        guide.front_camera = function () {
            $rootScope.$broadcast("view",stream);
            $location.path('/front-camera').search({id: streamId});
        };

        guide.back_camera = function () {
            $rootScope.$broadcast("view",stream);
            $location.path('/back-camera').search({id: streamId});
        }
    }]);
    
    app.controller('GPSController',['$location', '$http', '$scope','$rootScope', '$window', '$route',
        function ($location, $http, $scope, $rootScope, $window, $route) {
        $scope.$route = $route;
        var gps = this;
        var streamId = $location.search().id;
        var stream = JSON.parse(sessionStorage.getItem(streamId));
        $scope.load = function () {
            let coordinate;
            var listening = setInterval(waitDone, 500);
            function waitDone(){
                coordinate = client.getGPS($location.search().id);
                if(coordinate.longitude !== undefined) {
                    var map = new BMap.Map("allmap");
                    let longitude = coordinate.longitude;
                    let latitude = coordinate.latitude;
                    console.log(longitude, latitude);
                    var point = new BMap.Point(longitude, latitude);
                    map.centerAndZoom(point, 15);
                    map.addControl(new BMap.NavigationControl());
                    var convertor = new BMap.Convertor();
                    var pointArr = [];
                    pointArr.push(point);
                    function translateCallback(data) {
                        if(data.status === 0){
                            var marker = new BMap.Marker(data.points[0]);
                            map.addOverlay(marker);
                            map.setCenter(data.points[0]);
                        }
                    }
                    convertor.translate(pointArr,1,5,translateCallback);
                    clearInterval(listening);
                }
            }
        };
        gps.view = function () {
            $rootScope.$broadcast("view",stream);
            $location.path('/view').search({id: streamId});
        };
        gps.gps = function () {
            client.peerInit($location.search().id);
            $location.path('/gps').search({id: streamId});
        };
        gps.front_camera = function () {
            $rootScope.$broadcast("view",stream);
            $location.path('/front-camera').search({id: streamId});
        };
        gps.back_camera = function () {
            $rootScope.$broadcast("view",stream);
            $location.path('/back-camera').search({id: streamId});
        }
    }]);
    
    app.controller('ViewController',['$location', '$http', '$scope', '$rootScope', '$window', '$route',
        function ($location, $http, $scope, $rootScope, $window, $route) {
        $scope.$route = $route;
        var view = this;
        var remoteStream;
        var streamId = $location.search().id;
        var stream = JSON.parse(sessionStorage.getItem(streamId));
        view.view = function () {
            $rootScope.$broadcast("view",stream);
            $location.path('/view').search({id: streamId});
        };
        view.gps = function () {
            client.peerInit(streamId);
            $location.path('/gps').search({id: streamId});
        };
        view.front_camera = function () {
            $rootScope.$broadcast("view",stream);
            $location.path('/front-camera').search({id: streamId});
        };
        view.back_camera = function () {
            $rootScope.$broadcast("view",stream);
            $location.path('/back-camera').search({id: streamId});
        };
        $scope.load = function () {
            client.peerInit(streamId);
            client.getScreen(streamId);
            $scope.functions = ['Screen','GPS', 'Camera'];
        };
    }]);

    app.controller('FrontCameraController', ['$location', '$http', '$scope', '$rootScope', '$window', '$route',
        function ($location, $http, $scope, $rootScope, $window, $route) {
        $scope.$route = $route;
        var front_cam = this;
        var streamId = $location.search().id;
        var stream = JSON.parse(sessionStorage.getItem(streamId));
        front_cam.view = function () {
            $rootScope.$broadcast("view",stream);
            $location.path('/view').search({id: streamId});
        };
        front_cam.gps = function () {
            client.peerInit(streamId);
            $location.path('/gps').search({id: streamId});
        };
        front_cam.front_camera = function () {
            $rootScope.$broadcast("view",stream);
            $location.path('/front-camera').search({id: streamId});
        };
        front_cam.back_camera = function () {
            $rootScope.$broadcast("view",stream);
            $location.path('/back-camera').search({id: streamId});
        };
        $scope.load = function () {
            client.peerInit(streamId);
            client.getFrontCamera(streamId);
            $scope.functions = ['Screen','GPS', 'Camera'];
        }
    }]);

    app.controller('BackCameraController', ['$location', '$http', '$scope', '$rootScope', '$window', '$route',
        function ($location, $http, $scope, $rootScope, $window, $route) {
        $scope.$route = $route;
        var back_cam = this;
        var streamId = $location.search().id;
        var stream = JSON.parse(sessionStorage.getItem(streamId));
        back_cam.view = function () {
            $rootScope.$broadcast("view",stream);
            $location.path('/view').search({id: streamId});
        };
        back_cam.gps = function () {
            client.peerInit(streamId);
            $location.path('/gps').search({id: streamId});
        };
        back_cam.front_camera = function () {
            $rootScope.$broadcast("view",stream);
            $location.path('/front-camera').search({id: streamId});
        };
        back_cam.back_camera = function () {
            $rootScope.$broadcast("view",stream);
            $location.path('/back-camera').search({id: streamId});
        };
        $scope.load = function () {
            client.peerInit(streamId);
            client.getBackCamera(streamId);
            $scope.functions = ['Screen','GPS','Camera'];
        }
    }])
})();