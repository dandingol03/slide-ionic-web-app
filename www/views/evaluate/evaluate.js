/**
 * Created by dingyiming on 2016/12/7.
 */
angular.module('starter')

    .controller('evaluateController',function($scope,$state,$ionicLoading,$http,$ionicPopup,$timeout,$rootScope
        ,$cordovaFile,$cordovaFileTransfer,$ionicActionSheet,$cordovaCamera,Proxy
        ,$WebSocket,$ionicPopover,$cordovaPreferences,$ionicPlatform){


        $scope.stars=[
            {checked:false},
            {checked:false},
            {checked:false},
            {checked:false},
            {checked:false}
            ];

        $scope.option = '';
        $scope.evaluate = 0;

        $scope.starsCount = null;


        $scope.setter=function (item,field,val) {
            if(item[field]==true){
                item[field]=val;
            }else{
                item[field]=true;
            }

            $scope.stars.map(function(star,i) {
                $scope.starsCount = 0;
                if(star.checked==true){
                    $scope.starsCount++;
                }
            })

        }



        $scope.submit = function(){
            $scope.stars.map(function(star,i) {
                $scope.starsCount = 0;
                if(star.checked==true){
                    $scope.starsCount++;
                }
            })
            $scope.evaluate =  $scope.starsCount;

            $http({
                method: "post",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data: {
                    request: 'updateServiceOrder',
                    info: {
                        evaluate: $scope.evaluate,
                        option:$scope.option
                    }
                }
            })


        }


    })