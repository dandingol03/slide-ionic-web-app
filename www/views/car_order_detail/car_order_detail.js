angular.module('starter')

  .controller('carOrderDetailController',function($scope,$state,$http, $location,$rootScope,$stateParams){

      //车险订单  0.报价中;1.已生成;2.待支付
      $scope.order=$stateParams.order;

      if(Object.prototype.toString.call($scope.order)=='[object String]')
        $scope.order=JSON.parse($scope.order);

      $scope.goto=function(url){
          $location.path(url);
      };

      $scope.go_back=function(){
          window.history.back();
      }




  });
