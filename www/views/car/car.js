/**
 * Created by dingyiming on 2016/12/7.
 */
angular.module('starter')
    .controller('carController',function($scope,$state,$stateParams,$rootScope,$http,Proxy){

        $scope.goto=function(url){
            $state.go(url);
        };

        $scope.go_back=function(){
            window.history.back();
        }

        //车辆信息
        $scope.carInfo= {};

        //同步车辆信息
        if($rootScope.carInfo!==undefined&&$rootScope.carInfo!==null)
        {
            var carInfo=$rootScope.carInfo;
            $http({
                method: "POST",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data:
                    {
                        request:'validateCarFree',
                        info:{
                            carId:carInfo.carId
                        }
                    }
            }).then(function(res) {
                var json=res.data;
                if(json.data==true)
                    $scope.carInfo=$rootScope.carInfo;
            })
        }else{

        }


        $scope.select_type=function(){
            //TODO:validat
            if($rootScope.carInfo!==undefined&&$rootScope.carInfo!==null)
                $state.go('car_insurance',{carInfo:JSON.stringify($scope.carInfo)});
            else{
                var confirmPopup = $ionicPopup.confirm({
                    title: '信息',
                    template: '请先选择车辆!'
                });

                confirmPopup.then(function(res) {
                    if(res) {
                        $state.go('car_manage');
                    } else {
                        console.log('You are not sure');
                    }
                });

            }
        }





    })