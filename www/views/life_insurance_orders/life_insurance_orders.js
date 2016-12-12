angular.module('starter')

/**
 * 本页面不开启缓存
 */
  .controller('lifeInsuranceOrdersController',function($scope,$state,$http,
                                                       $location,$rootScope,$stateParams,
                                                       $ionicPopup,Proxy,$ionicLoading){

    $scope.changedState= false;

    if($rootScope.lifeInsurance!==undefined&&$rootScope.lifeInsurance!==null
      &&$rootScope.lifeInsurance.plans!==undefined&&$rootScope.lifeInsurance.plans!==null)
    {
      var plans=$rootScope.lifeInsurance.plans;
      plans.map(function (plan, i){
          if(plan.modified==true&&plan.checked==true){
          $scope.changedState=true;
        }
      });
    }

      //tabIndex选定
      if($stateParams.tabIndex!==undefined&&$stateParams.tabIndex!==null&&$stateParams.tabIndex!='')
          $scope.tabIndex = parseInt($stateParams.tabIndex);
      else
      {
          $scope.tabIndex=1;
      }

      // //TODO:life_orders_tabIndex
      // if($rootScope.life_orders_tabIndex!==undefined&&$rootScope.life_orders_tabIndex!==null)
      // {
      //     $scope.tabIndex=$rootScope.life_orders_tabIndex;
      // }

      $scope.go_back=function(){
        window.history.back();
      }

      $scope.tab_change=function(i){
        $scope.tabIndex=i;
      }

    $scope.toggle=function (item,field) {
      if(item[field]!=true)//勾选
      {
        item[field]=true;
        if(field=='checked')
        {
          $scope.changedState=true;
        }
      }
      else
      {
        item[field]=false;
        if(field=='checked')
        {
          var flag=false;
          $scope.plans.map(function(plan,i) {
            if(plan.checked==true&&plan.modified==true)
            flag=true;
          });
          if(!flag)
            $scope.changedState=false;
        }
      }

    }

    $scope.orders=[];
    $scope.pricingOrders=[];
    $scope.appliedOrders=[];
    $scope.finishOrders=[];
    $scope.plans=[];

    $scope.goDetail=function(order){
        if(order.plans!==undefined&&order.plans!==null)
        {
            $state.go('life_plan',{order:JSON.stringify(order)});
            $rootScope.lifeInsuranceOrder=order;
        }else{
            var alertPopup = $ionicPopup.alert({
                title: '信息',
                template: '该订单没有估价方案'
            });
        }
    }

    $scope.goAppliedLifeOrderDetail=function (order) {
        $state.go('applied_life_order_detail',{orderId:order.orderId});
    }


    //同步时机存在问题
    //获取寿险订单
    if($rootScope.lifeInsurance!==undefined&&$rootScope.lifeInsurance!==null)
    {
      $scope.orders = $rootScope.lifeInsurance.orders;
      $scope.pricingOrders = $rootScope.lifeInsurance.pricingOrders;
      $scope.finishOrders = $rootScope.lifeInsurance.finishOrders;
      $scope.appliedOrders = $rootScope.lifeInsurance.appliedOrders;

    }else{
        $ionicLoading.show({
            template:'<p class="item-icon-left">拉取寿险订单数据...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
        });

      $http({
        method: "POST",
        url: Proxy.local()+'/svr/request',
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token
        },
        data:
        {
          request:'getLifeOrders'
        }
      }).then(function(res) {

          $ionicLoading.hide();

          var json = res.data;
          if (json.re == 1) {
              $scope.orders = json.data;
              if ($rootScope.lifeInsurance == undefined || $rootScope.lifeInsurance == null)
                  $rootScope.lifeInsurance = {};
              $rootScope.lifeInsurance.orders = $scope.orders;
              if ($scope.orders !== undefined && $scope.orders !== null && $scope.orders.length > 0) {
                  $scope.orders.map(function (order, i) {

                      var date = new Date(order.applyTime);

                      if (order.orderState == 3||order.orderState == 2) {
                          $scope.pricingOrders.push(order);
                      }
                      if (order.orderState == 5) {
                          $scope.finishOrders.push(order);
                      }
                      if (order.orderState == 1) {
                          $scope.appliedOrders.push(order);
                      }

                  })
              }
              $rootScope.lifeInsurance.pricingOrders = $scope.pricingOrders;
              $rootScope.lifeInsurance.finishOrders = $scope.finishOrders;
              $rootScope.lifeInsurance.appliedOrders = $scope.appliedOrders;
          }

      })

    }

    //获取估价方案
    if($rootScope.lifeInsurance!==undefined&&$rootScope.lifeInsurance!==null
      &&$rootScope.lifeInsurance.plans!==undefined&&$rootScope.lifeInsurance.plans!==null)
    {
      $scope.plans=$rootScope.lifeInsurance.plans;
    }else{}

      $scope.selectedTabStyle=
          {
              display:'inline-block',color:'#fff',width:'31%',float:'left',height:'100%','border': '1px solid','border-color': 'rgb(55, 144, 139)','background-color':'rgb(55, 144, 139)'
          };
      $scope.unSelectedTabStyle=
          {
              display:'inline-block',width:'31%',float:'left',height:'100%','border': '1px solid','border-color': 'rgb(68, 78, 78)'
          };



  });
