/**
 * Created by apple-2 on 16/9/1.
 */
angular.module('starter')
    .controller('carPriceDetailController',function($scope,$rootScope,$state,$http,
                                                    $location,$ionicModal,$ionicActionSheet,
                                                    $cordovaCamera,$cordovaImagePicker,$stateParams,
                                                    $ionicSlideBoxDelegate,$ionicPopup,Proxy){


        $scope.price=$rootScope.price;

        if(Object.prototype.toString.call($scope.price)=='[object String]')
            $scope.price=JSON.parse($scope.price);

        $scope.backup=$scope.price;



        $scope.go_back=function(){
            window.history.back();
            $rootScope.tab=$scope.tab;
        }




    });
