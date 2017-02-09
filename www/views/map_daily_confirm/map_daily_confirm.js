/**
 * Created by danding on 16/9/6.
 * 山大默认经纬度为117.144816,36.672171
 * 1.$scope.maintain.maintenance,保存选中的维修厂
 */
angular.module('starter')

    .controller('mapDailyConfirmController',function($scope,$state,$http,$timeout,$rootScope,
                                                     Proxy,$stateParams, ionicDatePicker,
                                                     $ionicActionSheet, $cordovaDatePicker,$q,
                                                     $cordovaFileTransfer, $ionicPopup,$ionicLoading,
                                                     $ionicHistory,BaiduMapService,$ionicModal) {


        $scope.go_back = function () {
            window.history.back();
        }

        $scope.go_to=function (state) {
            $state.go(state);
        }

        $scope.maintain = {
            maintenance: {}
        };

        $scope.serviceTypeMap={
            11:'维修-日常保养',
            12:'维修-故障维修',
            13:'维修-事故维修',
            21:'车驾管-审车',
            22:'车驾管-审证',
            23:'车驾管-接送机',
            24:'车驾管-取送车',
            31:'鈑喷'};

        $scope.verifyServiceSegment=function (servicePerson) {

            var estimateTime=$scope.maintain.estimateTime;
            var day=estimateTime.getDay();
            var hour=estimateTime.getHours();
            var serviceSegments=servicePerson.serviceSegments;
            var flag=false;
            if(day==parseInt(serviceSegments.substring(0,1)))
            {
                var seg=serviceSegments.substring(1,2);
                switch(seg)
                {
                    case '1':
                        if(hour<=12)
                            flag=true;
                        break;
                    case '2':
                        if(hour>12)
                            flag=true;
                        break;
                }
            }
            return flag;
        }

        $scope.carInfo={};

        $scope.selectTime=true;

        if ($stateParams.contentInfo !== undefined && $stateParams.contentInfo !== null) {
            $scope.contentInfo=$stateParams.contentInfo;
            if(Object.prototype.toString.call($scope.contentInfo)=='[object String]')
                $scope.contentInfo=JSON.parse($scope.contentInfo);
            if($scope.contentInfo.unit!==undefined&&$scope.contentInfo.unit!==null)
                $scope.unit = $scope.contentInfo.unit;
            if($scope.contentInfo.units!==undefined&&$scope.contentInfo.units!==null)
                $scope.units=$scope.contentInfo.units;
            if($scope.contentInfo.maintain!==undefined&&$scope.contentInfo.maintain!==null)
                $scope.maintain=$scope.contentInfo.maintain;
            if($scope.contentInfo.carInfo!==undefined&&$scope.contentInfo.carInfo!==null)
                $scope.carInfo=$scope.contentInfo.carInfo;
            else
                $scope.carInfo={};
        }

        $scope.maintain.isAgent=false;

        $scope.datetimepicker=function (item,field) {

            var options = {
                date: new Date(),
                mode: 'datetime',
                locale:'zh_cn'
            };

            if($scope.selectTime==true){
                $scope.selectTime=false;
                $cordovaDatePicker.show(options).then(function(date){
                    var curDay=new Date();
                    var hour=date.getHours();
                    var day=date.getDay();
                    var serviceHour=null;
                    var serviceDay=null;

                    if((date-curDay)>0&&curDay.getDate()!=date.getDate())
                    {
                        if($scope.maintain.servicePerson!==undefined&& $scope.maintain.servicePerson!==null){

                            var servicePerson=$scope.maintain.servicePerson;
                            var serviceSegments=servicePerson.serviceSegments;
                            serviceHour = parseInt(serviceSegments.substring(1, 2));
                            serviceDay = parseInt(serviceSegments.substring(0, 1));

                            var tip='周';
                            switch (serviceDay) {
                                case 1:
                                    tip+='一';
                                    break;
                                case 2:
                                    tip+='二';
                                    break;
                                case 3:
                                    tip+='三';
                                    break;
                                case 4:
                                    tip+='四';
                                    break;
                                case 5:
                                    tip+='五';
                                    break;
                                case 6:
                                    tip+='六';
                                    break;
                                case 7:
                                    tip+='日';
                                    break;
                            }
                            switch(serviceHour)
                            {
                                case 1:
                                    tip+='上午';
                                    break;
                                case 2:
                                    tip+='下午';
                                    break;
                            }

                            if(day==serviceDay)
                            {
                                if(parseInt(hour/12)==serviceHour-1)
                                {
                                    item[field]=date;
                                    $scope.selectTime=true;
                                    return;
                                }else{

                                    $ionicPopup.alert({
                                        title: '错误',
                                        template: '您所选的日期时段不对,该服务人员的工作时段位于'+tip+',请重新选择'
                                    });


                                }

                            }else{

                                $ionicPopup.alert({
                                    title: '错误',
                                    template: '您所选的日期时段不对,该服务人员的工作时段位于'+tip+',请重新选择'
                                });
                            }


                        }else{
                            item[field]=date;
                        }
                    }else{
                        $ionicPopup.alert({
                            title: '错误',
                            template: '您所选的日期必须在当天之后,请重新选择'
                        });
                        $scope.selectTime=true;
                        return ;
                    }
                    $scope.selectTime=true;
                }).catch(function(err) {
                    $scope.selectTime=true;
                });
            }
        }




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
                //TODO:contrast item with database
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
                        $scope.maintain.destination=item;
                    }
                })

                $scope.closeCustomerPlaceModal();
            }
        }

        //基于百度地图api的接口搜索
        $scope.search=function () {

            if($rootScope.MAP_maintain!==undefined&&$rootScope.MAP_maintain!==null)
            {
                $ionicLoading.show({
                    template: '<p class="item-icon-left">拉取搜索结果...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
                });



                var BMap=null;
                if($scope.BMap!==undefined&&$scope.BMap!==null)
                    BMap=$scope.BMap;
                else
                    BMap=window.BMap;
                var map=$rootScope.MAP_maintain;
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
                        unitId: $scope.unit.unitId!==undefined&&$scope.unit.unitId!==null?$scope.unit.unitId:$scope.unit.placeId
                    }
                }
            }).then(function (res) {
                var json=res.data;
                if(json.re==1) {
                    $scope.maintain.servicePerson=json.data;
                }else{
                    $timeout(function () {
                        var alertPopup = $ionicPopup.alert({
                            title: '错误',
                            template: '该维修厂没有指定服务人员'
                        });
                        alertPopup.then(function (res) {
                            $scope.go_back();
                        })
                    }, 400);
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
                                    //$scope.go_to('create_new_customerPlace');
                                    $scope.openCustomerPlaceModal();
                                }else{
                                    $scope.maintain.destination=buttons[index];
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
                            $scope.openCustomerPlaceModal();
                            //$scope.go_to('create_new_customerPlace')
                        } else {}
                    });


                }else{}


            })
        }



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


        $scope.Toggle = function (item, field) {
            if (item[field] == true)
                item[field] = false;
            else
                item[field] = true;
        };

        $scope.Set = function (item, field, value) {
            item[field] = value;
        }

        //视频检查
        $scope.videoCheck = function (orderId) {
            var deferred = $q.defer();
            if($scope.maintain.description.video!=null&&$scope.maintain.description.video!=undefined)
            {
                var server=Proxy.local()+'/svr/request?' +
                    'request=uploadVideo&orderId='+orderId+'&fileName='+$scope.maintain.description.video+'&videoType=serviceVideo';
                var options = {
                    fileKey:'file',
                    headers: {
                        'Authorization': "Bearer " + $rootScope.access_token
                    }
                };
                $cordovaFileTransfer.upload(server, $scope.maintain.description.video, options).then(function(res) {
                    var json=res.response;
                    json=JSON.parse(json);
                    if(json.re==1){
                        return   $http({
                            method: "POST",
                            url: Proxy.local() + "/svr/request",
                            headers: {
                                'Authorization': "Bearer " + $rootScope.access_token
                            },
                            data: {
                                request: 'createVideoAttachment',
                                info: {
                                    orderId: orderId,
                                    docType:'I7',
                                    path:json.data
                                }
                            }
                        });
                    }else{
                        deferred.reject({re:-1});
                    }
                }).then(function(res) {
                    var json=res.data;
                    if(json.re==1) {
                        var videoAttachId=json.data;
                        if(json.re==1){
                            return  $http({
                                method: "POST",
                                url: Proxy.local() + "/svr/request",
                                headers: {
                                    'Authorization': "Bearer " + $rootScope.access_token
                                },
                                data: {
                                    request: 'updateServiceVideoAttachment',
                                    info: {
                                        orderId: orderId,
                                        videoAttachId:videoAttachId
                                    }
                                }
                            });
                        }
                    }
                }).then(function(res) {
                    var json=res.data;
                    if(json.re==1) {
                        deferred.resolve({re: 1, data: ''});
                    }
                }).catch(function(err) {
                    var str='';
                    for(var feild in err)
                        str+=err[field];
                    console.error('error=\r\n' + str);
                })
            }
            else{
                deferred.resolve({re:1});
            }
            return deferred.promise;
        }

        //音频检查
        $scope.audioCheck = function (orderId) {
            var deferred = $q.defer();

            if($scope.maintain.description.audio!=null&&$scope.maintain.description.audio!=undefined)
            {
                var server=Proxy.local()+'/svr/request?' +
                    'request=uploadAudio&orderId='+orderId+'&fileName='+$scope.maintain.description.audio+'&audioType=serviceAudio';
                var options = {
                    fileKey:'file',
                    headers: {
                        'Authorization': "Bearer " + $rootScope.access_token
                    }
                };
                alert('go into upload audio');
                $cordovaFileTransfer.upload(server, $scope.maintain.description.audio, options)
                    .then(function(res) {
                        var json=res.response;
                        json=JSON.parse(json);
                        if(json.re==1){

                            return   $http({
                                method: "POST",
                                url: Proxy.local() + "/svr/request",
                                headers: {
                                    'Authorization': "Bearer " + $rootScope.access_token
                                },
                                data: {
                                    request: 'createAudioAttachment',
                                    info: {
                                        orderId: orderId,
                                        docType:'I6',
                                        path:json.data
                                    }
                                }
                            });
                        }
                    }).then(function(res) {
                    var json=res.data;
                    var audioAttachId=json.data;
                    if(json.re==1){
                        $http({
                            method: "POST",
                            url: Proxy.local() + "/svr/request",
                            headers: {
                                'Authorization': "Bearer " + $rootScope.access_token
                            },
                            data: {
                                request: 'updateServiceAudioAttachment',
                                info: {
                                    orderId: orderId,
                                    audioAttachId:audioAttachId
                                }
                            }
                        });
                    }
                }).then(function(res) {
                    var json=res.data;
                    if(json.re==1) {
                        deferred.resolve({re: 1, data: ''});
                    }
                }).catch(function(err) {
                    var str='';
                    for(var field in err)
                        str+=err[field];
                    console.error('error=' + str);
                })
            }
            else{
                deferred.resolve({re:1});
            }
            return deferred.promise;
        }






            //确认维修厂回调
            $scope.maintenance_confirm = function () {

                switch ($scope.locateType) {
                    case 'maintain':
                        $rootScope.dashboard.tabIndex=2;
                        if($scope.locate.locateIndex!==undefined&&$scope.locate.locateIndex!==null)
                            $rootScope.dashboard.subTabIndex=$scope.locate.locateIndex;
                        else
                            $rootScope.dashboard.subTabIndex=1;
                        if ($rootScope.maintain == undefined || $rootScope.maintain == null)
                            $rootScope.maintain = {};
                        //维修厂已选
                        if ($scope.unit !== undefined && $scope.unit !== null)
                        {

                            $http({
                                method: "POST",
                                url: Proxy.local()+"/svr/request",
                                headers: {
                                    'Authorization': "Bearer " + $rootScope.access_token,
                                },
                                data:
                                    {
                                        request:'getServicePersonByUnitId',
                                        info:{
                                            unitId:$scope.unit.unitId
                                        }
                                    }
                            }).then(function(res) {
                                var json=res.data;
                                $rootScope.maintain.unit=$scope.unit;
                                $rootScope.maintain.servicePerson =json.data;
                                $state.go('tabs.dashboard');
                            });
                        } else {
                            $rootScope.maintain.units = $scope.units;
                            $state.go('tabs.dashboard');
                        }
                        break;

                    default:
                        break;
                }
            }


            $scope.generateMaintainDailyOrder=function () {

                var orderId = null;
                //已选维修厂
                if ($scope.unit !== undefined && $scope.unit !== null) {

                    var order=null;
                    $http({
                        method: "POST",
                        url: Proxy.local() + "/svr/request",
                        headers: {
                            'Authorization': "Bearer " + $rootScope.access_token
                        },
                        data: {
                            request: 'getServicePersonByMaintenance',
                            info: {
                                maintenance: $scope.unit
                            }
                        }
                    }).then(function (res) {
                        var json = res.data;
                        if (json.re == 1) {
                            var servicePerson = json.data;

                            $scope.maintain.servicePersonId = servicePerson.servicePersonId;
                            var maintain=$scope.maintain;
                            maintain.carId=$scope.carInfo.carId;
                            maintain.servicePlaceId=$scope.unit.unitId;
                            maintain.orderState=2;
                            maintain.applyTime=new Date();
                            return $http({
                                method: "POST",
                                url: Proxy.local() + "/svr/request",
                                headers: {
                                    'Authorization': "Bearer " + $rootScope.access_token
                                },
                                data: {
                                    request: 'generateCarServiceOrder',
                                    info: {
                                        maintain:maintain,
                                        serviceType:$scope.maintain.serviceType,
                                        subServiceTypes:$scope.maintain.subServiceTypes
                                    }
                                }
                            });
                        } else {
                            var alertPopup = $ionicPopup.alert({
                                title: '错误',
                                template: '该维修厂没有指定服务人员'
                            });
                            throw new Error(2,'no servicePerson');
                        }
                    }).then(function(res) {

                        var json = res.data;
                        if (json.re == 1) {
                            orderId=json.data.orderId;
                            var serviceName = $scope.maintain.serviceName;
                            order=json.data;
                            var servicePersonId = [];
                            servicePersonId.push(order.servicePersonId);
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
                                        orderId:order.orderId,
                                        serviceItems: $scope.maintain.subServiceTypes,
                                        servicePersonId: order.servicePersonId,
                                        serviceName: serviceName,
                                        type: 'to-servicePerson',
                                        subType:'customer_appoint'
                                    }
                                }
                            });
                        } else {
                            return ({re: -1});
                        }
                    }).then(function (res) {
                        var json = res.data;
                        if (json.re == 1) {}
                        else if(json.re==2) {
                            console.error(json.data);
                        }else{}

                        //检查是否需要上传附件信息
                        $scope.audioCheck(order.orderId).then(function(json) {
                            if (json.re == 1) {
                                console.log('音频附件上传成功')
                            }
                            else
                            {}
                            return $scope.videoCheck(order.orderId);
                        }).then(function(json) {
                            if (json.re == 1) {
                                console.log('视频附件上传成功')
                            }
                            else
                            {}
                        });

                        $rootScope.flags.serviceOrders.clear=true;
                        $rootScope.flags.serviceOrders.onFresh=true;
                        $rootScope.flags.serviceOrders.tabIndex=1;
                        $state.go('service_orders');
                    }).catch(function (err) {
                        var str = '';
                        for (var field in err)
                            str += 'field='+field+'\r\n'+err[field];
                        alert(str);
                    });
                }
                else//未选定服务人员
                {
                    var order = null;
                    var servicePersonIds = [];
                    var personIds = [];
                    var maintain=$scope.maintain;
                    maintain.carId=$scope.carInfo.carId;

                    $http({
                        method: "POST",
                        url: Proxy.local() + "/svr/request",
                        headers: {
                            'Authorization': "Bearer " + $rootScope.access_token
                        },
                        data: {
                            request: 'generateCarServiceOrder',
                            info: {
                                maintain: maintain
                            }
                        }
                    }).then(function (res) {
                        var json=res.data;
                        if (json.re == 1) {
                            order=json.data;
                            servicePersonIds=$scope.verify.servicePersonIds;
                            personIds=$scope.verify.personIds;

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
                            alert('go into service');
                            var serviceName = $scope.serviceTypeMap[$scope.maintain.serviceType];
                            order.candidateState=1;
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
                                        serviceItems: $scope.maintain.subServiceTypes,
                                        servicePersonIds: servicePersonIds,
                                        serviceName: serviceName,
                                        type: 'to-servicePerson'
                                    }
                                }
                            });
                        } else {
                            return ({re: -1});
                        }
                    }).then(function (res) {
                        var json = res.data;
                        console.log('**************go into media check*****************');
                        $scope.videoCheck(order.orderId).then(function (json) {
                            alert('result of videocheck=\r\n' + json);
                            if (json.re == 1) {
                                alert('附件上传成功');
                            }
                            else
                            {}
                        });
                        $scope.audioCheck(order.orderId).then(function(json) {
                            alert('result of audioCheck=\r\n' + json);
                            if(json.re==1) {
                                alert('音频附件上传成功');
                            }else{}
                        });
                        $rootScope.flags.serviceOrders.onFresh=true;
                        $state.go('service_orders');

                    }).catch(function (err) {
                        var str = '';
                        for (var field in err)
                            str += 'field='+field+'\r\n'+err[field];
                        alert('error=\r\n' + str);
                    });

                }
            }



        //创建新的用户地址
        $scope.createNewCustomerPlace=function () {
            var deferred=$q.defer();
            var destination=$scope.maintain.destination;
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


        $scope.preCheck=function () {
            if ($scope.maintain.estimateTime !== undefined && $scope.maintain.estimateTime !== null) {
                var flag=false;
                if($scope.unit==undefined||$scope.unit==null)
                {
                    if(!$scope.appointMode)
                    {
                        flag=true;
                        var confirmPopup = $ionicPopup.confirm({
                            title: '信息',
                            template: '您未选择维修厂\r\n切换到指派模式可以由系统负责指派维修厂，是否现在切换'
                        });
                        confirmPopup.then(function(res) {
                            if(res)
                            {
                                $scope.appointMode=true;
                            } else{
                            }
                        })
                    }else
                    {
                        if($scope.units!==undefined&&$scope.units!==null)
                        {}
                    }
                }

                if(flag)
                    return true;


                //TODO:check serviceSegment
                if ($scope.unit !== undefined && $scope.unit !== null) {
                    $scope.unit.unitId=$scope.unit.placeId;
                    $http({
                        method: "POST",
                        url: Proxy.local() + "/svr/request",
                        headers: {
                            'Authorization': "Bearer " + $rootScope.access_token
                        },
                        data: {
                            request: 'getServicePersonByMaintenance',
                            info: {
                                maintenance: $scope.unit
                            }
                        }
                    }).then(function (res) {
                        var json = res.data;
                        if (json.re == 1) {
                            var servicePerson = json.data;

                            var access = $scope.verifyServiceSegment(servicePerson);
                            if (access == false) {
                                var segmentAlert = $ionicPopup.alert({
                                    title: '错误',
                                    template: '你所选的预约时间不在工作人员时段,请重新选择'
                                });
                                return {re:-1};
                            }else{
                                return {re: 1};
                            }
                        }
                    }).then(function (json) {
                        if(json.re==1) {

                            if($scope.maintain.destination!==undefined&&$scope.maintain.destination!==null&&
                                ($scope.maintain.destination.placeId==undefined||$scope.maintain.destination.placeId==null))
                            {
                                //TODO:create a new destination
                                $scope.createNewCustomerPlace().then(function (json) {
                                    if(json.re==1) {
                                        var customerPlace=json.data;
                                        $scope.maintain.destination=customerPlace;
                                        $scope.applyMaintainDailyOrder();
                                    }else if(json.re==2) {
                                    }else{}
                                })
                            }else{
                                $scope.applyMaintainDailyOrder();
                            }
                        }else{
                        }
                    })

                }else{
                    var servicePersonIds = [];
                    var personIds = [];

                    //TODO:verify serviceSegment
                    $scope.units.map(function (unit, i) {
                        if(unit.placeId!==undefined&&unit.placeId!==null)
                            unit.unitId=unit.placeId;
                    });
                    $http({
                        method: "POST",
                        url: Proxy.local() + "/svr/request",
                        headers: {
                            'Authorization': "Bearer " + $rootScope.access_token
                        },
                        data: {
                            request: 'getServicePersonsByUnits',
                            info: {
                                units: $scope.units
                            }
                        }
                    }).then(function (res) {
                        var json=res.data;
                        if(json.re==1) {

                            for (var i = 0; i < json.data.length; i++) {
                                var servicePerson = json.data[i];
                                var flag = $scope.verifyServiceSegment(servicePerson);
                                if (flag == false) {
                                } else {
                                    servicePersonIds.push(servicePerson.servicePersonId);
                                    personIds.push(servicePerson.personId);
                                }
                            }

                            if(servicePersonIds.length==0)
                            {
                                var segmentAlert = $ionicPopup.alert({
                                    title: '错误',
                                    template: '你所选的预约时间不在工作人员时段,请重新选择'
                                });
                                return {re:-1};
                            }else{
                                $scope.verify={
                                    servicePersonIds:servicePersonIds,
                                    personIds:personIds
                                };
                                return ({re: 1});
                            }
                        }else{
                            return {re: -1};
                        }
                    }).then(function (json) {
                        if(json.re==1) {
                            if($scope.maintain.destination!==undefined&&$scope.maintain.destination!==null&&
                                ($scope.maintain.destination.placeId==undefined||$scope.maintain.destination.placeId==null))
                            {
                                //TODO:create a new destination
                                $scope.createNewCustomerPlace().then(function (json) {
                                    if(json.re==1) {
                                        var customerPlace=json.data;
                                        $scope.maintain.destination=customerPlace;
                                        $scope.applyMaintainDailyOrder();
                                    }else if(json.re==2) {
                                    }else{}
                                })
                            }else{
                                $scope.applyMaintainDailyOrder();
                            }
                        }else{}
                    })
                }

            }else{
                var alertPopup = $ionicPopup.alert({
                    title: '警告',
                    template: '请填写预约时间'
                });
            }
        }


        //提交维修服务订单
        $scope.applyMaintainDailyOrder=function() {


            //TODO:fetch scoreTotal from insurance_customer
            $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data: {
                    request: 'fetchScoreBalance'
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
                                serviceType: $scope.maintain.serviceType,
                                subServiceTypes: $scope.maintain.subServiceTypes
                            }
                        }
                    }).then(function (res) {
                        var json=res.data;
                        if(json.re==1) {
                            var fee=json.data;
                            $scope.maintain.fee=fee;
                            if(fee<=score)
                            {

                                $scope.generateMaintainDailyOrder();

                            }else{
                                var alertPopup = $ionicPopup.alert({
                                    title: '警告',
                                    template: '服务订单的费用超过您现在的积分'
                                });
                            }
                        }
                    });
                }else{
                    var alertPopup = $ionicPopup.alert({
                        title: '警告',
                        template: '您没有合法积分'
                    });
                }
            }).catch(function(err) {
                var str='';
                for(var field in err)
                    str+=err[field];
                console.error('err=\r\n'+str);
            })

        }



    })
