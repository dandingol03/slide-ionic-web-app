/**
 * Created by yiming on 16/10/5.
 */
angular.module('starter')

  .controller('serviceOrdersController',function($scope,$state,$http, $location,
                                                 $rootScope,Proxy,$ionicLoading){

    $scope.tabIndex=0;

    $scope.goto=function(url){
      $location.path(url);
    };


      $scope.go_back=function(){
          window.history.back();
      }

    $scope.tab_change=function(i)
    {
      $scope.tabIndex=i;
    };

    $scope.orders1 = [];
    $scope.orders2 = [];
    $scope.orders3 = [];


      $scope.selectedTabStyle={
          display: 'table',width: '100%',height:'100%',position: 'relative',
          'text-align': 'center',border: '1px solid #fff9df','border-bottom':'0px',background:'cadetblue'
      };

      $scope.unSelectedTabStyle={
          display: 'table',width: '100%',height:'100%',
          'text-align': 'center',border: '1px solid rgba(255, 249, 223, 0.32)','border-bottom':'0px',background:'rgba(95, 158, 160, 0.39)'
      }


    $scope.serviceTypeMap={11:'维修-日常保养',12:'维修-故障维修',13:'维修-事故维修',
      21:'车驾管-审车',22:'车驾管-审证',23:'车驾管-接送机',24:'车驾管-取送车',
      31:'鈑喷'};

    $scope.subServiceTypeMap={1:'机油,机滤',2:'检查制动系统,更换刹车片',3:'雨刷片更换',
      4:'轮胎更换',5:'燃油添加剂',6:'空气滤清器',7:'检查火花塞',8:'检查驱动皮带',9:'更换空调滤芯',10:'更换蓄电池,防冻液'};


    $scope.fetchServiceOrders=function () {
          $http({
              method: "post",
              url: Proxy.local()+"/svr/request",
              headers: {
                  'Authorization': "Bearer " + $rootScope.access_token,
              },
              data:
                  {
                      request:'fetchServiceOrderByCustomerId',
                  }
          }).then(function (res) {
              $ionicLoading.hide();
              var json=res.data;
              if(json.re==1)
                  $scope.orders=json.data;
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
          }).catch(function(err) {
              var str='';
              for(var field in err)
                  str+=err[field];
              console.error('error=\r\n'+str);
              $ionicLoading.hide();
          })
      }



      if($scope.orders!==undefined&&$scope.orders!==null&&$scope.orders.length>0) {
      }else{
          $ionicLoading.show({
              template:'<p class="item-icon-left">Loading...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
          });
          $scope.fetchServiceOrders();
      }




    $scope.showOrderDetail=function(order){
      $state.go('service_order_detail',{order:JSON.stringify(order)});
    }


  });
