/**
 * Created by dingyiming on 2017/1/12.
 */
/**
 * Created by apple-2 on 16/8/23.
 */
angular.module('starter')
    .controller('configAppController',function($scope,$state,$http,$rootScope,
                                          Proxy,$stateParams,$ionicNativeTransitions){


        $scope.goBack=function(){
            $ionicNativeTransitions.stateGo('help', {}, {}, {
                "type": "slide",
                "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
                "duration": 240, // in milliseconds (ms), default 400
            });
        };

        $scope.goTo=function(state){
            $state.go(state);
        };

        if($stateParams.params!==undefined&&$stateParams.params!==null)
        {
            var params=$stateParams.params;
            if(Object.prototype.toString.call(params)=='[object String]')
                params = JSON.parse(params);
            if(params.type!==undefined&&params.type!==null)
                $scope.type=params.type;
        }


        $scope.pictureExampleFlag=false;

        $scope.mutexPictureExample=function () {
            if($scope.pictureExampleFlag==false)
                $scope.pictureExampleFlag=true;
            else
                $scope.pictureExampleFlag=false;
        }

        $scope.pictureExample={
            notification:{
                phoneManager:false
            },
            memoryWhiteList:{

            }
        };

        $scope.togglePictureExample=function (tag) {
            if($scope.pictureExample[$scope.type][tag]!=true)
                $scope.pictureExample[$scope.type][tag]=true;
            else
                $scope.pictureExample[$scope.type][tag]=false;
        }



    });
