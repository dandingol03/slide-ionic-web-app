/**
 * Created by dingyiming on 2016/12/7.
 * height of navigator is 44px
 */
angular.module('starter')
    .controller('mapDistrictResultController',function($scope,$state,$ionicActionSheet,
                                                       $rootScope,$ionicPopup,$http, Proxy,
                                                       $stateParams,$ionicLoading,$ionicNativeTransitions){

        $scope.go_back=function(){
            $ionicNativeTransitions.stateGo('gaode_service_select', {}, {}, {
                "type": "slide",
                "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
                "duration": 240, // in milliseconds (ms), default 400
            });
        }

        $scope.title='审车';
        $scope.service='administrator';
        //当前搜索结果计数
        $scope.recordCount=0;

        if($stateParams.params!==undefined&&$stateParams.params!==null&&$stateParams.params!='')
        {
            var params=$stateParams.params;
            if(Object.prototype.toString.call(params)=='[object String]')
                params=JSON.parse(params);
            switch(params.service)
            {
                case 'administrator':
                    $scope.title='审车';
                    $scope.service='administrator';
                    break;
                case 'paper_validate':
                    $scope.title='审证';
                    $scope.service='paper_validate';
                    break;
                case 'airport':
                    $scope.title='接送机';
                    $scope.service='airport';
                    break;
                case 'park_car':
                    $scope.title='接送站';
                    $scope.service='park_car';
                    break;
                case 'maintain':
                    $scope.maintain=params.maintain;
                    $scope.title='维修';
                    $scope.service='maintain';
                    $scope.type=params.type;
                    break;
            }

        }

        //检测公司搜索
        $scope.fetchDetectUnitsInArea=function () {
            $ionicLoading.show({
                template: '<p class="item-icon-left">搜索检测公司数据...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
            });

            $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data: {
                    request: 'fetchDetectUnitsInArea',
                    info: {
                    }
                }
            }).then(function (res) {
                var json = res.data;
                var BMap=null;
                if($scope.BMap!==undefined&&$scope.BMap!==null)
                    BMap=$scope.BMap;
                if (json.re == 1) {
                    $scope.records = {};
                    $scope.recordCount=0;
                    json.data.map(function (place, i) {
                        if (place.longitude !== undefined && place.longitude !== null &&
                            place.latitude !== undefined && place.latitude !== null&&
                            place.town!==undefined&&place.town!==null&&place.town!='') {

                            if($rootScope.gaodeHome!==undefined&&$rootScope.gaodeHome!==null)
                            {
                                var map=$rootScope.gaodeHome;
                                var center = map.getCenter();
                                var distance = map.getDistance(center, new BMap.Point(place.longitude, place.latitude)).toFixed(2);
                            }

                            if (distance <= 25000)
                            {
                                $scope.recordCount++;
                                place.distance=distance;
                                if($scope.records[place.town]==undefined||$scope.records[place.town]==null)
                                    $scope.records[place.town]=[place];
                                else
                                    $scope.records[place.town].push(place);
                            }
                        }
                    });
                    $ionicLoading.hide();
                }else{
                    $ionicLoading.hide();
                    if(window.cordova)
                    {
                        $cordovaToast
                            .show('未搜索出任何结果', 'short', 'center')
                            .then(function(success) {
                            }, function (error) {
                            });
                    }else{
                        var myPopup = $ionicPopup.alert({
                            template: '未搜索出任何结果',
                            title: '<strong style="color:red">信息</strong>'
                        });
                    }
                }

            }).catch(function (err) {
                var str = '';
                for (var field in err)
                    str += err[field];
                console.error('error=\r\n' + str);
                $ionicLoading.hide();
            })
        }

        //车管所搜索
        $scope.fetchCarManageStation=function () {
            $ionicLoading.show({
                template: '<p class="item-icon-left">搜索车管所数据...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
            });

            $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data: {
                    request: 'fetchServicePlacesInArea',
                    info: {
                    }
                }
            }).then(function (res) {
                var json = res.data;
                var map=null;
                var center=null;
                var BMap=null;
                if($scope.BMap!==undefined&&$scope.BMap!==null)
                    BMap=$scope.BMap;
                else
                    BMap=window.BMap;
                if (json.re == 1) {
                    $scope.records = {};
                    $scope.recordCount=0;

                    $scope.places = [];

                    if($rootScope.gaodeHome!==undefined&&$rootScope.gaodeHome!==null)
                    {
                        map=$rootScope.gaodeHome;
                        center = map.getCenter();
                    }
                    json.data.map(function (station, i) {
                        if (station.longitude !== undefined && station.longitude !== null &&
                            station.latitude !== undefined && station.latitude !== null&&
                            station.town!==undefined&&station.town!==null&&station.town!='') {


                            var distance = map.getDistance(center, new BMap.Point(station.longitude, station.latitude)).toFixed(2);

                            if (distance <= 25000)
                            {
                                $scope.recordCount++;
                                station.distance=distance;
                                if($scope.records[station.town]==undefined||$scope.records[station.town]==null)
                                    $scope.records[station.town]=[station];
                                else
                                    $scope.records[station.town].push(station);
                            }
                        }
                    });
                    $ionicLoading.hide();

                }else{
                    $ionicLoading.hide();
                    if(window.cordova)
                    {
                        $cordovaToast
                            .show('未搜索出任何结果', 'short', 'center')
                            .then(function(success) {
                            }, function (error) {
                            });
                    }else{
                        var myPopup = $ionicPopup.alert({
                            template: '未搜索出任何结果',
                            title: '<strong style="color:red">信息</strong>'
                        });
                    }
                }

            }).catch(function (err) {
                var str = '';
                for (var field in err)
                    str += err[field];
                console.error('error=\r\n' + str);
                $ionicLoading.hide();
            })
        }

        //维修厂搜索
        $scope.fetchMaintenance=function () {
            $ionicLoading.show({
                template: '<p class="item-icon-left">拉取维修厂数据...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
            });

            $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data: {
                    request: 'fetchMaintenanceInArea',
                    info: {
                    }
                }
            }).then(function (res) {
                var json = res.data;
                var map=null;
                var center=null;
                var BMap=null;
                if($scope.BMap!==undefined&&$scope.BMap!==null)
                    BMap=$scope.BMap;
                else
                    BMap=window.BMap;
                if (json.re == 1) {
                    $scope.records={};
                    $scope.recordCount=0;
                    $scope.units = [];
                    if($rootScope.gaodeHome!==undefined&&$rootScope.gaodeHome!==null)
                    {
                        map=$rootScope.gaodeHome;
                        center=map.getCenter();
                    }

                    json.data.map(function (unit, i) {
                        if (unit.longitude !== undefined && unit.longitude !== null &&
                            unit.latitude !== undefined && unit.latitude !== null&&
                            unit.town!==undefined&&unit.town!==null&&unit!='') {

                            var center = map.getCenter();
                            var distance = map.getDistance(center, new BMap.Point(unit.longitude, unit.latitude)).toFixed(2);
                            if (distance <= 20000)
                            {
                                $scope.recordCount++;
                                unit.distance=distance;

                                    if($scope.records[unit.town]==undefined||$scope.records[unit.town]==null)
                                        $scope.records[unit.town]=[unit];
                                    else
                                        $scope.records[unit.town].push(unit);

                            }
                        }
                    });
                    $ionicLoading.hide();
                }else{
                    $ionicLoading.hide();
                    if(window.cordova)
                    {
                        $cordovaToast
                            .show('未搜索出任何结果', 'short', 'center')
                            .then(function(success) {
                            }, function (error) {
                            });
                    }else{
                        var myPopup = $ionicPopup.alert({
                            template: '未搜索出任何结果',
                            title: '<strong style="color:red">信息</strong>'
                        });
                    }
                }

            }).catch(function (err) {
                var str = '';
                for (var field in err)
                    str += err[field];
                console.error('error=\r\n' + str);
                $ionicLoading.hide();
            })
        }

        //仅针对维修服务拉取数据
        $scope.fetchMaintenanceForMaintainService=function () {
            $ionicLoading.show({
                template: '<p class="item-icon-left">拉取维修厂数据...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
            });

            $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data: {
                    request: 'fetchMaintenanceInArea',
                    info: {
                    }
                },
                timeout:8000
            }).then(function (res) {
                var json = res.data;
                var map=null;
                var center=null;
                var BMap=null;
                if($scope.BMap!==undefined&&$scope.BMap!==null)
                    BMap=$scope.BMap;
                else
                    BMap=window.BMap;
                if (json.re == 1) {
                    $scope.records={};
                    $scope.recordCount=0;
                    $scope.units = [];
                    if($rootScope.maintainHome!==undefined&&$rootScope.maintainHome!==null)
                    {
                        map=$rootScope.maintainHome;
                        center=map.getCenter();
                    }

                    json.data.map(function (unit, i) {
                        if (unit.longitude !== undefined && unit.longitude !== null &&
                            unit.latitude !== undefined && unit.latitude !== null&&
                            unit.town!==undefined&&unit.town!==null&&unit!='') {

                            var center = map.getCenter();
                            var distance = map.getDistance(center, new BMap.Point(unit.longitude, unit.latitude)).toFixed(2);
                            if (distance <= 20000)
                            {
                                $scope.recordCount++;
                                unit.distance=distance;

                                if($scope.records[unit.town]==undefined||$scope.records[unit.town]==null)
                                    $scope.records[unit.town]=[unit];
                                else
                                    $scope.records[unit.town].push(unit);

                            }
                        }
                    });
                    $ionicLoading.hide();
                }else{
                    $ionicLoading.hide();
                    if(window.cordova)
                    {
                        $cordovaToast
                            .show('未搜索出任何结果', 'short', 'center')
                            .then(function(success) {
                            }, function (error) {
                            });
                    }else{
                        var myPopup = $ionicPopup.alert({
                            template: '未搜索出任何结果',
                            title: '<strong style="color:red">信息</strong>'
                        });
                    }
                }

            }).catch(function (err) {
                var str = '';
                for (var field in err)
                    str += err[field];
                console.error('error=\r\n' + str);
                $ionicLoading.hide();
            })
        }



        //范围搜索
        $scope.fetchDistrictRecords=function () {
            switch($scope.service)
            {
                case 'administrator':
                    $scope.fetchDetectUnitsInArea();
                    break;
                case 'paper_validate':
                    $scope.fetchCarManageStation();
                    break;
                case 'airport':
                    $scope.fetchMaintenance();
                    break;
                case 'park_car':
                    $scope.fetchMaintenance();
                    break;
                case 'maintain':
                    $scope.fetchMaintenanceForMaintainService();
                    break;
                default:
                    break;
            }
        }

        $scope.refresh=function () {
            $scope.fetchDistrictRecords();
        }

        // //拉取数据
        // BaiduMapService.getBMap().then(function (res) {
        //     $scope.BMap = res;
        //     $scope.fetchDistrictRecords();
        // });


        if($rootScope.gaodeHome!==undefined&&$rootScope.gaodeHome!==null)
        {
            $scope.map=$rootScope.gaodeHome;
            if(window.BMap!==undefined&&window.BMap!==null)
            {
                $scope.BMap=window.BMap;
                $scope.fetchDistrictRecords();
            }else{
                BMapService.getBMap().then(function(BMap) {
                    console.log('BMap has loaded into window Object');
                })
            }
        }

        //针对维修服务
        if($rootScope.maintainHome!==undefined&&$rootScope.maintainHome!==null)
        {
            $scope.map=$rootScope.maintainHome;
            if(window.BMap!==undefined&&window.BMap!==null)
            {
                $scope.BMap=window.BMap;
                $scope.fetchMaintenanceForMaintainService();
            }else{
                BMapService.getBMap().then(function(BMap) {
                    console.log('BMap has loaded into window Object');
                })
            }
        }


        $scope.navigate=function (town) {
            //$state.go('map_administrator_show', {params: JSON.stringify({town: town})});
            if($scope.service!='maintain')
                $state.go('angular_baidu_map', {params: JSON.stringify({service:$scope.service,town: town})});
            else
                $state.go('angular_baidu_map', {params: JSON.stringify({
                    service:$scope.service,
                    maintain:$scope.maintain,
                    town: town,
                    type:$scope.type
                })});
        }


    })
