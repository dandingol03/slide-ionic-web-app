/**
 * Created by danding on 16/9/6.
 * 山大默认经纬度为117.144816,36.672171
 * 1.$scope.maintain.maintenance,保存选中的维修厂
 */
angular.module('starter')

    .controller('mapSearchController',function($scope,$state,$http,$timeout,$rootScope,
                                                         BaiduMapService,$cordovaGeolocation,$ionicModal,
                                                         Proxy,$stateParams, $q) {

        $scope.query=null;

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


        $scope.go_back = function () {
            $rootScope.dashboard.tabIndex=2;
            $rootScope.dashboard.subTabIndex=$scope.locateIndex;
            window.history.back();
        }

        $scope.search=function () {
            var BMao=$scope.bMap;
            var map=$scope.map;
            var local = new BMap.LocalSearch(map, {
                renderOptions: {map: map, panel: "r-result"}
            });
            local.search("餐饮");
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
            $scope.renderCircle(e.point,0.12, 0.1);
        }




        $scope.init_map=function (BMap) {

            var deferred=$q.defer();

            var cb=function () {
                var map = new BMap.Map("map_search");          // 创建地图实例
                var point = new BMap.Point(117.144816, 36.672171);  // 创建点坐标
                $scope.point=point;
                map.centerAndZoom(point, 15);
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


            $scope.bMap = res;
            var BMap = $scope.bMap;

            $scope.init_map(BMap).then(function(json) {
                if(json.re==1) {
                    var map=$scope.map;
                    //添加指派中心覆盖物
                    var point=$scope.point;
                    var bIcon = new BMap.Icon('img/mark_b.png', new BMap.Size(20,25));
                    var mk = new BMap.Marker(point,{icon:bIcon});
                    mk.setAnimation(BMAP_ANIMATION_BOUNCE);
                    $scope.mk=mk;
                    map.addOverlay(mk);
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

                }
            });


        });
    })
