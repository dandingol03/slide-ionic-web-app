/**
 * Created by danding on 16/9/6.
 * 山大默认经纬度为117.144816,36.672171
 * 1.$scope.maintain.maintenance,保存选中的维修厂
 */
angular.module('starter')

    .controller('mapPaperValidateConfirmController',function($scope,$state,$http,$timeout,$rootScope,
                                                            $ionicModal, Proxy,$stateParams,$q,
                                                            $ionicActionSheet,$cordovaDatePicker,$ionicLoading,
                                                            $ionicPopup,BaiduMapService,$ionicHistory) {

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
                    if((date-new Date())<0)
                    {
                        $ionicPopup.alert({
                            title: '错误',
                            template: '您所选的日期不能比当前日期早,请重新选择'
                        });
                    }else{
                        item[field]=date;
                    }
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

        /*****模态框高度计算****/
        $scope.screenHeight=window.screen.height;
        $scope.contentHeight=$scope.screenHeight-140;

        $scope.resultsStyle={width:'100%',height:$scope.contentHeight+'px'};

        $scope.customerPlace={
        };

        $scope.results=[];
        /*** 选择目的地模态框 ***/
        $ionicModal.fromTemplateUrl('views/modal/select_customerPlace_modal.html',{
            scope:  $scope,
            animation: 'animated '+'bounceInUp',
            hideDelay:920
        }).then(function(modal) {
            $scope.customerPlace_modal = modal;
        });

        $scope.openCustomerPlaceModal= function(){
            try{
                $scope.customerPlace_modal.show();
            }catch(e){
                alert('error=\r\n'+ e.toString());
            }
        };

        $scope.closeCustomerPlaceModal= function() {
            $scope.customerPlace_modal.hide();
        };
        /*** 选择目的地模态框 ***/

        //选择目的地的回调函数
        $scope.Select=function (item) {
            if(item!==undefined&&item!==null)
            {

                $http({
                    method: "POST",
                    url: Proxy.local() + "/svr/request",
                    headers: {
                        'Authorization': "Bearer " + $rootScope.access_token
                    },
                    data: {
                        request: 'selectDestinationByPersonId'
                    }
                }).then(function (res) {
                    var json=res.data;
                    if(json.re==1) {
                        var destinations=json.data;
                        if(destinations!==undefined&&destinations!==null&&destinations.length>0) {
                            destinations.map(function (place,i) {
                                if(place.title==item.title)
                                    item=place;
                            })
                        }
                        $scope.carManage.destination=item;
                    }else{
                        $scope.carManage.destination=item;
                    }
                    $scope.closeCustomerPlaceModal();
                }).catch(function (err) {
                    var str='';
                    for(var field in err)
                        str+=err[field];
                    console.error('err=\r\n'+str);
                    $scope.carManage.destination=item;
                    $scope.closeCustomerPlaceModal();
                })

            }
        }

        //基于百度地图api的接口搜索
        $scope.search=function () {

            if($rootScope.gaodeHome!==undefined&&$rootScope.gaodeHome!==null)
            {
                $ionicLoading.show({
                    template: '<p class="item-icon-left">拉取搜索结果...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
                });



                var BMap=null;
                if($scope.BMap!==undefined&&$scope.BMap!==null)
                    BMap=$scope.BMap;
                else
                    BMap=window.BMap;
                var map=$rootScope.gaodeHome;
                var options = {
                    onSearchComplete: function(results){
                        // 判断状态是否正确
                        if (local.getStatus() == BMAP_STATUS_SUCCESS){
                            $ionicLoading.hide();
                            var s = [];
                            $scope.results=[];
                            if(results.getCurrentNumPois()!==undefined&&results.getCurrentNumPois()!==null&&results.getCurrentNumPois()>0)
                            {
                                for (var i = 0; i < results.getCurrentNumPois(); i ++){
                                    var poi=results.getPoi(i);
                                    $scope.results.push({
                                        title:poi.title,
                                        address:poi.address,
                                        lat:poi.point.lat,
                                        lng:poi.point.lng
                                    });
                                }
                            }else{
                            }
                        }else{
                            $ionicLoading.hide();
                        }
                    }
                };

                var local = new BMap.LocalSearch(map, options);
                local.search($scope.customerPlace.address);
            }else{}
        }

        /**** 获取百度地图api接口 ****/
        BaiduMapService.getBMap().then(function (res) {
            var BMap = res;
            $scope.BMap=BMap;
        });




        $scope.servicePlace=null;

        /*****模态框高度计算****/
        $scope.screenHeight=window.screen.height;
        $scope.contentHeight=$scope.screenHeight-140;

        $scope.resultsStyle={width:'100%',height:$scope.contentHeight+'px'};

        $scope.customerPlace={
        };

        $scope.results=[];
        /*** 选择目的地模态框 ***/
        $ionicModal.fromTemplateUrl('views/modal/select_customerPlace_modal.html',{
            scope:  $scope,
            animation: 'animated '+'bounceInUp',
            hideDelay:920
        }).then(function(modal) {
            $scope.customerPlace_modal = modal;
        });

        $scope.openCustomerPlaceModal= function(){
            try{
                $scope.customerPlace_modal.show();
            }catch(e){
                alert('error=\r\n'+ e.toString());
            }
        };

        $scope.closeCustomerPlaceModal= function() {
            $scope.customerPlace_modal.hide();
        };
        /*** 选择目的地模态框 ***/

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
                            item.text=destination.title;
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
                            //$scope.go_to('create_new_customerPlace')
                            $scope.openCustomerPlaceModal();
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

                        var serviceName = '车驾管-审证';
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
                    $scope.doingBusiness=false;
                }).catch(function (err) {
                    var str = '';
                    for (var field in err)
                        str += err[field];
                    $scope.doingBusiness=false;
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
                        var serviceName = '车驾管-审证';
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
                        $rootScope.flags.serviceOrders.clear=true;
                        myAlert.then(function(res) {
                            $state.go('service_orders');
                        });
                    }
                    $scope.doingBusiness=false;
                }).catch(function (err) {
                    var str = '';
                    for (var field in err)
                        str += err[field];
                    console.error('error=\r\n' + str);
                    $scope.doingBusiness=false;
                });

            }

        }

        //创建新的用户地址
        $scope.createNewCustomerPlace=function () {
            var deferred=$q.defer();
            var destination=$scope.carManage.destination;
            $http({
                method: "POST",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data:
                    {
                        request:'createNewCustomerPlace',
                        info:{
                            title:destination.title,
                            address:destination.address,
                            longitude:destination.lng,
                            latitude:destination.lat
                        }

                    }
            }).then(function(res) {
                var json=res.data;
                if(json.re==1) {
                    deferred.resolve({re: 1,data:json.data});
                }else{

                    $timeout(function () {
                        var myPopup = $ionicPopup.alert({
                            template: '选择地点错误，请重新选择您的取车地点',
                            title: '错误'
                        });
                    },400);
                    deferred.resolve({re: 2, data: null});
                }

            }).catch(function (err) {
                var str='';
                for(var field in err)
                    str+=err[field];
                console.error('err=\r\n'+str);
                deferred.reject({});
            })
            return deferred.promise;
        }



        $scope.doingBusiness=false;


        $scope.preCheck=function () {


            if($scope.doingBusiness==false)
            {
                if($scope.carManage.estimateTime!==undefined&&$scope.carManage.estimateTime!==null)
                {

                    $scope.carManage.serviceType=22;
                    $scope.carManage.carId=$scope.carInfo.carId;

                    if($scope.carManage.isAgent==true)
                    {
                        if($scope.carManage.destination==undefined||$scope.carManage.destination==null||
                            $scope.carManage.destination.title==undefined||$scope.carManage.destination.title==null)
                        {

                            $ionicPopup.alert({
                                title: '错误',
                                template: '请先选择取车地点'
                            });
                            $scope.doingBusiness=false;
                            return ;
                        }
                    }

                    if($scope.carManage.destination!==undefined&&$scope.carManage.destination!==null&&
                        ($scope.carManage.destination.placeId==undefined||$scope.carManage.destination.placeId==null))
                    {
                        //TODO:create a new destination
                        $scope.createNewCustomerPlace().then(function (json) {
                            if(json.re==1) {
                                var customerPlace=json.data;
                                $scope.carManage.destination=customerPlace;
                                $scope.applyCarServiceOrder();
                            }else if(json.re==2) {
                            }else{}
                        })
                    }else{
                        $scope.applyCarServiceOrder();
                    }

                }else{
                    $scope.doingBusiness=false;
                    $ionicPopup.alert({
                        title: '',
                        template: '请选择预约时间'
                    });

                }
            }else{}
        }

        $scope.applyCarServiceOrder=function () {

            $scope.carManage.serviceType=22;
            $scope.carManage.carId=$scope.carInfo.carId;

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
                                                }else{
                                                    $scope.doingBusiness=false;
                                                }
                                            })
                                        }else{
                                            $scope.generateServiceOrder();
                                        }
                                    }
                                });

                            }else{
                                $scope.doingBusiness=false;
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


        }

    })
