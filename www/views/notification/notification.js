/**
 * Created by danding on 16/9/6.
 * 山大默认经纬度为117.144816,36.672171
 * 1.$scope.maintain.maintenance,保存选中的维修厂
 */
angular.module('starter')

    .controller('notificationController',function($scope,$state,$http,$timeout,$rootScope,
                                                  Proxy,$stateParams,$ionicLoading,
                                                  $ionicNativeTransitions) {


        $scope.goBack=function () {
            $ionicNativeTransitions.stateGo('tabs.my', {}, {}, {
                "type": "slide",
                "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
                "duration": 240, // in milliseconds (ms), default 400
            });
        }

        $scope.notyTypes={0:'车险',1:'寿险',2:'服务'};

        //默认tab页，该页默认缓存
        $scope.tabIndex=2;

        $scope.notifications={0:[],1:[],2:[]};

        $scope.tab_change = function(i){
            $scope.tabIndex=i;
        }
        $scope.selectedTabStyle=
            {
                display:'inline-block',color:'#fff',width:'31%',float:'left',height:'100%','border': '1px solid','border-color': 'rgb(55, 144, 139)','background-color':'rgb(55, 144, 139)'
            };
        $scope.unSelectedTabStyle=
            {
                display:'inline-block',width:'31%',float:'left',height:'100%','border': '1px solid','border-color': 'rgb(68, 78, 78)'
            };

        $scope.notifications=$rootScope.notifications;

        //获取该用户的所有推送消息
        $scope.getNotifications=function () {
            $ionicLoading.show({
                template: '<p class="item-icon-left">拉取用户消息...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
            });
            $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data: {
                    request: 'fetchNotifications',
                    info:{
                        side:'customer'
                    }
                }
            }).then(function (res) {
                var json=res.data;
                if(json.re==1) {
                    if(json.data!==undefined&&json.data!==null)
                    {
                        json.data.map(function (item, i) {
                            switch(item.type)
                            {
                                case 'car':
                                    $scope.notifications[0].push(item);
                                    break;
                                case 'life':
                                    $scope.notifications[1].push(item);
                                    break;
                                case 'service':
                                    $scope.notifications[2].push(item);
                                    break;
                                default:
                                    break;
                            }
                        });
                    }
                }
                $ionicLoading.hide();
            }).catch(function (err) {
                var str='';
                for(var field in err)
                    str+=err[field];
                console.error('err=\r\n'+str);
                $ionicLoading.hide();
            })
        }

        $scope.getNotifications();


        $scope.showNotyDetail=function (noty) {
            switch (noty.type) {
                case 'service':
                    //TODO:跳转服务订单
                    var orderId=noty.ownerId;
                    $http({
                        method: "POST",
                        url: Proxy.local() + "/svr/request",
                        headers: {
                            'Authorization': "Bearer " + $rootScope.access_token
                        },
                        data: {
                            request: 'getCarServiceOrderByOrderId',
                            info:{
                                orderId:orderId
                            }
                        }
                    }).then(function (res) {
                        var json=res.data;
                        if(json.re==1) {
                            var order=json.data;

                            $http({
                                method: "POST",
                                url: Proxy.local() + "/svr/request",
                                headers: {
                                    'Authorization': "Bearer " + $rootScope.access_token
                                },
                                data: {
                                    request: 'getCarInfoByCarId',
                                    info:{
                                        carId:order.carId
                                    }
                                }
                            }).then(function (res) {
                                var json=res.data;
                                if(json.re==1) {
                                    if(json.data!==undefined&&json.data!==null)
                                    {
                                        order.carInfo=json.data;
                                        $state.go('service_order_detail', {order: JSON.stringify(order)});
                                    }
                                }
                            })
                        }
                    }).catch(function (err) {
                        var str='';
                        for(var field in err)
                            str+=err[field];
                        console.error('err=\r\n'+str);
                    })
                    //目前服务订单对于用户app来说,1.接单请求
                    //$state.go('select_candidate_servicePerson', {params: JSON.stringify({orderId: noty.ownerId})});
                    break;
                default:
                    break;
            }
        }

    })
