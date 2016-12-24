/**
 * Created by danding on 16/9/6.
 * 山大默认经纬度为117.144816,36.672171
 * 1.$scope.maintain.maintenance,保存选中的维修厂
 */
angular.module('starter')

    .controller('mapPaperValidateConfirmController',function($scope,$state,$http,$timeout,$rootScope,
                                                            $ionicModal, Proxy,$stateParams,$q,
                                                            $ionicActionSheet,$cordovaDatePicker,$ionicLoading,
                                                            $ionicPopup) {

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
            if($scope.contentInfo.place!==undefined&&$scope.contentInfo.detectUplacenit!==null)
                $scope.place = $scope.contentInfo.place;
            if($scope.contentInfo.places!==undefined&&$scope.contentInfo.places!==null)
                $scope.places=$scope.contentInfo.places;
            if($scope.contentInfo.carInfo!==undefined&&$scope.contentInfo.carInfo!==null)
                $scope.carInfo=$scope.contentInfo.carInfo;
            else
                $scope.carInfo={};
        }


        //查询已绑定车辆,并显示车牌信息
        $scope.selectCarInfoByCarNum=function(item,modal){

            var data={
                request:'fetchInsuranceCarInfoByCustomerId'
            };

            data.info={
                carNum:$scope.carInfo.carNum
            };


            $http({
                method: "POST",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data:data
            }).then(function(res) {
                var json=res.data;
                if(json.re==1) {
                    var cars=[];
                    if(json.data!==undefined&&json.data!==null)
                    {
                        json.data.map(function (car,i) {
                            if(car.idle==true)
                                cars.push(car);
                        })
                    }
                    var buttons=[];
                    buttons.push({text: "<b>创建新车</b>"});
                    cars.map(function(car,i) {
                        var ele=car;
                        ele.text='<b>'+car.carNum+'</b>';
                        buttons.push(ele);
                    });
                    var carSheet = $ionicActionSheet.show({
                        buttons: buttons,
                        titleText: '<b>选择车辆信息</b>',
                        cancelText: 'Cancel',
                        cancel: function() {
                            // add cancel code..
                        },
                        buttonClicked: function(index) {
                            if(index==0) {
                                //TODO:create new car info
                                if(modal!==undefined&&modal!==null)
                                    modal.hide();
                                $state.go('update_car_info');
                            }else{
                                var car=cars[index-1];
                                $scope.carInfo=car;

                            }
                            return true;
                        },
                        cssClass:'center'
                    });
                }
            }).catch(function(err) {
                var str='';
                for(var field in err)
                    str+=err[field];
                console.error('error=\r\n' + str);
            });
        }

        $scope.getServicePersonByPlaceId=function () {
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
                    request: 'getServicePersonByPlaceId',
                    info: {
                        placeId: $scope.place.placeId
                    }
                }
            }).then(function (res) {
                var json=res.data;
                if(json.re==1) {
                    $scope.carManage.servicePerson=json.data;
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

        if($scope.place!==undefined&&$scope.place!==null)
            $scope.getServicePersonByPlaceId();

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

        $scope.carManage.isAgent=false;

        $scope.generateServiceOrder=function(){

            //inject
            $scope.carManage.carId=$scope.carInfo.carId;

            var place=$scope.place;
            var places=$scope.places;

            //审车----选择检测公司

            if(place!==undefined&&place!==null)//已选检测公司
            {
                $scope.carManage.servicePlaceId=place.placeId;
                if($scope.carManage.servicePerson.servicePersonId!=undefined&&$scope.carManage.servicePerson.servicePersonId!=null){
                    $scope.carManage.servicePersonId=$scope.carManage.servicePerson.servicePersonId;
                }

                $scope.carManage.orderState=2;

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
                            serviceType: $scope.carManage.serviceType
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
                }).then(function (res) {
                    var json=res.data;
                    if(json.re==1) {
                        $ionicHistory.clearHistory();
                        $ionicHistory.clearCache();
                        $rootScope.flags.serviceOrders.onFresh=true;
                        $state.go('service_orders');
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
                                request: 'getServicePersonsByPlaces',
                                info: {
                                    places: places
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
                       var myAlert=$ionicPopup.alert({
                            title: '信息',
                            template: '服务订单生成成功'
                        });
                        $rootScope.flags.serviceOrders.onFresh=true;
                        myAlert.then(function(res) {
                            $ionicHistory.clearHistory();
                            $ionicHistory.clearCache();
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

            $scope.carManage.serviceType=22;

            $scope.carManage.carId=$scope.carInfo.carId;



            if($scope.carManage.isAgent==true)
            {
               if($scope.carManage.destination==undefined||$scope.carManage.destination==null||
                    $scope.carManage.destination.address==undefined||$scope.carManage.destination.address==null)
               {

                   $ionicPopup.alert({
                       title: '错误',
                       template: '请先选择取车地点'
                   });
                   return ;
               }
            }


            if($scope.carManage.estimateTime!==undefined&&$scope.carManage.estimateTime!==null
                &&$scope.carManage.carId!=undefined&&$scope.carManage.estimateTime!=null)
            {

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
                            if(json.re==1) {
                                var fee=json.data;
                                $scope.carManage.fee=fee;
                                if(fee<=score)
                                {
                                    $http({
                                        method: "POST",
                                        url: Proxy.local() + "/svr/request",
                                        headers: {
                                            'Authorization': "Bearer " + $rootScope.access_token
                                        },
                                        data: {
                                            request: 'validateCarServiceStateFree',
                                            info: {
                                                carManage: $scope.carInfo.carId
                                            }
                                        }
                                    }).then(function(res) {
                                        var json=res.data;
                                        if(json.re==1) {
                                            if(json.data==true)
                                            {
                                                var confirmPopup = $ionicPopup.confirm({
                                                    title:'信息',
                                                    template:  '您的车辆已有正在进行的服务订单,是否仍要生成审车订单'
                                                });
                                                confirmPopup.then(function (res) {
                                                    if(res)
                                                    {
                                                        $scope.generateServiceOrder();
                                                    }
                                                })
                                            }else{
                                                $scope.generateServiceOrder();
                                            }
                                        }
                                    });

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
                if($scope.carManage.estimateTime==undefined&&$scope.carManage.estimateTime==null){
                    $ionicPopup.alert({
                        title: '',
                        template: '请选择预约时间'
                    });
                }else{
                    $ionicPopup.alert({
                        title: '',
                        template: '请选择车辆信息'
                    });
                }
            }


        }

    })
