/**
 * Created by yiming on 16/10/15.
 */
angular.module('starter')

/**
 * 本页面不开启缓存
 */
  .controller('carOrderPricesController',function($scope,$state,$http,
                                            $location,$rootScope,$stateParams,
                                            Proxy,$ionicModal,$ionicLoading,$ionicPopup,
                                                  $ionicNativeTransitions){

    $scope.insuranceder={};

    $scope.order=$stateParams.order;

    if(Object.prototype.toString.call($scope.order)=='[object String]')
      $scope.order=JSON.parse($scope.order);


    //不能在基于orderState划分



    if($scope.order.orderState==2) {
        $scope.getOrder = function () {
            $ionicLoading.show({
                template: '<p class="item-icon-left">拉取车险订单数据...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
            });
            //获取该订单的所有选中公司和产品
            $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data: {
                    request: 'getApplyedCarOrderByOrderId',
                    info: {
                        orderId: $scope.order.orderId
                    }
                }
            }).then(function (res) {
                var json = res.data;
                if (json.re == 1) {
                    $scope.order = json.data;

                }
                $ionicLoading.hide();
            }).catch(function (err) {
                var str = '';
                for (var field in err)
                    str += err[field];
                console.error('err=r\r\n' + str);
                $ionicLoading.hide();
            });

        }
        $scope.getOrder();
    }


      //对于订单，如果已有公司报价完成。则进行报价的显示
      if($scope.order.prices!==undefined&&$scope.order.prices!==null&&$scope.order.pricedCount>0){

          $scope.order.prices.map(function (price, i) {
              price.insuranceFeeTotal=parseFloat(price.contractFee.toFixed(2));
              if(price.carTax!==undefined&&price.carTax!==null)
                  price.insuranceFeeTotal+=price.carTax;
          });
          if($scope.order.prices.length==1)
          {
              $scope.priceIndex=0;
              $scope.order.prices[0].checked=true;
          }
      }

      //如果用户已确认
      if($scope.order.confirmed==true){

          $scope.confirmedPrice = null;
          $scope.order.prices.map(function (price, i) {

              price.insuranceFeeTotal=parseFloat(price.contractFee.toFixed(2));
              if(price.carTax!==undefined&&price.carTax!==null)
                  price.insuranceFeeTotal+=price.carTax;

              if(price.isConfirm==1){
                  $scope.confirmedPrice = price;
                  $scope.confirmedPrice.checked = true;
              }
          });
          if($scope.order.prices.length==1)
          {
              $scope.priceIndex=0;
              $scope.order.prices[0].checked=true;
          }


      }





      $scope.go_back=function(){
          $ionicNativeTransitions.stateGo('car_orders', {}, {}, {
              "type": "slide",
              "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
              "duration": 240, // in milliseconds (ms), default 400
          });
      }

    $scope.tab_change=function(i){
      $scope.tabIndex=i;
    }

    $scope.goDetail=function(price){
        $state.go('car_price_detail',{info:JSON.stringify({price:price,order:$scope.order})});
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

    $scope.Mutex=function(item,field,cluster) {
      if(item[field])
      {
        item[field]=false;
      }
      else{
        item[field]=true;
        cluster.map(function(cell,i) {
          if(cell.carNum!=item.carNum)
            cell[field]=false;
        })
      }
    };

    /*** bind select_relative modal ***/
    $ionicModal.fromTemplateUrl('views/modal/select_relative.html',{
      scope:  $scope,
      animation: 'animated '+' bounceInUp',
      hideDelay:920
    }).then(function(modal) {
      $scope.select_relative={
        modal:modal
      }
    });

    $scope.open_selectRelativeModal= function(field){
      $scope.select_relative.modal.show();
      $scope.select_relative.field=field;
    };

    $scope.close_selectRelativeModal= function(cluster) {
      if(cluster!==undefined&&cluster!==null)
      {
        cluster.map(function(singleton,i) {
          if(singleton.checked==true)
          {
            $scope[$scope.select_relative.field]=singleton;
          }
        })
      }
      $scope.select_relative.modal.hide();
    };
    /*** bind select_relative modal ***/


    /*** bind apeend_carOrderPerson_modal***/
    $ionicModal.fromTemplateUrl('views/modal/append_carOrder_person.html',{
      scope:  $scope,
      animation: 'animated '+' bounceInUp',
      hideDelay:920
    }).then(function(modal) {
      $scope.append_carOrderPerson_modal = modal;
    });

    $scope.open_appendCarOrderModal= function(){
      $scope.append_carOrderPerson_modal.show();
    };

    $scope.close_appendCarOrderModal= function() {
      $scope.append_carOrderPerson_modal.hide();
    };
    /*** bind apeend_carOrderPerson_modal ***/


    //提交车险方案
    $scope.applyCarPrice=function(){
        var selected_price = null;
        var order = $scope.order;
        order.prices.map(function (price, i) {
            if (price.checked == true)
                selected_price = price;
        });

        if(selected_price==null)
        {
            $ionicPopup.alert({
                title: '错误',
                template: '请至少选择一个报价方案后再点击提交'
            });
        }else{
            $state.go('car_order_pay',{info:JSON.stringify({order:order,price:selected_price})});
        }
    }


    //提交车险方案
    $scope.apply=function() {
      var selected_price = null;
      var order = $scope.order;
      order.prices.map(function (price, i) {
        if (price.checked == true)
          selected_price = price;
      });

      //TODO:绑定投保人
           $http({
            method: "POST",
            url: Proxy.local() + "/svr/request",
            headers: {
              'Authorization': "Bearer " + $rootScope.access_token
            },
            data: {
              request: 'applyCarOrderPrice',
              info: {
                price: selected_price
              }
            }


      }).then(function (res) {
        var json = res.data;
        if (json.re == 1) {
          alert("dicount="+selected_price.discount);
          return $http({
            method: "POST",
            url: Proxy.local() + "/svr/request",
            headers: {
              'Authorization': "Bearer " + $rootScope.access_token
            },
            data: {
              request: 'updateInsuranceCarOrder',
              info: {
                orderId:$scope.order.orderId,
                fields:{
                  insurerId:19,
                  companyId:selected_price.companyId,
                  discount:selected_price.discount,
                  benefit:selected_price.benefit,
                  insuranceFeeTotal:selected_price.insuranceFeeTotal,
                  contractFee:selected_price.contractFee,
                  commission:selected_price.commission,
                  score:selected_price.score,
                  exchangeMoney:selected_price.exchangeMoney,
                  orderDate:new Date()
                }
              }
            }
          });

        }
      }).then(function(res) {
        var json=res.data;
        if(json.re==1) {
          $state.go('tabs.dashboard');
        }
      }).catch(function (err) {
        var str = '';
        for (var field in err)
          str += err[field];
        console.error('erro=\r\n' + str);
      });

    }


    //加入修改屏蔽标志
      if($rootScope.carOrdermodify&&$rootScope.carOrderModify.flag==true)
          $scope.haveModifyOrder=true;
      else
          $scope.haveModifyOrder=false;

    //重选套餐
    $scope.reset_specials=function(){

        if($scope.haveModifyOrder==false)
        {
            $rootScope.Insurance={};
            var carOrderState = 0;

            $http({
                method: "POST",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data:
                    {
                        request:'updateCarOrderState',
                        info:{
                            orderState:carOrderState,
                            orderId:$scope.order.orderId
                        }
                    }
            }).then(function(res) {
                if(res.data.re==1){
                    $rootScope.carOrderModify={orderId:$scope.order.orderId,carId:$scope.order.carId,flag:true};
                    $state.go('car_insurance');
                }
            })
        }else{}
    }

      $scope.checkedStyle={position: 'absolute',top:'12%',left:'4%','z-index': 1000,'font-size': '0.8em',color:'#222',
          border:'1px solid #ff3b30','border-radius': '12px',padding: '4px 25px'};
      $scope.uncheckedStyle={position: 'absolute',top:'12%',left:'4%','z-index': 1000,'font-size': '0.8em',color:'#222',
          border:'1px solid #aaa','border-radius': '12px',padding: '4px 25px'};


  });

