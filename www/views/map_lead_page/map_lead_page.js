/**
 * Created by dingyiming on 2016/12/7.
 */
angular.module('starter')
    .controller('mapLeadPageController',function($scope,$state,$rootScope,$ionicNativeTransitions){

        $scope.go_back=function(){
            $ionicNativeTransitions.stateGo('gaoDeHome', {}, {}, {
                "type": "slide",
                "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
                "duration": 240, // in milliseconds (ms), default 400
            });
        }






    })
