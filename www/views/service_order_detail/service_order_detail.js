/**
 * Created by yiming on 16/10/5.
 */
/**
 * Created by yiming on 16/9/13.
 */
angular.module('starter')

  .controller('serviceOrderDetailController',function($scope,$stateParams,$http,
                                                      $rootScope,$ionicLoading,Proxy,
                                                        $ionicPopup){

    $scope.order=$stateParams.order;

    if(Object.prototype.toString.call($scope.order)=='[object String]')
      $scope.order = JSON.parse($scope.order);


    $scope.go_back=function(){
      window.history.back();
    };

    $scope.candidateColors=[{background:'rgb(220, 171, 106)',color:'#fff'},{background:'rgba(220, 171, 106,0.7)',color:'#fff'},
        {background:'rgba(220, 171, 106,0.4)',color:'#fff'},{background:'rgba(220, 171, 106,0.1)',color:'#fff'}];


    $scope.fetchRelativeInfo=function () {
        $ionicLoading.show({
            template: '<p class="item-icon-left">生成车险订单...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
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
    $scope.fetchRelativeInfo();

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
                                  order: $scope.order,
                                  servicePersonId: candidate.servicePersonId,
                                  type: 'to-servicePerson'
                              }
                          }
                      });
                  }
              }).then(function (res) {
                  var json=res.data;
                  if(json.re==1) {
                      var myPopup = $ionicPopup.alert({
                          template: '接单成功',
                          title: '<strong style="color:red">信息</strong>'
                      });
                  }
              })


                  .catch(function (err) {
                  var str='';
                  for(var field in err)
                      str+=err[field];
                  console.error('err=\r\n'+str);
              })
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
                                 alert('订单取消成功！');
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
                  $scope.timeDifference = parseInt((new Date($scope.order.estimateTime-date)) /(1000*60*60));
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
                              alert('订单取消成功！');
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
                  var confirmPopup = $ionicPopup.confirm({
                      title: '信息',
                      template: '订单已完成,是否现在进行评价'
                  });
                  confirmPopup.then(function(res) {
                      if(res) {
                          console.log('go into rate page');
                      }
                  })
              }
          })
      }
      

  });
