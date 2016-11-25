/**
 * Created by yiming on 16/11/16.
 */
angular.module('starter')
    .controller('carInfoDetailController',function($scope,$state,$stateParams){

        if($stateParams.carInfo!==undefined&&$stateParams.carInfo!==null)
        {
            $scope.carInfo=$stateParams.carInfo;
            if(Object.prototype.toString.call($scope.carInfo)=='[object String]')
                $scope.carInfo=JSON.parse($scope.carInfo);

        }

        $scope.go_back=function () {
            window.history.back();
        }

        $scope.go_to=function (url) {
            $state.go(url);
        }



    })
