/**
 * Created by yiming on 16/11/16.
 */
angular.module('starter')
    .controller('bindNewCarController',function($scope,$state,$http,
                                               $rootScope,$cordovaFileTransfer,Proxy,$timeout,$ionicPopup){

        $scope.carInfo={};

        $scope.bindNewCar = function(){

            $http({
                method: "POST",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data:
                {
                    request:'rebindCarInfo',
                    info:{
                        carNum:$scope.carInfo.carNum,
                        ownerName:$scope.carInfo.ownerName
                    }
                }
            }).then(function(res) {
                if(res.re==1){

                    var myPopup = $ionicPopup.show({
                        template:'绑定车辆成功',
                        title: '信息',
                        scope: $scope,

                    });

                    myPopup.then(function(res) {
                        if(res){
                            $state.go('car_manage');
                        }

                    });

                }else{
                    $ionicPopup.alert({
                        title: '错误',
                        template: '绑定车辆失败'
                    });

                }
            })







        }



    })
