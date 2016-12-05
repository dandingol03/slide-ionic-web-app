/**
 * Created by danding on 16/9/6.
 * 山大默认经纬度为117.144816,36.672171
 * 1.$scope.maintain.maintenance,保存选中的维修厂
 */
angular.module('starter')

    .controller('mapPaperValidateSearchController',function($scope,$state,$http,$timeout,$rootScope,
                                                           BaiduMapService,$ionicModal,
                                                           Proxy,$stateParams, $q,$ionicLoading) {

        if($stateParams.ob!==undefined&&$stateParams.ob!==null)
        {
            $scope.ob=$stateParams.ob;
            if(Object.prototype.toString.call($scope.ob)=='[object String]')
                $scope.ob = JSON.parse($scope.ob);
            if($scope.ob.carInfo!==undefined&&$scope.ob.carInfo!==null)
                $scope.carInfo=$scope.ob.carInfo;
            if($scope.ob.maintain!==undefined&&$scope.ob.maintain!==null)
                $scope.maintain=$scope.ob.maintain;
            //返回的界面索引
            if($scope.ob.locateIndex!==undefined&&$scope.ob.locateIndex!==null)
                $scope.locateIndex=$scope.ob.locateIndex;
        }

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


        $scope.go_back = function () {
            $rootScope.dashboard.tabIndex=3;
            $rootScope.dashboard.subTabIndex=0;
            window.history.back();
        }

        $scope.selectTime=true;

        $scope.mode='servicePlace';

        $scope.blockInStyle={display: 'table-cell','vertical-align': 'middle',background:'#11c1f3',color:'#fff'};
        $scope.blockOffStyle={display: 'table-cell','vertical-align': 'middle',background:'#fff',color:'#666'};

        $scope.modeSwitch=function (mode) {
            if(mode===$scope.mode)
                return;
            $scope.mode=mode;
        }

        $scope.renderCircle=function (cen,x,y) {
            var BMap=$scope.bMap;
            var map=$scope.map;
            if($scope.distanceMax>10000)
            {
                var zoomLevel=map.getZoom();
                if(zoomLevel!=11)
                    map.setZoom(11);
            }
            var center=null;
            if(cen!==undefined&&cen!==null)
                center=cen;
            else
                center=$scope.map.getCenter();
            var assemble=[];
            var angle;
            var dot;
            var tangent=x/y;
            for(var i=0;i<36;i++)
            {
                angle = (2* Math.PI / 36) * i;
                dot = new BMap.Point(center.lng+Math.sin(angle)*y*tangent, center.lat+Math.cos(angle)*y);
                assemble.push(dot);
            }

            var oval = new BMap.Polygon(assemble, {fillColor:'rgba(211, 199, 220, 0.39)',strokeColor:"#fff", strokeWeight:6, strokeOpacity:0.5});
            if($scope.oval!==undefined&&$scope.oval!==null)
                map.removeOverlay($scope.oval);
            $scope.oval=oval;
            map.addOverlay(oval);

        }


        //搜索发式
        $scope.search=function () {

            var BMao=$scope.bMap;
            var map=$scope.map;
            //仅容许根据区进行搜索
            var reg=/\s*(.*区)/
            var re=reg.exec($scope.root.query);
            if(re!==undefined&&re!==null)
            {
                var district=re[1];
                //区搜索
                if(district==undefined||district==null||district=='')
                {
                    return;
                }
            }else{
                return ;
            }

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
                    request: 'fetchServicePlacesInArea',
                    info: {
                        townName: district
                    }
                }
            }).then(function (res) {
                var json = res.data;
                var map=$scope.map;
                var BMap=$scope.bMap;
                if (json.re == 1) {
                    $scope.places = [];
                    json.data.map(function (place, i) {
                        if (place.longitude !== undefined && place.longitude !== null &&
                            place.latitude !== undefined && place.latitude !== null) {
                            var center = map.getCenter();
                            var distance = map.getDistance(center, new BMap.Point(place.longitude, place.latitude)).toFixed(2);
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
                                $scope.places.push(place);
                            }
                        }
                    });
                    //remove previous markers
                    map.clearOverlays();
                    var mk=$scope.mk;
                    if(mk!==undefined&&mk!==null)
                    {
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

                    //render circle
                    $scope.renderCircle(map.getCenter(),0.22,0.2);
                    $scope.contentInfo=$scope.places;
                    $ionicLoading.hide();
                    if($scope.places.length==1)
                    {
                        //默认定位第一个搜索结果
                        var firstPlace=$scope.places[0];
                        map.panTo(new BMap.Point(firstPlace.longitude, firstPlace.latitude) );
                    }
                    $scope.contentInfoPanel.show();
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

        $scope.infoWindowCb=function () {
            alert('trigger');
        }

        $scope.Select=function (set) {
            //选择全集
            if(set!==undefined&&set!==null&&set.length>0) {
                $scope.closeContentInfoPanel();
                $state.go('map_paperValidate_confirm', {contentInfo: JSON.stringify({places: set,carInfo:$scope.carInfo,maintain:$scope.maintain})});
            }else{
                var myPopup = $ionicPopup.alert({
                    template: '未选中如何结果',
                    title: '<strong style="color:red">错误</strong>'
                });
            }
        }

        $scope.locate=function (place) {
            if(place!==undefined&&place!==null)
            {
                var map=$scope.map;
                var BMap=$scope.bMap;
                map.panTo(new BMap.Point(place.longitude, place.latitude) );
                var opts = {
                    width : 260,     // 信息窗口宽度
                    height: 70,     // 信息窗口高度
                    title : place.unitName , // 信息窗口标题
                };
                var content='地址:'+place.address;
                var infoWindow = new BMap.InfoWindow(content, opts);
                $scope.closeContentInfoPanel();
                map.openInfoWindow(infoWindow,new BMap.Point(place.longitude, place.latitude)); //开启信息窗口
            }
        }

        $scope.confirm=function (item) {
            $scope.closeContentInfoPanel();
            $state.go('map_paperValidate_confirm', {contentInfo: JSON.stringify({place: item,carInfo:$scope.carInfo,maintain:$scope.maintain})});
        }

        $scope.clear_search=function () {
            $scope.query=null;
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
                var map = new BMap.Map("map_administrate_search");          // 创建地图实例
                var point = new BMap.Point(117.144816, 36.672171);  // 创建点坐标
                $scope.point=point;
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


        $scope.contentInfo=null;

        /*** 绑定信息窗口模态框 ***/
        $ionicModal.fromTemplateUrl('views/modal/popupContentInfoPanel.html',{
            scope:  $scope,
            animation: 'animated '+'bounceInUp',
            hideDelay:920
        }).then(function(modal) {
            $scope.contentInfoPanel = modal;
        });

        $scope.openContentInfoPanel= function(){
            try{
                $scope.contentInfoPanel.show();
            }catch(e){
                alert('error=\r\n'+ e.toString());
            }
        };

        $scope.closeContentInfoPanel= function() {
            $scope.contentInfoPanel.hide();
        };
        /*** 绑定信息窗口模态框 ***/



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
                    $scope.mk=mk;
                }
            });


        });
    })
