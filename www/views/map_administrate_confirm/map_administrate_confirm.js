/**
 * Created by danding on 16/9/6.
 * 山大默认经纬度为117.144816,36.672171
 * 1.$scope.maintain.maintenance,保存选中的维修厂
 */
angular.module('starter')

    .controller('mapAdministrateConfirmController',function($scope,$state,$http,$timeout,$rootScope,
                                                          $ionicModal, Proxy,$stateParams,$q,
                                                          $ionicActionSheet,$cordovaDatePicker) {

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

        $scope.carManage={

        };

        $scope.servicePlace=null;


        if ($stateParams.contentInfo !== undefined && $stateParams.contentInfo !== null) {
            $scope.contentInfo=$stateParams.contentInfo;
            if(Object.prototype.toString.call($scope.contentInfo)=='[object String]')
                $scope.contentInfo=JSON.parse($scope.contentInfo);
            if($scope.contentInfo.place!==undefined&&$scope.contentInfo.place!==null)
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
            if($scope.carInfo.carNum!==undefined&&$scope.carInfo.carNum!==null)
                data.carNum=$scope.carInfo.carNum;


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


        $scope.generateServiceOrder=function(){

            //inject
            $scope.carManage.carId=$scope.carInfo.carId;

            if($scope.carManage.estimateTime!==undefined&&$scope.carManage.estimateTime!==null
                &&$scope.carManage.carId!=undefined&&$scope.carManage.estimateTime!=null)
            {
                var place=$scope.place;
                var places=$scope.places;

                //所选车管所
                var servicePlace=$scope.servicePlace.name;
                //审车
                $scope.carManage.serviceType=21;
                if(place!==undefined&&place!==null)//已选维修厂
                {
                    $scope.carManage.servicePlaceId=place.placeId;
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

                    }).then(function(res) {
                        var json = res.data;
                        if (json.re == 1) {

                            var serviceName = '车驾管-审车';
                            var order=json.data;
                            var servicePersonIds = [order.servicePersonId];
                            var serviceItems=$scope.maintain.subServiceTypes;
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
                }else//未选定维修厂
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
                                carManage: $scope.carManage,
                                servicePlace:servicePlace
                            }
                        }
                    }).then(function (res) {
                        var json = res.data;
                        if (json.re == 1) {
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
                                        units: units
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
                    }).catch(function (err) {
                        var str = '';
                        for (var field in err)
                            str += err[field];
                        console.error('error=\r\n' + str);
                    });

                }

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

        $scope.Toggle = function (item, field) {
            if (item[field] == true)
                item[field] = false;
            else
                item[field] = true;
        };

        $scope.Set = function (item, field, value) {
            item[field] = value;
        }





        //选择车管所
        $scope.servicePlace_select = function (servicePlace, label) {
            if ($scope.servicePlace !== undefined && $scope.servicePlace !== null) {
                $scope.servicePlace = null;
                label.setStyle({color: '#222', 'font-size': '0.8em'});
            }
            else
            {

                label.setStyle({
                    color: '#00f'
                });

                $scope.$apply(function(){
                    $scope.servicePlace = servicePlace;
                });

                $scope.servicePlaceLabels.map(function (item, i) {
                    if (item.getContent().trim() != label.getContent().trim())
                        item.setStyle({color: '#222', 'font-size': '0.8em'});
                });

                //渲染5公里的维修厂
                var ll=new BMap.Point(servicePlace.longitude, servicePlace.latitude);
                $scope.unitsInTown.map(function (unit, i) {
                    if (unit.longitude !== undefined && unit.longitude !== null &&
                        unit.latitude !== undefined && unit.latitude !== null) {

                        var distance = map.getDistance(ll, new BMap.Point(unit.longitude, unit.latitude)).toFixed(2);
                        if (distance <= 5000)
                            $scope.units.push(unit);
                    }
                });

                //移除周边维修厂覆盖物
                if($scope.unitOverlays!==undefined&&$scope.unitOverlays!==null&&$scope.unitOverlays.length>0)
                {
                    $scope.unitOverlays.map(function(overlay,i) {
                        map.removeOverlay(overlay);
                    })
                }

                $scope.unitOverlays=[];

                $scope.unitLabels=[];

                $scope.units.map(function (unit, i) {
                    var bIcon = new BMap.Icon('img/mark_b.png', new BMap.Size(100,100));
                    var mk = new BMap.Marker(new BMap.Point(unit.longitude, unit.latitude),{icon:bIcon});
                    map.addOverlay(mk);
                    var label = new BMap.Label(unit.unitName, {offset: new BMap.Size(20, -10)});
                    label.setStyle({
                        color: '#222',
                        fontSize: "12px",
                        height: "20px",
                        lineHeight: "20px",
                        fontFamily: "微软雅黑",
                        border: '0px'
                    });
                    mk.addEventListener("click", $scope.marker_select.bind(this, unit, label));
                    mk.setLabel(label);
                    $scope.unitOverlays.push(mk);
                    $scope.unitLabels.push(label);
                });


            }
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



        BaiduMapService.getBMap().then(function (res) {
            $scope.bMap = res;
            var BMap = $scope.bMap;
            $scope.init_map(BMap).then(function(json) {
                if(json.re=1) {
                    return $scope.fetchServicePlacesInArea();
                }
            }).then(function(json) {
                //添加'您的位置'
                var map=$scope.map;
                var mk = new BMap.Marker($scope.point);
                mk.setAnimation(BMAP_ANIMATION_BOUNCE);
                map.addOverlay(mk);
                var label = new BMap.Label("您的位置", {offset: new BMap.Size(20, -10)});
                label.setStyle({
                    color: '#222',
                    fontSize: "12px",
                    height: "20px",
                    lineHeight: "20px",
                    fontFamily: "微软雅黑",
                    border: '0px'
                });
                mk.setLabel(label);




                var posOptions = {timeout: 10000, enableHighAccuracy: false};
                $cordovaGeolocation
                    .getCurrentPosition(posOptions)
                    .then(function (position) {
                        var lat = position.coords.latitude;
                        var lng = position.coords.longitude;
                        console.log(lng + ',' + lat);
                        var ggPoint = new BMap.Point(lng, lat);
                        var convertor = new BMap.Convertor();
                        var pointArr = [];
                        pointArr.push(ggPoint);

                        var translateCallback = function (data) {
                            if (data.status === 0) {
                                var marker = new BMap.Marker(data.points[0]);
                                //map.addOverlay(marker);
                                var label = new BMap.Label("转换后的百度坐标（正确）", {offset: new BMap.Size(20, -10)});
                                marker.setLabel(label); //添加百度label
                                //map.setCenter(data.points[0]);
                            }
                        }

                        convertor.translate(pointArr, 1, 5, translateCallback)


                    }, function (err) {
                        // error
                        console.error('error=\r\n' + err.toString());
                    });


            }).catch(function(err) {
                var str='';
                for(var field in err)
                    str+=err[field];
                console.error('err=\r\n'+str);
            })


            //var geolocation = new BMap.Geolocation();
            //geolocation.getCurrentPosition(function(r){
            //  if(this.getStatus() == BMAP_STATUS_SUCCESS){
            //    //var mk = new BMap.Marker(r.point);
            //    //map.addOverlay(mk);
            //    //map.panTo(r.point);
            //
            //    //map.setCenter(new BMap.Point(r.point.lng, r.point.lat));
            //
            //
            //    var pointArr = [];
            //    alert(r.point.lng + ',' + r.point.lat);
            //
            //
            //  }
            //  else {
            //    alert('failed'+this.getStatus());
            //  }
            //},{enableHighAccuracy: true});

        });
    })
