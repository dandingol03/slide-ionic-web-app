/**
 * Created by danding on 16/9/6.
 * 山大默认经纬度为117.144816,36.672171
 * 1.$scope.maintain.maintenance,保存选中的维修厂
 */
angular.module('starter')

    .controller('mapAirportConfirmController',function($scope,$state,$http,$timeout,$rootScope,
                                                            $ionicModal, Proxy,$stateParams,$q,
                                                            $ionicActionSheet,$cordovaDatePicker,$ionicLoading,
                                                            $ionicPopup) {

        $scope.goBack = function () {
            window.history.back();
        }


        $scope.selectTime=true;
        $scope.datetimepicker=function (item,field) {

            var options = {
                date: new Date(),
                mode: 'datetime',
                locale:'zh_cn'
            };

            if($scope.selectTime==true){
                $scope.selectTime=false;
                $cordovaDatePicker.show(options).then(function(date){
                    alert(date);
                    item[field]=date;
                    $scope.selectTime=true;

                }).catch(function(err) {
                    $scope.selectTime=true;
                });
            }
        }


        $scope.go_back = function () {
            window.history.back();
        }


        $scope.Toggle = function (item, field) {
            if (item[field] == true)
                item[field] = false;
            else
                item[field] = true;
        };

        $scope.Set = function (item, field, value) {
            item[field] = value;
        };




        $scope.Mutex = function (item, field, cluster) {
            if (item[field]) {
                item[field] = false;
            }
            else {
                item[field] = true;
                cluster.map(function (cell, i) {
                    if (cell != item)
                        cell[field] = false;
                })
            }
        };


        $scope.carManage={

        };

        $scope.servicePlace=null;


        if ($stateParams.contentInfo !== undefined && $stateParams.contentInfo !== null) {
            $scope.contentInfo=$stateParams.contentInfo;
            if(Object.prototype.toString.call($scope.contentInfo)=='[object String]')
                $scope.contentInfo=JSON.parse($scope.contentInfo);
            if($scope.contentInfo.unit!==undefined&&$scope.contentInfo.unit!==null)
                $scope.unit = $scope.contentInfo.unit;
            if($scope.contentInfo.units!==undefined&&$scope.contentInfo.units!==null)
                $scope.units=$scope.contentInfo.units;
            if($scope.contentInfo.carInfo!==undefined&&$scope.contentInfo.carInfo!==null)
                $scope.carInfo=$scope.contentInfo.carInfo;
            else
                $scope.carInfo={};
            if($scope.contentInfo.mode!==undefined&&$scope.contentInfo.mode!==null)
            {
                switch($scope.contentInfo.mode)
                {
                    case 'pickUp':
                        $scope.viewTitle='生成接机订单';
                        break;
                    case 'seeOff':
                        $scope.viewTitle='生成送机订单';
                        break;
                    default:
                        break;
                }
            }
        }




        $scope.getServicePersonByUnitId=function () {
            $ionicLoading.show({
                template:'<p class="item-icon-left">拉取维修厂数据...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
            });
            $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data: {
                    request: 'getServicePersonByUnitId',
                    info: {
                        unitId: $scope.unit.unitId
                    }
                }
            }).then(function (res) {
                var json=res.data;
                if(json.re==1) {
                    $scope.carManage.servicePerson=json.data;
                }
                else{
                    $timeout(function () {
                        $ionicPopup.alert({
                            title: '错误',
                            template: '该维修厂没有指定的服务人员'
                        });
                    },1000)
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
        if($scope.unit!==undefined&&$scope.unit!==null)
            $scope.getServicePersonByUnitId();

        $scope.selectDestination=function () {
            $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data: {
                    request: 'selectDestinationByPersonId'
                }
            }).then(function(res) {
                var json=res.data;
                if(json.re==1) {
                    var destinations=json.data;
                    if(destinations!==undefined&&destinations!==null&&destinations.length>0) {
                        var buttons=[];
                        buttons.push({text:"创建新地址"});
                        destinations.map(function (destination) {
                            var item=destination;
                            item.text=destination.address;
                            buttons.push(item);
                        })
                        var destinationSheet = $ionicActionSheet.show({
                            buttons: buttons,
                            titleText: '<b>选择目的地</b>',
                            cancelText: 'Cancel',
                            cancel: function() {
                                // add cancel code..
                            },

                            buttonClicked: function(index) {
                                if(index==0){
                                    $scope.go_to('create_new_customerPlace');
                                }else{
                                    $scope.carManage.destination=buttons[index];
                                }

                                return true;
                            },
                            cssClass:'center'
                        });
                    }
                }else if(json.re==2)
                {
                    var confirmPopup = $ionicPopup.confirm({
                        title: '信息',
                        template: '<strong>没有可供选择的地址</strong><br/><strong>是否创建住址</strong>',
                        subTitle: '',
                        scope: $scope
                    });
                    confirmPopup.then(function(res) {
                        if(res) {
                            $scope.go_to('create_new_customerPlace')
                        } else {}
                    });


                }else{}


            })
        }


        $scope.generateServiceOrder=function(){




            var unit=$scope.unit;
            var units=$scope.units;

            //接送机----已指派服务人员

            if(unit!==undefined&&unit!==null)//
            {
                $scope.carManage.servicePlaceId=55;
                $scope.carManage.servicePersonId=$scope.carManage.servicePerson.servicePersonId;

                $http({
                    method: "POST",
                    url: Proxy.local() + "/svr/request",
                    headers: {
                        'Authorization': "Bearer " + $rootScope.access_token
                    },
                    data: {
                        request: 'generateCarServiceOrder',
                        info: {
                            carManage: $scope.carManage,
                            serviceType:$scope.carManage.serviceType
                        }
                    }
                }).then(function(res) {
                    var json = res.data;
                    if (json.re == 1) {

                        var serviceName = '车驾管-审车';
                        var order=json.data;
                        var servicePersonIds = [order.servicePersonId];
                        return $http({
                            method: "POST",
                            url: Proxy.local() + "/svr/request",
                            headers: {
                                'Authorization': "Bearer " + $rootScope.access_token
                            },
                            data: {
                                request: 'sendCustomMessage',
                                info: {
                                    order: order,
                                    servicePersonIds: servicePersonIds,
                                    serviceName: serviceName,
                                    category:'carManage',
                                    type: 'to-servicePerson'
                                }
                            }
                        });
                    } else {
                        return ({re: -1});
                    }
                }).catch(function (err) {
                    var str = '';
                    for (var field in err)
                        str += err[field];
                });
            }else//未选定维修厂,批量选中
            {
                var order = null;
                var servicePersonIds = [];
                var personIds = [];

                $http({
                    method: "POST",
                    url: Proxy.local() + "/svr/request",
                    headers: {
                        'Authorization': "Bearer " + $rootScope.access_token
                    },
                    data: {
                        request: 'generateCarServiceOrder',
                        info: {
                            carManage: $scope.carManage
                        }
                    }
                }).then(function (res) {
                    var json = res.data;
                    if (json.re == 1) {
                        alert('json re==1');
                        order=json.data;
                        return $http({
                            method: "POST",
                            url: Proxy.local() + "/svr/request",
                            headers: {
                                'Authorization': "Bearer " + $rootScope.access_token
                            },
                            data: {
                                request: 'getServicePersonsByUnits',
                                info: {
                                    detectUnites: units
                                }
                            }
                        });
                    }
                }).then(function(res) {
                    var json=res.data;
                    if(json.re==1) {
                        json.data.map(function(servicePerson,i) {
                            servicePersonIds.push(servicePerson.servicePersonId);
                            personIds.push(servicePerson.personId);
                        });
                        return $http({
                            method: "POST",
                            url: Proxy.local() + "/svr/request",
                            headers: {
                                'Authorization': "Bearer " + $rootScope.access_token
                            },
                            data: {
                                request: 'updateCandidateState',
                                info: {
                                    orderId: order.orderId,
                                    servicePersonIds: servicePersonIds,
                                    candidate:1
                                }
                            }
                        });
                    }
                }).then(function (res) {
                    var json = res.data;
                    if (json.re == 1) {
                        //TODO:append address and serviceType and serviceTime
                        var serviceName = '车驾管-审车';
                        return $http({
                            method: "POST",
                            url: Proxy.local() + "/svr/request",
                            headers: {
                                'Authorization': "Bearer " + $rootScope.access_token
                            },
                            data: {
                                request: 'sendCustomMessage',
                                info: {
                                    order: order,
                                    serviceItems: null,
                                    servicePersonIds: servicePersonIds,
                                    serviceName: serviceName,
                                    type: 'to-servicePerson'
                                }
                            }
                        });
                    } else {
                        return ({re: -1});
                    }
                }).then(function(res) {
                    var json=res.data;
                    if(json.re==1) {
                        $ionicPopup.alert({
                            title: '信息',
                            template: '服务订单生成成功'
                        });

                        $ionicPopup.then(function(res) {
                            $state.go('service_orders');
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

        $scope.applyCarServiceOrder=function () {



            if($scope.carManage.destination&&$scope.carManage.destination.address)
            {
                if($scope.carManage.estimateTime!==undefined&&$scope.carManage.estimateTime!==null)
                {
                    $scope.carManage.serviceType=23;
                    //TODO:scoreVerify
                    $http({
                        method: "POST",
                        url: Proxy.local() + "/svr/request",
                        headers: {
                            'Authorization': "Bearer " + $rootScope.access_token
                        },
                        data: {
                            request: 'fetchScoreTotal'
                        }
                    }).then(function (res) {
                        var json=res.data;
                        if(json.re==1) {
                            var score=json.data;
                            $http({
                                method: "POST",
                                url: Proxy.local() + "/svr/request",
                                headers: {
                                    'Authorization': "Bearer " + $rootScope.access_token
                                },
                                data: {
                                    request: 'generateCarServiceOrderFee',
                                    info: {
                                        serviceType: $scope.carManage.serviceType,
                                        subServiceTypes: null
                                    }
                                }
                            }).then(function (res) {
                                var json=res.data;
                                if(json.re==1)
                                {
                                    var fee=json.data;
                                    $scope.carManage.fee=fee;
                                    if(fee>=score)
                                    {
                                        $scope.generateServiceOrder();
                                    }else{
                                        var alertPopup = $ionicPopup.alert({
                                            title: '警告',
                                            template: '服务订单的费用超过您现在的积分'
                                        });
                                    }
                                }
                            })


                        }else{
                            var alertPopup = $ionicPopup.alert({
                                title: '警告',
                                template: '您没有合法积分'
                            });
                        }
                    })



                }else{
                        $ionicPopup.alert({
                            title: '',
                            template: '请选择预约时间'
                        });
                }
            }else{
                $ionicPopup.alert({
                    title: '错误',
                    template: '请先选择取车地点'
                });
            }

        }

    })
