angular.module('starter')

  .controller('carOrdersController',function($scope,$state,$http,
                                             $location, $rootScope,Proxy,
                                             $ionicLoading){


      $scope.getOrders=function () {

          $ionicLoading.show({
              template:'<p class="item-icon-left">拉取车险订单数据...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
          });

          //获取已完成订单,估价列表
          $http({
              method: "POST",
              url: Proxy.local()+"/svr/request",
              headers: {
                  'Authorization': "Bearer " + $rootScope.access_token
              },
              data:
                  {
                      request:'getCarOrdersInHistory'
                  }
          }).then(function(res) {
              var json=res.data;
              if(json.re==1) {
                  $scope.historyOrders=json.data;
              }
            return   $http({
                  method: "POST",
                  url: Proxy.local()+"/svr/request",
                  headers: {
                      'Authorization': "Bearer " + $rootScope.access_token
                  },
                  data:
                      {
                          request:'getCarOrderInPricedState'
                      }
              });
          }).then(function(res) {
              var json=res.data;
              if(json.re==1) {
                  $scope.orderPricedList=json.data;
                  if($scope.orderPricedList!==undefined&&$scope.orderPricedList!==null)
                  {}
              }
              return  $http({
                  method: "POST",
                  url: Proxy.local()+"/svr/request",
                  headers: {
                      'Authorization': "Bearer " + $rootScope.access_token
                  },
                  data:
                      {
                          request:'getApplyedCarOrders'
                      }
              });
          }).then(function(res) {
              var json=res.data;
              if(json.re==1) {
                  $scope.applyedList=json.data;
              }
              $ionicLoading.hide();
          }).catch(function(err) {
              var str='';
              for(var field in err)
                  str+=err[field];
              console.error('err=\r\n'+str);
              $ionicLoading.hide();
          });
      }

      $scope.getOrders();









    //车险订单  0.已完成;1.估价列表;2.已申请
    $scope.tabIndex=$rootScope.car_orders_tabIndex;

    $scope.priceIndex=-1;


    $scope.orders=$rootScope.car_orders;

    $scope.prices=$rootScope.car_insurance.prices;


    $scope.goto=function(url){
      $location.path(url);
    };

    $scope.go_back=function(){
      window.history.back();
    }

    $scope.tab_change=function(i)
    {
      $scope.tabIndex=i;
    }

    $scope.setDetail=function(item){
      if(item.detail!=true)
        item.detail=true;
      else
        item.detail=false;
    }

    $scope.toggle=function(item,field)
    {
      if(item[field]!=true)
        item[field]=true;
      else
        item[field]=false;
    }

    $scope.setterPrice=function(i,item) {
      if($scope.priceIndex==i)
      {
        $scope.priceIndex=-1;
        item.checked=null;
      }
      else
      {
        $scope.priceIndex=i;
        item.checked=true;
      }
    };

    //订单详情
    $scope.goDetail=function(order)
    {
      $state.go('car_order_detail',{order:JSON.stringify(order)});
    }

    //估价列表详情
    $scope.goOrderPrices=function(order){
      $state.go('car_order_prices', {order: JSON.stringify(order)});
    }

    $scope.goAppliedOrderDetail=function(order)
    {
        $state.go('applied_car_order_detail',{orderId:order.orderId});
    }



    //提交已选方案
    $scope.apply=function(){
      var selected_price=null;

        $scope.orderPricedList.map(function(order) {
        order.prices.map(function(price,i) {
          if(price.checked==true)
            selected_price=price;
        });
      });

      $http({
        method: "POST",
        url: Proxy.local()+"/svr/request",
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token
        },
        data:
        {
          request:'applyCarOrderPrice',
          info:{
            price:selected_price
          }
        }
      }).then(function(res) {
        var json=res.data;
        if(json.re==1) {

        }
      }).catch(function(err) {
        var str='';
        for(var field in err)
          str+=err[field];
        console.error('error=\r\n' + str);
      })
    }



  });
