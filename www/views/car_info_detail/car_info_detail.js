/**
 * Created by yiming on 16/11/16.
 */
angular.module('starter')
    .controller('carInfoDetailController',function($scope,$state,$stateParams,$ionicLoading,
                                                    $ionicPopup,$http,Proxy,$rootScope,
                                                   $ionicNativeTransitions,$ionicModal,$timeout){


        $scope.go_back=function () {
            $ionicNativeTransitions.stateGo('car_manage', {}, {}, {
                "type": "slide",
                "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
                "duration": 300, // in milliseconds (ms), default 400
            });
        }

        if($stateParams.carInfo!==undefined&&$stateParams.carInfo!==null)
        {
            $scope.carInfo=$stateParams.carInfo;
            if(Object.prototype.toString.call($scope.carInfo)=='[object String]')
                $scope.carInfo=JSON.parse($scope.carInfo);

        }


        $scope.priority='highest';


        // $scope.verifyCarOwnerPriority=function () {
        //
        //     $ionicLoading.show({
        //         template: '<p class="item-icon-left">拉取车辆信息...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
        //     });
        //
        //     $http({
        //         method: "POST",
        //         url: Proxy.local()+"/svr/request",
        //         headers: {
        //             'Authorization': "Bearer " + $rootScope.access_token
        //         },
        //         data:
        //             {
        //                 request:'verifyCarOwnerPriority',
        //                 info:{
        //                     ownerIdCard:$scope.carInfo.ownerIdCard,
        //                     carId:$scope.carInfo.carId
        //                 }
        //             }
        //     }).then(function (res) {
        //         var json=res.data;
        //         if(json.re==1) {
        //             if(json.data==true) {
        //                 $scope.priority='highest';
        //             }else{
        //                 $scope.priority='standard';
        //             }
        //         }else{
        //             $ionicPopup.alert({
        //                 title: '错误',
        //                 template: '车主身份证号码无效'
        //             });
        //         }
        //         $ionicLoading.hide();
        //     }).catch(function (err) {
        //         var str='';
        //         for(var field in err)
        //             str+=err[field];
        //         console.error('err=\r\n'+str);
        //         $ionicLoading.hide();
        //     })
        // }
        // if($scope.carInfo.ownerIdCard!==undefined&&$scope.carInfo.ownerIdCard!==null)
        // {
        //     $scope.verifyCarOwnerPriority();
        // }


        $scope.postCarInfo=function () {

            $ionicLoading.show({
                template: '<p class="item-icon-left">保存车辆信息...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
            });

            $http({
                method: "POST",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data:
                    {
                        request:'uploadCarAndOwnerInfo',
                        info:$scope.carInfo
                    }
            }).then(function (res) {
                var json=res.data;
                if(json.re==1)
                {
                    $ionicLoading.hide();
                    $timeout(function () {
                        $ionicPopup.alert({
                            title: '信息',
                            template: '车辆信息保存成功'
                        });
                    },1000);
                }

            }).catch(function (err) {
                $ionicLoading.hide();
                alert(err);
            })

        }

        /*** bind car_info_edit_modal***/
        $ionicModal.fromTemplateUrl('views/modal/license_info_modal.html',{
            scope:  $scope,
            animation: 'animated '+' bounceInUp',
            hideDelay:920
        }).then(function(modal) {
            $scope.edit_info_modal = modal;
        });

        $scope.open_licenseInfoModal= function(){
            $scope.edit_info_modal.show();
        };

        $scope.close_licenseInfoModal= function() {
            $scope.edit_info_modal.hide();

            $scope.postCarInfo();

        };
        /*** bind car_info_edit_modal ***/



        $scope.go_to=function (url) {
            $state.go(url);
        }



    })
