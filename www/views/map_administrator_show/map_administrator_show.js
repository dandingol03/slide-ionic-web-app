/**
 * Created by danding on 16/12/17.
 */
/**
 * Created by danding on 16/9/6.
 * 山大默认经纬度为117.144816,36.672171
 * 1.$scope.maintain.maintenance,保存选中的维修厂
 */
angular.module('starter')

    .controller('mapAdministrateShowController',function($scope,$state,$http,$timeout,$rootScope,
                                                           BaiduMapService,$cordovaGeolocation,$ionicModal,
                                                           Proxy,$stateParams, $q,$ionicLoading,$ionicPopup) {

        $scope.goBack=function () {
            window.history.back();
        }

        if($stateParams.params!==undefined&&$stateParams.params!==null&&$stateParams.params!='')
        {
            var params=$stateParams.params;
            if(Object.prototype.toString.call(params)=='[object String]')
                params=JSON.parse(params);
            if(params.town!==undefined&&params.town!==null&&params.town!='')
                $scope.town=params.town;
        }



        $timeout(function() {
            $scope.mapStyle={width:'100%',height:(screen.height*3)/5+'px'};
        },1000);

        $scope.resultPanelStyle={border:'0px',padding: '0px',width:'100%',height:(screen.height*2)/5};

        $scope.root={
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


        $scope.Toggle = function (item, field) {
            if (item[field] == true)
                item[field] = false;
            else
                item[field] = true;
        };

        $scope.Set = function (item, field, value) {
            item[field] = value;
        }



        //根据所传参数搜索周边
        $scope.fetchDistrict=function () {

            var BMao=$scope.BMap;
            var map=$scope.map;

            $scope.gravity={longitude:0,latitude:0};


            $ionicLoading.show({
                template: '<p class="item-icon-left">搜索...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
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
                        townName: $scope.town
                    }
                }
            }).then(function (res) {
                var json = res.data;
                var map=$scope.map;
                var personHome=null;
                if($rootScope.gaodeHome!==undefined&&$rootScope.gaodeHome!==null)
                    personHome=$rootScope.gaodeHome;
                var BMap=$scope.BMap;
                if (json.re == 1) {
                    $scope.places = [];
                    json.data.map(function (place, i) {
                        if (place.longitude !== undefined && place.longitude !== null &&
                            place.latitude !== undefined && place.latitude !== null) {
                            var personLocate = personHome.getCenter();
                            var distance = map.getDistance(personLocate, new BMap.Point(place.longitude, place.latitude)).toFixed(2);
                            if($scope.distanceMax!==undefined&&$scope.distanceMax!==null)
                            {
                                if(distance>$scope.distanceMax)
                                    $scope.distanceMax=distance;
                            }else{
                                $scope.distanceMax=distance;
                            }
                            if (distance <= 25000)
                            {
                                place.distance=distance;
                                place.unitName=place.name;
                                $scope.gravity.longitude+=place.longitude;
                                $scope.gravity.latitude+=place.latitude;
                                $scope.places.push(place);
                            }
                        }
                    });
                    //remove previous markers
                    map.clearOverlays();
                    var mk=$scope.mk;
                    if(mk!==undefined&&mk!==null)
                    {
                        var label = new BMap.Label("您", {offset: new BMap.Size(20, -10)});
                        label.setStyle({
                            color: '#222',
                            fontSize: "12px",
                            height: "20px",
                            lineHeight: "20px",
                            fontFamily: "微软雅黑",
                            border: '0px'
                        });
                        mk.setLabel(label);
                        map.addOverlay(mk);
                    }

                    //render new markers
                    $scope.labels = [];
                    $scope.places.map(function (place, i) {
                        var mk = new BMap.Marker(new BMap.Point(place.longitude, place.latitude));
                        var label = new BMap.Label(place.name, {offset: new BMap.Size(20, -10)});
                        label.setStyle({
                            color: '#222',
                            fontSize: "12px",
                            height: "20px",
                            lineHeight: "20px",
                            fontFamily: "微软雅黑",
                            border: '0px'
                        });
                        mk.setLabel(label);
                        map.addOverlay(mk);
                    });


                    $ionicLoading.hide();
                    $scope.mapPanTo();

                }else{
                    $ionicLoading.hide();
                    var myPopup = $ionicPopup.alert({
                        template: '未搜索出任何结果',
                        title: '<strong style="color:red">信息</strong>'
                    });
                }

            }).catch(function (err) {
                var str = '';
                for (var field in err)
                    str += err[field];
                console.error('error=\r\n' + str);
                $ionicLoading.hide();
            })
        }








        $scope.clickFunc=function (e) {
            console.log('click point=' + e.point.lng + ',' + e.point.lat);
            $scope.destiny={lng: e.point.lng,lat: e.point.lat};
            var BMap=$scope.bMap;
            var bIcon = new BMap.Icon('img/mark_b.png', new BMap.Size(20,25));
            var mk = new BMap.Marker(e.point,{icon:bIcon});  // 创建标注
            var map=$scope.map;
            if($scope.mk!=null&&$scope.mk!=undefined){
                map.removeOverlay($scope.mk);
            }

            map.addOverlay(mk);               // 将标注添加到地图中
            var label = new BMap.Label("指派中心", {offset: new BMap.Size(20, -10)});
            label.setStyle({
                color: '#222',
                fontSize: "12px",
                height: "20px",
                lineHeight: "20px",
                fontFamily: "微软雅黑",
                border: '0px'
            });
            mk.setLabel(label);
            $scope.mk=mk;
            map.panTo(e.point);
            $scope.maintain.center = map.getCenter();

        }


        $scope.mapPanTo=function () {
            var map=$scope.map;
            if($scope.places.length==1)
            {
                //默认定位第一个搜索结果
                var firstPlace=$scope.places[0];
                map.panTo(new BMap.Point(firstPlace.longitude, firstPlace.latitude) );
            }else{
                $scope.gravity.longitude=$scope.gravity.longitude/$scope.places.length;
                $scope.gravity.latitude=$scope.gravity.latitude/$scope.places.length;
                //map pan to gravity center
                map.panTo(new BMap.Point($scope.gravity.longitude, $scope.gravity.latitude) );
            }
        }

        $scope.init_map=function (BMap) {

            var deferred=$q.defer();

            var cb=function () {
                var map = new BMap.Map("map_administrator_show");          // 创建地图实例
                var point = new BMap.Point(117.144816, 36.672171);  // 创建点坐标
                // $scope.point=point;
                map.centerAndZoom(point, 12);
                 map.addControl(new BMap.NavigationControl());
                 map.addControl(new BMap.ScaleControl());
                 map.enableScrollWheelZoom(true);
                $scope.tpMarkers=[];
                $scope.dragF=false;

                //地图添加点击事件
                //map.addEventListener("click", $scope.clickFunc);
                $scope.map=map;
                deferred.resolve({re: 1});
            }
            cb();

            return deferred.promise;
        }




        BaiduMapService.getBMap().then(function (res) {

            $scope.BMap = res;
            var BMap = $scope.BMap;
            $scope.init_map(BMap).then(function(json) {
                if(json.re==1) {
                    $scope.fetchDistrict();
                }
            });


        });
    })
