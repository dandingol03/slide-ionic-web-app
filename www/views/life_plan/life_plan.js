/**
 * Created by yiming on 16/10/15.
 */
angular.module('starter')

/**
 * 本页面不开启缓存
 */
  .controller('lifePlanController',function($scope,$state,$http,$ionicNativeTransitions,
                                                       $location,$rootScope,$stateParams,
                                                       $ionicPopup,Proxy){

    $scope.order = $rootScope.lifeInsuranceOrder;
    $scope.modifiedFlag = $rootScope.modifiedFlag;


    //评价方案
    var plans=[];
    var data=$scope.order.plans;
    if(data!==undefined&&data!==null)
    {
        data.map(function(plan,i) {
            var main=null;
            var additions=[];
            plan.items.map(function(proj,j) {
                if(proj.product.ownerId!==undefined&&proj.product.ownerId!==null)
                    additions.push(proj);
                else
                    main=proj;
            })
            plan.main=main;
            plan.additions=additions;
            plans.push(plan);
        });
    }
    $scope.plans=plans;

    $scope.changedState= false;


    //修改状态的初始化
    if($rootScope.lifeInsurance!==undefined&&$rootScope.lifeInsurance!==null
      &&$rootScope.lifeInsurance.plans!==undefined&&$rootScope.lifeInsurance.plans!==null)
    {
      var plans=$rootScope.lifeInsurance.plans;
      plans.map(function (plan, i){
        if(plan.modified==true&plan.checked==true){
          $scope.changedState=true;
        }
      });
    }


    $scope.go_back=function(){
        $rootScope.life_orders_tabIndex=1;
        $ionicNativeTransitions.stateGo('life_insurance_orders', {}, {}, {
            "type": "slide",
            "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
            "duration": 240, // in milliseconds (ms), default 400
        });
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




    $scope.goDetail=function(plan){
      $state.go('lifePlanDetail',{plan:JSON.stringify(plan)});
      $rootScope.plan=plan;
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

      $http({
        method: "POST",
        url: Proxy.local() + '/svr/request',
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token
        },
        data: {
          request: 'commitLifePlan',
          info:{
            planIds:planIds,
            orderId:$scope.order.orderId
          }

        }
      }).then(function(res) {
        var json = res.data;
        if(json.re==1){
          alert('应该进入寿险支付页面');
          var info = {insurerId:$scope.order.insurerId,planIds: planIds,orderId: $scope.order.orderId}
          $state.go('life_order_pay', {info: JSON.stringify(info)});
        }


      })

    }



  });
