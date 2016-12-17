/**
 * Created by dingyiming on 2016/12/7.
 * height of navigator is 44px
 */
angular.module('starter')
    .controller('mapDistrictResultController',function($scope,$state,$ionicActionSheet,
                                                       $rootScope,$ionicPopup,$http, Proxy,
                                                       $stateParams,$ionicLoading,BaiduMapService){

        $scope.go_back=function(){
            window.history.back();
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



        //范围搜索
        $scope.fetchDistrictRecords=function () {
            switch($scope.service)
            {
                case 'administrator':
                    $scope.fetchDetectUnitsInArea();
                    break;
                case 'paper_validate':

                    break;
                case 'airport':

                    break;
                case 'park_car':

                    break;
                default:
                    break;
            }
        }

        //拉取数据
        BaiduMapService.getBMap().then(function (res) {
            $scope.BMap = res;
            $scope.fetchDistrictRecords();
        });




        $scope.results=[
            {name:'北京市'},{name:'深圳市'}
        ];

        $scope.navigate=function (town) {
            //$state.go('map_administrator_show', {params: JSON.stringify({town: town})});
            $state.go('angular_baidu_map', {params: JSON.stringify({town: town})});
        }


    })