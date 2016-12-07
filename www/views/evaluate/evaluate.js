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

        $scope.setter=function (item,field,val) {


            if(item[field]==true){
                item[field]=val;
            }else{
                item[field]=true;
            }
        }


        })