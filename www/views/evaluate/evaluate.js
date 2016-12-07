/**
 * Created by dingyiming on 2016/12/7.
 */
angular.module('starter')

    .controller('evaluateController',function($scope,$state,$ionicLoading,$http,$ionicPopup,$timeout,$rootScope
        ,$cordovaFile,$cordovaFileTransfer,$ionicActionSheet,$cordovaCamera,Proxy
        ,$WebSocket,$ionicPopover,$cordovaPreferences,$ionicPlatform){


        $scope.stars=[
            {index:0,checked:false},
            {index:1,checked:false},
            {index:2,checked:false},
            {index:3,checked:false},
            {index:4,checked:false}
            ];

        $scope.option = '';
        $scope.evaluate = 0;

        $scope.starsCount = null;


        $scope.starSetter=function (item,val) {

            for(var i=0;i<=item.index;i++) {
                $scope.stars[i].checked=true;
            }
            for(var i=item.index+1;i<=4;i++) {
                $scope.stars[i].checked=false;
            }
            $scope.starCount=item.index+1;

        }



        $scope.submit = function(){

            if($scope.starCount==undefined||$scope.starCount==null)
            {
                var myPopup = $ionicPopup.alert({
                    template: '请在评价一栏进行打分',
                    title: '信息'
                });
            }

            $scope.evaluate =  $scope.starCount;

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