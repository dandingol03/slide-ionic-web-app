/**
 * Created by yiming on 16/11/16.
 */
angular.module('starter')
    .controller('carInfoDetailController',function($scope,$state,$stateParams,$ionicLoading,
                                                    $ionicPopup,$http,Proxy,$rootScope){

        if($stateParams.carInfo!==undefined&&$stateParams.carInfo!==null)
        {
            $scope.carInfo=$stateParams.carInfo;
            if(Object.prototype.toString.call($scope.carInfo)=='[object String]')
                $scope.carInfo=JSON.parse($scope.carInfo);

        }



        $scope.verifyCarOwnerPriority=function () {

            $ionicLoading.show({
                template: '<p class="item-icon-left">拉取车辆信息...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
            });

            $http({
                method: "POST",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data:
                    {
                        request:'verifyCarOwnerPriority',
                        info:{
                            ownerIdCard:$scope.carInfo.ownerIdCard
                        }
                    }
            }).then(function (res) {
                var json=res.data;
                if(json.re==1) {
                    if(json.data==true) {
                        $scope.priority='highest';
                    }else{
                        $scope.priority='standard';
                    }
                }else{
                    $ionicPopup.alert({
                        title: '错误',
                        template: '车主身份证号码无效'
                    });
                }
                $ionicLoading.hide();
            }).catch(function (err) {
                var str='';
                for(var field in err)
                    str+=err[field];
                console.error('err=\r\n'+str);
                $ionicLoading.hide();
            })
        }
        if($scope.carInfo.ownerIdCard!==undefined&&$scope.carInfo.ownerIdCard!==null)
        {
            $scope.verifyCarOwnerPriority();
        }

        $scope.go_back=function () {
            window.history.back();
        }

        $scope.go_to=function (url) {
            $state.go(url);
        }



    })
