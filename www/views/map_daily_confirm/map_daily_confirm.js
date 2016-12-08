/**
 * Created by danding on 16/9/6.
 * 山大默认经纬度为117.144816,36.672171
 * 1.$scope.maintain.maintenance,保存选中的维修厂
 */
angular.module('starter')

    .controller('mapDailyConfirmController',function($scope,$state,$http,$timeout,$rootScope,
                                                     Proxy,$stateParams, ionicDatePicker,
                                                     $ionicActionSheet, $cordovaDatePicker,$q,
                                                     $cordovaFileTransfer, $ionicPopup,$ionicLoading) {


        $scope.go_back = function () {
            alert('go back');
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
                    alert(date);
                    item[field]=date;
                    $scope.selectTime=true;

                }).catch(function(err) {
                    $scope.selectTime=true;
                });
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
                    $scope.maintain.servicePerson=json.data;
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


        //查询已绑定车辆,并显示车牌信息
        $scope.selectCarInfoByCarNum=function(item,modal){

            var data={
                request:'fetchInsuranceCarInfoByCustomerId'
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
                    var cars=json.data;
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
                            $scope.go_to('create_new_customerPlace')
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
            alert('audiochecking.....');
            alert('resourceulr=' + $scope.maintain.description.audio);
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
                        alert('....');
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
                                        serviceItems: $scope.maintain.subServiceTypes,
                                        servicePersonIds: servicePersonId,
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
                        if (json.re == 1) {}
                        else if(json.re==2) {
                            console.error(json.data);
                        }else{}
                        alert('service order has been generated');
                        //检查是否需要上传附件信息
                        $scope.audioCheck(order.orderId).then(function(json) {
                            alert('result of audiocheck=\r\n' + json);
                            if (json.re == 1) {
                                console.log('音频附件上传成功')
                            }
                            else
                            {}
                            return $scope.videoCheck(order.orderId);
                        }).then(function(json) {
                            alert('result of videocheck=\r\n' + json);
                            if (json.re == 1) {
                                console.log('视频附件上传成功')
                            }
                            else
                            {}
                        });

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
                        var json = res.data;
                        if (json.re == 1) {
                            order = json.data;
                            return $http({
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
                            alert('go into service');
                            var serviceName = $scope.serviceTypeMap[$scope.maintain.serviceType];
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
                        $state.go('service_orders');

                    }).catch(function (err) {
                        var str = '';
                        for (var field in err)
                            str += 'field='+field+'\r\n'+err[field];
                        alert('error=\r\n' + str);
                    });

                }
            }


            //提交维修服务订单
            $scope.applyMaintainDailyOrder=function() {

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
                                    $scope.switchAppointMode();
                                }else{
                                }
                            })
                        }else
                        {
                            var map=$scope.map;
                            var BMap=$scope.bMap;
                            if($scope.wholeUnits!==undefined&&$scope.wholeUnits!==null)
                            {
                                $scope.units=[];
                                $scope.wholeUnits.map(function (unit, i) {
                                    if (unit.longitude !== undefined && unit.longitude !== null &&
                                        unit.latitude !== undefined && unit.latitude !== null) {
                                        var center = $scope.map.getCenter();
                                        var distance = map.getDistance(center, new BMap.Point(unit.longitude, unit.latitude)).toFixed(2);
                                        if (parseFloat(distance) <= 10000)
                                            $scope.units.push(unit);
                                    }
                                    if($scope.units.length>0)
                                    {}else{
                                        flag=true;
                                        var alertPopup = $ionicPopup.alert({
                                            title: '信息',
                                            template: '您所设定的指派中心周边没有可指派的维修厂,请重新设定指派中心'
                                        });
                                    }
                                });
                            }


                        }

                    }

                    if(flag)
                        return true;

                    if($scope.carInfo!==undefined&&$scope.carInfo!==null&&$scope.carInfo.carId!==undefined&&$scope.carInfo.carId!==null)
                    {

                        //TODO:fetch scoreTotal from insurance_customer
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
                                            serviceType: $scope.maintain.serviceType,
                                            subServiceTypes: $scope.maintain.subServiceTypes
                                        }
                                    }
                                }).then(function (res) {
                                    var json=res.data;
                                    if(json.re==1) {
                                        var fee=json.data;
                                        $scope.maintain.fee=fee;
                                        if(fee>=score)
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
                                                        carId: $scope.carInfo.carId
                                                    }
                                                }
                                            }).then(function (res) {
                                                var json=res.data;
                                                if(json.data==true)
                                                {


                                                    var confirmPopup = $ionicPopup.confirm({
                                                        title: '信息',
                                                        template: '您所选的车已有还未完成的服务订单\r\n是否仍要继续提交订单'
                                                    });
                                                    confirmPopup.then(function(res) {
                                                        if(res) {
                                                            $scope.generateMaintainDailyOrder();
                                                        } else {
                                                            return;
                                                        }
                                                    });
                                                }else{
                                                    //车是自由状态
                                                    $scope.generateMaintainDailyOrder();

                                                }
                                            });
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

                    }else{
                        var alertPopup = $ionicPopup.alert({
                            title: '警告',
                            template: '请填写车牌'
                        });
                    }

                }else{
                    var alertPopup = $ionicPopup.alert({
                        title: '警告',
                        template: '请填写预约时间'
                    });
                }
            }



    })
