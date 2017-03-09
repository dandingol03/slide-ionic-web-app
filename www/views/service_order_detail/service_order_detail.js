/**
 * Created by yiming on 16/10/5.
 */

angular.module('starter')

  .controller('serviceOrderDetailController',function($scope,$stateParams,$http,
                                                      $rootScope,$ionicLoading,Proxy,
                                                        $ionicPopup,$state,$ionicNativeTransitions){

      $scope.serviceTypeMap={11:'维修-日常保养',12:'维修-故障维修',13:'维修-事故维修',
          21:'车驾管-审车',22:'车驾管-审证',23:'车驾管-接送机',24:'车驾管-取送车',
          31:'鈑喷'};

      $scope.subServiceTypeMap={1:'机油,机滤',2:'检查制动系统,更换刹车片',3:'雨刷片更换',
          4:'轮胎更换',5:'燃油添加剂',6:'空气滤清器',7:'检查火花塞',8:'检查驱动皮带',9:'更换空调滤芯',10:'更换蓄电池,防冻液'};



    $scope.order=$stateParams.order;

    if($scope.order!==undefined&&$scope.order!==null&&$scope.order!='')
    {
        if(Object.prototype.toString.call($scope.order)=='[object String]')
        {
            $scope.order = JSON.parse($scope.order);
        }
        if($scope.order.serviceType!==undefined&&$scope.order.serviceType!==null)
        {
            $scope.order.serviceName=$scope.serviceTypeMap[$scope.order.serviceType];
        }
        if($scope.order.subServiceTypes!==undefined&&$scope.order.subServiceTypes!==null)
        {
            if($scope.order.serviceType!='11'&&$scope.order.serviceType!='12'&&$scope.order.serviceType!='13')
            {
                switch($scope.order.serviceType)
                {
                    case '23':
                        if($scope.order.subServiceTypes=='1')
                            $scope.order.subServiceContent='接机';
                        else
                            $scope.order.subServiceContent='送机';
                        break;
                    case '24':
                        if($scope.order.subServiceTypes=='1')
                            $scope.order.subServiceContent='接站';
                        else
                            $scope.order.subServiceContent='送站';
                        break;
                }
            }
        }
    }


    $scope.go_back=function(){
        $ionicNativeTransitions.stateGo('service_orders', {}, {}, {
            "type": "slide",
            "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
            "duration": 240, // in milliseconds (ms), default 400
        });
    };

    $scope.goTo=function (state) {
        if(state=='evaluate')
        {
            $state.go('evaluate', {order: JSON.stringify($scope.order)});
        }else{
            $state.go(state);
        }
    }

    $scope.candidateColors=[{background:'rgb(220, 171, 106)',color:'#fff'},{background:'rgba(220, 171, 106,0.7)',color:'#fff'},
        {background:'rgba(220, 171, 106,0.4)',color:'#fff'},{background:'rgba(220, 171, 106,0.1)',color:'#fff'}];



    $scope.fetchRelativeInfo=function () {
        $ionicLoading.show({
            template: '<p class="item-icon-left">拉取订单数据...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
        });
        //服务人员
        if($scope.order.servicePersonId!==undefined&&$scope.order.servicePersonId!==null)
        {
            $http({
                method: "post",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data:
                    {
                        request:'getInfoPersonInfoByServicePersonId',
                        info:{
                            servicePersonId:$scope.order.servicePersonId
                        }
                    }
            }).then(function (res) {
                var json=res.data;
                if(json.re==1) {
                    $scope.order.servicePerson=json.data;
                }
                $ionicLoading.hide();
            }).catch(function(err) {
                var str='';
                for(var field in err)
                    str+=err[field];
                console.error('err=\r\n'+str);
                $ionicLoading.hide();
            });
        }else{
            //TODO:fetch candidates so far
            $http({
                method: "post",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data:
                    {
                        request:'fetchServiceOrderCandidateByOrderId',
                        info:{
                            orderId:$scope.order.orderId
                        }
                    }
            }).then(function(res) {
                var json=res.data;
                if(json.re==1)
                {
                    $scope.order.candidates=json.data;
                    if($scope.order.candidates!==undefined&&$scope.order.candidates!==null&&$scope.order.candidates.length>0)
                    {
                        $scope.order.candidates[0].checked=true;
                    }
                }
                $ionicLoading.hide();
            }).catch(function (err) {
                var str='';
                for(var field in err)
                    str+=err[field];
                console.error('err=\r\n'+str);
                $ionicLoading.hide();
            });
        }

    }


      $scope.fetchPlaceInfo=function () {

          $http({
              method: "post",
              url: Proxy.local()+"/svr/request",
              headers: {
                  'Authorization': "Bearer " + $rootScope.access_token,
              },
              data:
                  {
                      request:'getServicePlaceNameByPlaceId',
                      info:{
                          type:'place',
                          placeId:$scope.order.servicePlaceId
                      }
                  }
          }).then(function (res) {
              var json=res.data;
              if(json.re==1) {
                  $scope.order.servicePlace=json.data;
              }
          }).catch(function (err) {
              var str='';
              for(var field in err)
                  str+=err[field];
              console.error('err=\r\n'+str);
          })
      }

    //获取相关人员信息
    $scope.fetchRelativeInfo();

    //获取地点信息
      if($scope.order.servicePlaceId!==undefined&&$scope.order.servicePlaceId!==null)
        $scope.fetchPlaceInfo();




      $scope.Setter=function (item,field,value) {
            item[field]=value;
      }

    //同意接单
      $scope.agreeWithCandidate=function () {
          var candidate=null;
          $scope.order.candidates.map(function(people,i) {
              if(people.checked==true)
                  candidate=people;
          });
          if(candidate!=null)
          {
              //TODO:inject sendCustomMessage to servicePerson
              $http({
                  method: "post",
                  url: Proxy.local()+"/svr/request",
                  headers: {
                      'Authorization': "Bearer " + $rootScope.access_token,
                  },
                  data:
                      {
                          request:'applyCarServiceOrderCandidate',
                          info:{
                              candidateId:candidate.candidateId
                          }
                      }
              }).then(function(res) {
                  var json=res.data;
                  if(json.re==1) {

                      return $http({
                          method: "POST",
                          url: Proxy.local() + "/svr/request",
                          headers: {
                              'Authorization': "Bearer " + $rootScope.access_token
                          },
                          data: {
                              request: 'sendCustomMessage',
                              info: {
                                  orderId: $scope.order.orderId,
                                  servicePersonId: candidate.servicePersonId,
                                  type: 'to-servicePerson',
                                  subType:'agreeWithCandidate',
                                  orderNum:$scope.order.orderNum
                              }
                          }
                      });
                  }
              }).then(function (res) {
                  var json=res.data;
                  if(json.re==1) {
                      $rootScope.flags.serviceOrders.clear=true;
                      $rootScope.flags.serviceOrders.onFresh=true;
                      $rootScope.flags.serviceOrders.tabIndex=1;
                      var myPopup = $ionicPopup.alert({
                          template: '接单成功,已通知服务人员',
                          title: '<strong style="color:red">信息</strong>'
                      });
                      myPopup.then(function (res) {

                      });
                  }
              }).catch(function (err) {
                  var str='';
                  for(var field in err)
                      str+=err[field];
                  console.error('err=\r\n'+str);
              })
          }else{
              var myPopup = $ionicPopup.alert({
                  template: '请勾选服务人员后再点击同意',
                  title: '错误'
              });
          }
      }


      //取消订单
      $scope.cancleOrder = function(state){

              //取消"已下单"的订单
              if($scope.order.orderState==1){
                  //指定了服务人员
                  if($scope.order.servicePersonId!=undefined&&$scope.order.servicePersonId!=null) {
                      var date = new Date();
                      $scope.timeDifference = parseInt((new Date($scope.order.estimateTime-date)) /(1000*60*60))
                      if ($scope.timeDifference >= 2) {
                          $http({
                              method: "post",
                              url: Proxy.local() + "/svr/request",
                              headers: {
                                  'Authorization': "Bearer " + $rootScope.access_token,
                              },
                              data: {
                                  request: 'updateServiceOrderState',
                                  info: {
                                      orderState: state,
                                      order: $scope.order,
                                  }
                              }
                          }).then(function (res) {
                              var json=res.data;
                              if(json.re==1) {
                                  var  cancelAlert= $ionicPopup.alert({
                                      template: '订单取消成功',
                                      title: '信息'
                                  });
                                  cancelAlert.then(function (res) {
                                      $rootScope.flags.serviceOrders.clear=true;
                                      $rootScope.flags.serviceOrders.onFresh=true;
                                      $state.go('service_orders');
                                  });
                              }
                          }).catch(function(err) {
                              var str='';
                              for(var field in err)
                                  str+=err[field];
                              console.error('err=\r\n'+str);
                          });

                      }
                      else {
                          alert("距离预约时间不足两小时，无法取消订单！");
                      }
                  }
                  //未指定服务人员
                  else{
                      // 通知 candidate表中的服务人员
                      var date = new Date();
                      $scope.timeDifference = parseInt((new Date($scope.order.estimateTime-date)) /(1000*60*60))
                      if ($scope.timeDifference >= 2) {
                          $http({
                              method: "post",
                              url: Proxy.local() + "/svr/request",
                              headers: {
                                  'Authorization': "Bearer " + $rootScope.access_token,
                              },
                              data: {
                                  request: 'updateServiceOrderState',
                                  info: {
                                      orderState: state,
                                      order: $scope.order
                                  }
                              }
                          }).then(function(res) {
                              var json=res.data;
                              if(json.re==1) {
                                  var servicePersonIdObjs = json.data;
                                  var servicePersonIds = [];
                                  servicePersonIdObjs.map(function(servicePersonId,i) {
                                      servicePersonIds.push(servicePersonId.servicePersonId);
                                  })
                                  $http({
                                      method: "post",
                                      url: Proxy.local() + "/svr/request",
                                      headers: {
                                          'Authorization': "Bearer " + $rootScope.access_token,
                                      },
                                      data: {
                                          request: 'sendCustomMessage',
                                          info: {
                                              order: $scope.order,
                                              servicePersonIds: servicePersonIds,
                                              type: 'to-servicePerson'
                                          }
                                      }
                                  })

                              }

                          })

                      }
                      else {
                          alert("距离预约时间不足两小时，无法取消订单！");
                      }

                  }
              }

              //取消服务中的订单（已有确定人员接单但还未执行））
              if($scope.order.orderState==2){

                  var date = new Date();
                  $scope.timeDifference = parseInt((new Date($scope.order.estimateTime)-date) /(1000*60*60));
                  if ($scope.timeDifference >= 2) {
                      $http({
                          method: "post",
                          url: Proxy.local() + "/svr/request",
                          headers: {
                              'Authorization': "Bearer " + $rootScope.access_token,
                          },
                          data: {
                              request: 'updateServiceOrderState',
                              info: {
                                  orderState: state,
                                  order: $scope.order,
                              }
                          }
                      }).then(function (res) {
                          var json=res.data;
                          if(json.re==1) {
                              var  cancelAlert= $ionicPopup.alert({
                                  template: '订单取消成功',
                                  title: '信息'
                              });
                              cancelAlert.then(function (res) {
                                  $rootScope.flags.serviceOrders.clear=true;
                                  $rootScope.flags.serviceOrders.onFresh=true;
                                  $state.go('service_orders');
                              });
                          }

                      }).catch(function(err) {
                          var str='';
                          for(var field in err)
                              str+=err[field];
                          console.error('err=\r\n'+str);
                      });

                  }
                  else {
                      alert("距离预约时间不足两小时，无法取消订单！");
                  }

              }
      }

      //完成订单
      $scope.finishOrder=function () {

          $http({
              method: "post",
              url: Proxy.local() + "/svr/request",
              headers: {
                  'Authorization': "Bearer " + $rootScope.access_token,
              },
              data: {
                  request: 'updateServiceOrderState',
                  info: {
                      orderState: 3,
                      order: $scope.order
                  }
              }
          }).then(function (res) {
              var json=res.data;
              if(json.re==1) {

                  $http({
                      method: "post",
                      url: Proxy.local() + "/svr/request",
                      headers: {
                          'Authorization': "Bearer " + $rootScope.access_token,
                      },
                      data: {
                          request: 'insertFeePayInfo',
                          info: {
                              fee:-$scope.order.fee,
                              orderId: $scope.order.orderId,
                              type:'service'
                          }
                      }
                  }).then(function(res) {
                      var json=res.data;
                      if(json.re==1) {
                          $rootScope.flags.serviceOrders.clear=true;
                          $rootScope.flags.serviceOrders.onFresh=true;
                          var confirmPopup = $ionicPopup.confirm({
                              title: '信息',
                              template: '订单已完成,是否现在进行评价'
                          });
                          confirmPopup.then(function(res) {
                              if(res) {
                                  $state.go('evaluate', {order: JSON.stringify($scope.order)});
                              }
                          })
                      }
                  }).catch(function (err) {
                      var str='';
                      for(var field in err)
                          str+=err[field];
                      console.error('err=\r\n'+str);
                  })

              }else{
                  var myPopup = $ionicPopup.alert({
                      template: '服务订单修改状态失败',
                      title: '信息'
                  });
                  return {re: -1};
              }
          });
      }


  });
