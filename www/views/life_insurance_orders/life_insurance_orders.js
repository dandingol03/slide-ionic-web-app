angular.module('starter')

/**
 * 本页面不开启缓存
 */
  .controller('lifeInsuranceOrdersController',function($scope,$state,$http,
                                                       $location,$rootScope,$stateParams,
                                                       $ionicPopup,Proxy,$ionicLoading,$ionicHistory){

      if($rootScope.flags.lifeOrders.clear==true){
          $ionicHistory.clearHistory();
          $ionicHistory.clearCache();
          $rootScope.flags.lifeOrders.clear==false;
      }

    $scope.changedState= false;

      //tabIndex选定
      if($stateParams.tabIndex!==undefined&&$stateParams.tabIndex!==null&&$stateParams.tabIndex!='')
          $scope.tabIndex = parseInt($stateParams.tabIndex);
      else
      {
          $scope.tabIndex=1;
      }

      //TODO:life_orders_tabIndex
      if($rootScope.life_orders_tabIndex!==undefined&&$rootScope.life_orders_tabIndex!==null)
      {
          $scope.tabIndex=$rootScope.life_orders_tabIndex;
      }

      $scope.go_back=function(){
          if($ionicHistory.backView())
          {
              window.history.back();
          }else{
              $state.go('tabs.my');
          }
      }

      $scope.tab_change=function(i){
          $scope.tabIndex=i;
      }

      $scope.orders=[];
      $scope.pricingOrders=[];
      $scope.appliedOrders=[];
      $scope.finishOrders=[];
      $scope.plans=[];

      $scope.appliedOrders=[];



      if($rootScope.flags.lifeOrders.onFresh)
      {
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
                          // order.applyTime = date.getFullYear().toString() + '-'
                          //     + date.getMonth().toString() + '-' + date.getDate().toString();

                          if (order.orderState == 3) {
                              $scope.pricingOrders.push(order);
                          }
                          if (order.orderState == 5) {
                              $scope.finishOrders.push(order);
                          }
                          if (order.orderState == 1||order.orderState == 2) {
                              $scope.appliedOrders.push(order);
                          }


                      })
                  }
                  $rootScope.lifeInsurance.pricingOrders = $scope.pricingOrders;
                  $rootScope.lifeInsurance.finishOrders = $scope.finishOrders;
                  $rootScope.lifeInsurance.appliedOrders = $scope.appliedOrders;
              }

          }).catch(function (err) {
              var str='';
              for(var field in err)
                  str+=err[field];
              console.error('err='+str);
              $ionicLoading.hide();
          })

      }else{
          if($rootScope.lifeInsurance!==undefined&&$rootScope.lifeInsurance!==null)
          {

              $scope.orders = $rootScope.lifeInsurance.orders;
              $scope.pricingOrders = $rootScope.lifeInsurance.pricingOrders;
              $scope.finishOrders = $rootScope.lifeInsurance.finishOrders;
              $scope.appliedOrders = $rootScope.lifeInsurance.appliedOrders;
                //同布寿险plan
                if($rootScope.lifeInsurance.plans!==undefined&&$rootScope.lifeInsurance.plans!==null)
                {
                    var plans=$rootScope.lifeInsurance.plans;
                    plans.map(function (plan, i){
                        if(plan.modified==true&&plan.checked==true){
                            $scope.changedState=true;
                        }
                    });
                }
          }
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

      }

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



    //提交已选方案
    $scope.apply=function() {
      var plans = [];
      var planIds = [];
      var flag = false;
      $scope.plans.map(function (plan, i) {
        if (plan.checked == true) {
          plans.push(plan);
          planIds.push(plan.planId);
          if (plan.modified == true)
            flag = true;
        }
      });
      //如果已经进行修改
      if (flag == true) {
        $http({
          method: "POST",
          url: Proxy.local()+"/svr/request",
          headers: {
            'Authorization': "Bearer " + $rootScope.access_token
          },
          data:
          {
            request:'userUpdateLifeOrder',
            info:{
              orderId:1,
              plans:plans
            }
          }
        }).then(function(res) {
          var json=res.data;
          console.log('...');
        }).catch(function(err) {
          var str='';
          for(var field in err)
            str+=err[field];
          console.error('error=\r\n' + str);
        });
      }else {//如果未产生如何改动

        $http({
          method: "POST",
          url: Proxy.local()+"/svr/request",
          headers: {
            'Authorization': "Bearer " + $rootScope.access_token
          },
          data: {
            request: 'userApplyUnchangedLifeOrder',
            info: {
              orderId: 1,
              planIds: planIds
            }
          }
        }).then(function (json) {
          if (json.re == 1) {
            //TODO:取消保存的寿险方案列表,从服务器获取寿险方案列表时匹配userSelect字段
            var alertPopup = $ionicPopup.alert({
              title: '修改方案已提交',
              template: '等待后台工作人员重新报价'
            });


          }
        }).catch(function (err) {
          var str = '';
          for (var field in err)
            str += err[field];
          console.error('error=\r\n' + str);
        });
      }

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
