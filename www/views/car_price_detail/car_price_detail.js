/**
 * Created by apple-2 on 16/9/1.
 * 不区分主险和附加险
 */
angular.module('starter')
    .controller('carPriceDetailController',function($scope,$rootScope,$state,$http,
                                                    $location,$ionicModal,$ionicActionSheet,
                                                    $cordovaCamera,$cordovaImagePicker,$stateParams){



        if($stateParams.info!==undefined&&$stateParams.info!==null)
        {
            var info=$stateParams.info;
            if(Object.prototype.toString.call(info)=='[object String]')
                info=JSON.parse(info);
            $scope.price=info.price;
            $scope.order=info.order;
        }




        if(Object.prototype.toString.call($scope.price)=='[object String]')
            $scope.price=JSON.parse($scope.price);

        $scope.backup=$scope.price;



        $scope.go_back=function(){
            window.history.back();
            $rootScope.tab=$scope.tab;
        }

        $scope.applyCarPrice=function () {
            var selected_price = $scope.price;
            $state.go('car_order_pay',{info:JSON.stringify({order:$scope.order,price:selected_price})});
        }



    });
