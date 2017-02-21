angular.module('starter')

  .controller('carOrdersController',function($scope,$state,$http,
                                             $location, $rootScope,Proxy,
                                             $ionicLoading,$ionicHistory,$ionicPlatform){

      if($rootScope.flags.carOrders.clear==true){
          $ionicHistory.clearHistory();
          $ionicHistory.clearCache();
          $rootScope.flags.carOrders.clear==false;
      }

      var deregister = $ionicPlatform.registerBackButtonAction(
          function () {
              console.log("close the popup");
              if($scope.doingGetOrders==true){
                  $ionicLoading.hide();
              }
          }, 505
      );

      $scope.$on('$destroy', deregister)

      $scope.getOrders=function () {

          $ionicLoading.show({
              template:'<p class="item-icon-left">拉取车险订单数据...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
          });

          $scope.doingGetOrders = true;

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
              var json = res.data;
              if (json.re == 1) {
                  json.data.map(function (order, i) {
                      var insuranceFeeTotal=0;
                      insuranceFeeTotal+=order.price.contractFee;
                      if(order.price.carTax!==undefined&&order.price.carTax!==null)
                          insuranceFeeTotal+=order.price.carTax;
                      order.insuranceFeeTotal=insuranceFeeTotal;

                  });
                  $scope.historyOrders = json.data;
                  $rootScope.flags.carOrders.data.historyOrders = json.data;
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

          }).then(function (res) {
              var json=res.data;
              if(json.re==1) {
                  $scope.orderPricedList=json.data;
                  if($scope.orderPricedList==undefined||$scope.orderPricedList==null)
                  {
                      $scope.orderPricedList=[];
                  }
              }


              return $http({
                  method: "POST",
                  url: Proxy.local() + "/svr/request",
                  headers: {
                      'Authorization': "Bearer " + $rootScope.access_token
                  },
                  data: {
                      request: 'getCarOrderInConfirmedState'
                  }
              });



          }).then(function(res) {
              var json=res.data;
              if(json.re==1) {
                  if(json.data!==undefined&&json.data!==null)
                  {
                      $scope.orderPricedList.push(json.data)
                  }
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
              $scope.applyedList = [];
              if(json.re==1) {
                  $scope.orderUnpricedList=[];

                  if(json.data!==undefined&&json.data!==null&&json.data.length>0)
                  {
                      $scope.orderUnpricedList=json.data;
                      $scope.orderUnpricedList.map(function(order,i){
                          if(order.orderState==2){
                              $scope.orderPricedList.push(order);
                          }
                          if(order.orderState==1){
                              $scope.applyedList.push(order);
                          }
                      })
                  }else{}
              }
              $rootScope.flags.carOrders.data.orderPricedList=$scope.orderPricedList;
              $rootScope.flags.carOrders.data.applyedList=$scope.applyedList;
              $rootScope.flags.carOrders.onFresh=false;

              $scope.doingGetOrders = false;
              $ionicLoading.hide();
          }).catch(function(err) {
              var str='';
              for(var field in err)
                  str+=err[field];
              console.error('err=\r\n'+str);
              $scope.doingGetOrders = false;
              $ionicLoading.hide();
              $scope.doingGetOrders=false;
          });
      }


      if($rootScope.flags.carOrders.onFresh==true)
      {
          $scope.getOrders();
      }
      else
      {
          $scope.historyOrders=$rootScope.flags.carOrders.data.historyOrders;
          $scope.orderPricedList=$rootScope.flags.carOrders.data.orderPricedList;
          $scope.applyedList=$rootScope.flags.carOrders.data.applyedList;
      }



      //车险订单  0.已完成;1.估价列表;2.已申请

      //最新改动
      //车险订单 0.已申请;1.估价列表;2.已完成


    $scope.tabIndex=$rootScope.car_orders_tabIndex;

    $scope.priceIndex=-1;


    $scope.orders=$rootScope.car_orders;



    $scope.goto=function(url){
      $location.path(url);
    };

    $scope.go_back=function(){
        if($ionicHistory.backView())
        {
            window.history.back();
        }else{
            $state.go('tabs.my');
        }
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



      $scope.selectedTabStyle=
          {
              display:'inline-block',color:'#fff',width:'31%',float:'left',height:'100%','border': '1px solid','border-color': 'rgba(17, 17, 17, 0.6)','background-color':'rgba(17, 17, 17, 0.6)'
          };
      $scope.unSelectedTabStyle=
          {
              display:'inline-block',width:'31%',float:'left',height:'100%','border': '1px solid','border-color': 'rgba(17, 17, 17, 0.6)'
          };


  });
