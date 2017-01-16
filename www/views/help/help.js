/**
 * Created by dingyiming on 2017/1/12.
 */
/**
 * Created by apple-2 on 16/8/23.
 */
angular.module('starter')
    .controller('helpController',function($scope,$state,$ionicHistory,$ionicNativeTransitions ){

        $scope.goBack=function(){
            $ionicNativeTransitions.stateGo('tabs.my', {}, {}, {
                "type": "slide",
                "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
                "duration": 240, // in milliseconds (ms), default 400
            });
        };

        $scope.goto=function(state){
            $state.go(state);
        };

        $scope.navigate=function (type) {
            $state.go('config_app', {params: JSON.stringify({type: type})});
        }

    });
