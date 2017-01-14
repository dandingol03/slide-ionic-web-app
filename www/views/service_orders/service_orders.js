/**
 * Created by yiming on 16/10/5.
 */
angular.module('starter')

  .controller('serviceOrdersController',function($scope,$state,$http, $location,
                                                 $rootScope,Proxy,$ionicLoading,
                                                 $ionicHistory,$ionicPopup,$ionicNativeTransitions){


      if($rootScope.flags.serviceOrders.clear==true){
          $ionicHistory.clearHistory();
          $rootScope.flags.serviceOrders.clear=false;
      }


      if($rootScope.flags.serviceOrders.tabIndex!==undefined&&$rootScope.flags.serviceOrders.tabIndex!==null)
            $scope.tabIndex=$rootScope.flags.serviceOrders.tabIndex;
      else
          $scope.tabIndex=0;


      var screenHeight=window.screen.height;

      $scope.orderRemain={width:'100%',height:(screenHeight-140)+'px'};


      $scope.goto=function(url){
          $location.path(url);
      };


      $scope.goBack=function(){
          $ionicNativeTransitions.stateGo('tabs.my', {}, {}, {
              "type": "slide",
              "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
              "duration": 240, // in milliseconds (ms), default 400
          });
      }

    $scope.tab_change=function(i)
    {
      $scope.tabIndex=i;
    };

      $scope.selectedTabStyle=
          {
              display:'inline-block',color:'#fff',width:'32.4%',float:'left',height:'100%','border': '1px solid','border-color': 'rgb(55, 144, 139)','background-color':'rgb(55, 144, 139)'
          };
      $scope.unSelectedTabStyle=
          {
              display:'inline-block',width:'32.4%',float:'left',height:'100%','border': '1px solid','border-color': 'rgb(68, 78, 78)'
          };



      $scope.serviceTypeMap={11:'维修-日常保养',12:'维修-故障维修',13:'维修-事故维修',
      21:'车驾管-审车',22:'车驾管-审证',23:'车驾管-接送机',24:'车驾管-接送站',
      31:'鈑喷'};

    $scope.subServiceTypeMap={1:'机油,机滤',2:'检查制动系统,更换刹车片',3:'雨刷片更换',
      4:'轮胎更换',5:'燃油添加剂',6:'空气滤清器',7:'检查火花塞',8:'检查驱动皮带',9:'更换空调滤芯',10:'更换蓄电池,防冻液'};


      $scope.orders1 = [];
      $scope.orders2 = [];
      $scope.orders3 = [];


      $scope.fetchServiceOrders=function () {

          $scope.orders1 = [];
          $scope.orders2 = [];
          $scope.orders3 = [];

          $http({
              method: "post",
              url: Proxy.local()+"/svr/request",
              headers: {
                  'Authorization': "Bearer " + $rootScope.access_token,
              },
              data:
                  {
                      request:'fetchServiceOrderByCustomerId',
                  },
              timeout:9000
          }).then(function (res) {
              $ionicLoading.hide();
              var json=res.data;

              if(json.re==1)
              {
                  $scope.orders=json.data;
              }else{
                  $scope.orders=[];
              }
              $rootScope.service_orders=$scope.orders;
              $scope.orders.map(function(order,i) {
                  order.serviceName=$scope.serviceTypeMap[order.serviceType];

                  var subServiceTypes=order.subServiceTypes;
                  var serviceContent='';
                  if(subServiceTypes!==undefined&&subServiceTypes!==null)
                  {
                      var types=subServiceTypes.split(',');
                      types.map(function(type,i) {
                          serviceContent+=$scope.subServiceTypeMap[type];;
                      });
                      order.subServiceContent=serviceContent;
                  }

                  var date=new Date(order.estimateTime);
                  order.time=date.getFullYear().toString()+'-'
                      +date.getMonth().toString()+'-'+date.getDate().toString();
                  if(order.orderState==1)
                      $scope.orders1.push(order);
                  if(order.orderState==2)
                      $scope.orders2.push(order);
                  if(order.orderState==3)
                      $scope.orders3.push(order);

              });
              console.log('success');
              $rootScope.flags.serviceOrders.onFresh=false;
          }).catch(function(err) {
              if(err.status==-1)
              {
                  var alertPopup = $ionicPopup.alert({
                      title: '错误',
                      template: '请求超时，请点击右上方的刷新按钮刷新数据'
                  });
              }else{
                  var str='';
                  for(var field in err)
                      str+=err[field];
                  console.error('error=\r\n'+str);
              }
              $ionicLoading.hide();
          })
      }






          if($rootScope.flags.serviceOrders.onFresh==true){
              $ionicLoading.show({
                  template:'<p class="item-icon-left">Loading...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
              });
              $scope.fetchServiceOrders();
          }else{
              $scope.orders=$rootScope.service_orders;
              if($scope.orders!==undefined&&$scope.orders!==null)
              {
                  $scope.orders.map(function(order,i) {
                      order.serviceName=$scope.serviceTypeMap[order.serviceType];

                      var subServiceTypes=order.subServiceTypes;
                      var serviceContent='';
                      if(subServiceTypes!==undefined&&subServiceTypes!==null)
                      {
                          var types=subServiceTypes.split(',');
                          types.map(function(type,i) {
                              serviceContent+=$scope.subServiceTypeMap[type];;
                          });
                          order.subServiceContent=serviceContent;
                      }

                      var date=new Date(order.estimateTime);
                      order.time=date.getFullYear().toString()+'-'
                          +date.getMonth().toString()+'-'+date.getDate().toString();
                      if(order.orderState==1)
                          $scope.orders1.push(order);
                      if(order.orderState==2)
                          $scope.orders2.push(order);
                      if(order.orderState==3)
                          $scope.orders3.push(order);

                  });
              }
          }



      $scope.evaluate=function () {
          //TODO:go into evaluate page
      }

    $scope.showOrderDetail=function(order){
      $state.go('service_order_detail',{order:JSON.stringify(order)});
    }

    $scope.notFirstRowStyle={
        height: '50px',
        position: 'relative',
        'border-right': '1px solid #ddd',
        'border-left':'1px solid #ddd'
    };
    $scope.firstRowStyle={
        height: '50px',
        position: 'relative',
        'border-right': '1px solid #ddd',
        'border-left':'1px solid #ddd',
        'border-top':'0px'
    };
    $scope.lastRowStyle={
        height: '50px',
        position: 'relative',
        'border-right': '1px solid #ddd',
        'border-left':'1px solid #ddd',
        'border-top':'0px',
        'border-bottom':'1px solid #ddd',
        'margin-bottom':'1px',
        'margin-top':'1px'
    }



  });
