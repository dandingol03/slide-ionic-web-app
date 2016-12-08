/**
 * Created by dingyiming on 2016/12/7.
 */
angular.module('starter')
    .controller('manageController',function($scope,$state,$stateParams){

        $scope.go_back=function(){
            window.history.back();
        }

        //选择车驾管服务项目
        $scope.services=["代办车辆年审","代办行驶证年审","接送机","取送车"];

        //审车页面跳转
        $scope.car_registrate=function () {
            //updated by danding
            $state.go('map_administrate_search',{ob:JSON.stringify({carInfo:$scope.carInfo,
                maintain:$scope.maintain})});
        }

        //审证
        $scope.pickPaperValidate=function(locateType) {
            $state.go('map_paperValidate_search',
                {ob:JSON.stringify({carInfo:$scope.carInfo,
                    locateType:locateType})});
            //$state.go('locate_paperValidate_nearby', {locate:JSON.stringify({locateType:locateType,carInfo:$scope.carInfo})});
        }

        //接送机
        $scope.goAirportSearch=function(locateType) {
            $state.go('map_airport_search',
                {ob:JSON.stringify({carInfo:$scope.carInfo,
                    locateType:locateType})});
        }


        //取送车
        $scope.goParkCarSearch=function(locateType) {
            $state.go('map_parkCar_search',
                {ob:JSON.stringify({carInfo:$scope.carInfo,
                    locateType:locateType})});
        }






    })