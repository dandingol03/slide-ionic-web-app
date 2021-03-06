/**
 * Created by dingyiming on 2016/12/7.
 */
angular.module('starter')
    .controller('mapLeadPageController',function($scope,$state,$rootScope,
                                                 $ionicNativeTransitions,$cordovaPreferences,$ionicPlatform){

        $scope.go_back=function(){
            $ionicNativeTransitions.stateGo('gaoDeHome', {}, {}, {
                "type": "slide",
                "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
                "duration": 240, // in milliseconds (ms), default 400
            });
        }



        //申请权限
        $scope.requestPermissions=function () {

            window.Media.requestPermissions(function(re)
            {
                console.log(re);
            },function (err) {
                alert(err);
            });
        }

        $scope.start2Use=function () {
            $ionicNativeTransitions.stateGo('login', {redirected:true}, {}, {
                "type": "slide",
                "direction": "left", // 'left|right|up|down', default 'left' (which is like 'next')
                "duration": 300, // in milliseconds (ms), default 400
            });
            //$state.go('login',{params:JSON.stringify({redirected:true})});
        }

    })
