/**
 * Created by danding on 16/12/17.
 */
/**
 * Created by danding on 16/9/6.
 * 山大默认经纬度为117.144816,36.672171
 * 1.$scope.maintain.maintenance,保存选中的维修厂
 */
angular.module('starter')

    .controller('abmController',function($scope,$state,$http,$rootScope,
                                         $cordovaGeolocation,$ionicPopup,
                                         Proxy,$stateParams, $q,$ionicLoading,
                                         BaiduMapService,$cordovaToast,$ionicScrollDelegate) {

        $scope.goBack=function () {
            window.history.back();
        }

        $scope.reRender=function () {
            var map=$scope.map;
            var BMap=$scope.BMap;
            var center=map.getCenter();

            //获取所有覆盖物
            var overlays=map.getOverlays();

            map = new BMap.Map("angular_baidu_map");          // 创建地图实例
            // $scope.point=point;
            if($scope.service=='airport'||$scope.service=='park_car')
            {
                map.centerAndZoom(center, 13);
            }else{
                map.centerAndZoom(center, 12);
            }
            map.addControl(new BMap.NavigationControl());
            map.addControl(new BMap.ScaleControl());
            map.enableScrollWheelZoom(true);
            $scope.tpMarkers=[];
            $scope.dragF=false;

            $scope.places.map(function (place, i) {
                var name=null;
                if(place.name!==undefined&&place.name!==null)
                    name=place.name;
                else
                    name=place.unitName;
                var mk = new BMap.Marker(new BMap.Point(place.longitude, place.latitude));
                var label = new BMap.Label(name, {offset: new BMap.Size(20, -10)});
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

            $scope.map=map;

        }

        $scope.contentPanelVisible=true;
        $scope.scaffoldResultPanel=function () {
            if($scope.contentPanelVisible)
            {
                var ele=angular.element(document.querySelector('#angular_baidu_map'));
                ele.css('height',(screen.height-110)+'px' );
                //TODO:re-render map
                $scope.reRender();
            }else{
                var ele=angular.element(document.querySelector('#angular_baidu_map'));
                ele.css('height',(screen.height-335)+'px' );
                //TODO:re-render map
                $scope.reRender();
            }
            $scope.contentPanelVisible=!$scope.contentPanelVisible;

        }

        // $timeout(function () {
        //     var ele=angular.element(document.querySelector('#angular_baidu_map'));
        //     ele.css('height',(screen.height-110)+'px' );
        //     $scope.init_map($scope.BMap);
        //     //TODO:re-render map
        // }, 2000);



        //路由参数同步
        if($stateParams.params!==undefined&&$stateParams.params!==null&&$stateParams.params!='')
        {
            var params=$stateParams.params;
            if(Object.prototype.toString.call(params)=='[object String]')
                params=JSON.parse(params);
            if(params.town!==undefined&&params.town!==null&&params.town!='')
                $scope.town=params.town;
            if(params.service!==undefined&&params.service!==null&&params.service!='')
                $scope.service=params.service;
            if(params.type!==undefined&&params.type!==null)
                $scope.type=params.type;
            if(params.maintain!==undefined&&params.maintain!==null)
                $scope.maintain=params.maintain;
        }

        //$rootScope同步
        if($rootScope.carInfo!==undefined&&$rootScope.carInfo!==null)
            $scope.carInfo=$rootScope.carInfo;

        $scope.containerStyle={width:'100%',height:(screen.height*3)/5+'px'};
        $scope.mapStyle = {width: '100%', height: (screen.height*3)/5+'px', display: 'block'};


        $scope.resultPanelStyle={border:'0px',padding: '0px',width:'100%',height:(screen.height-425)+'px'};

        $scope.root={
        };

        if($scope.service=='airport'||$scope.service=='park_car')
            $scope.mode='pickUp';


        $scope.blockInStyle={display: 'table-cell','vertical-align': 'middle',background:'#11c1f3',color:'#fff'};
        $scope.blockOffStyle={display: 'table-cell','vertical-align': 'middle',background:'#fff',color:'#666'};

        $scope.tag='A';


        $scope.modeSwitch=function (mode) {
            if(mode===$scope.mode)
                return;
            $scope.mode=mode;
            if(window.cordova)
            {
                var serviceName=null;
                switch($scope.service)
                {
                    case 'airport':
                        switch(mode)
                        {
                            case 'pickUp':
                                serviceName='接机服务';
                                break;
                            case 'seeOff':
                                serviceName='送机服务';
                                break;
                        }
                        break;
                    case 'park_car':
                        switch(mode)
                        {
                            case 'pickUp':
                                serviceName='接站服务';
                                break;
                            case 'seeOff':
                                serviceName='送站服务';
                                break;
                        }
                        break;
                }

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


        $scope.Toggle = function (item, field) {
            if (item[field] == true)
                item[field] = false;
            else
                item[field] = true;
        };

        $scope.Set = function (item, field, value) {
            item[field] = value;
        }

        $scope.SelectAll=function (set) {
            //选择全集
            if(set!==undefined&&set!==null&&set.length>0) {
                switch($scope.service)
                {
                    case 'administrator':
                        $state.go('map_administrate_confirm',
                            {contentInfo: JSON.stringify({detectUnites: set,carInfo:$scope.carInfo})});
                        break;
                    case 'paper_validate':
                        $state.go('map_paperValidate_confirm',
                            {contentInfo: JSON.stringify({places: set,carInfo:$scope.carInfo})});
                        break;
                    case 'airport':
                        var serviceName=null;
                        switch($scope.mode)
                        {
                            case 'pickUp':
                                serviceName='接机服务';
                                break;
                            case 'seeOff':
                                serviceName='送机服务';
                                break;
                        }
                        var confirmPopup = $ionicPopup.confirm({
                            title: '信息',
                            template: '您目前选择的是'+serviceName+'，确认之后按下OK'
                        });
                        confirmPopup.then(function(res) {
                            if(res) {
                                $state.go('map_airport_confirm', {
                                    contentInfo: JSON.stringify({mode:$scope.mode,units: set,carInfo:$scope.carInfo
                                    })});
                            } else {
                            }
                        });
                        break;
                    case 'park_car':
                        var serviceName=null;
                        switch($scope.mode)
                        {
                            case 'pickUp':
                                serviceName='接站服务';
                                break;
                            case 'seeOff':
                                serviceName='送站服务';
                                break;
                        }
                        var confirmPopup = $ionicPopup.confirm({
                            title: '信息',
                            template: '您目前选择的是'+serviceName+'，确认之后按下OK'
                        });
                        confirmPopup.then(function(res) {
                            if(res) {
                                $state.go('map_parkCar_confirm', {
                                    contentInfo: JSON.stringify({mode:$scope.mode,units: set,carInfo:$scope.carInfo
                                    })});
                            } else {
                            }
                        });
                        break;
                    case 'maintain':
                        $state.go('map_daily_confirm', {contentInfo: JSON.stringify({units: set,maintain:$scope.maintain})});
                        break;
                }
            }
        }




        $scope.navigate=function (place) {
            switch($scope.service)
            {
                case 'administrator':
                    $state.go('map_administrate_confirm',
                        {contentInfo: JSON.stringify({detectUnit: place,carInfo:$scope.carInfo})});
                    break;
                case 'paper_validate':
                    $state.go('map_paperValidate_confirm',
                        {contentInfo: JSON.stringify({place: place,carInfo:$scope.carInfo})});
                    break;
                case 'airport':
                    var serviceName=null;
                    switch($scope.mode)
                    {
                        case 'pickUp':
                            serviceName='接机服务';
                            break;
                        case 'seeOff':
                            serviceName='送机服务';
                            break;
                    }
                    var confirmPopup = $ionicPopup.confirm({
                        title: '信息',
                        template: '您目前选择的是'+serviceName+'，确认之后按下OK'
                    });
                    confirmPopup.then(function(res) {
                        if(res) {
                            $state.go('map_airport_confirm', {contentInfo: JSON.stringify({mode:$scope.mode,unit: place,carInfo:$scope.carInfo})});
                        } else {
                        }
                    });
                    break;
                case 'park_car':
                    var serviceName=null;
                    switch($scope.mode)
                    {
                        case 'pickUp':
                            serviceName='接站服务';
                            break;
                        case 'seeOff':
                            serviceName='送站服务';
                            break;
                    }
                    var confirmPopup = $ionicPopup.confirm({
                        title: '信息',
                        template: '您目前选择的是'+serviceName+'，确认之后按下OK'
                    });
                    confirmPopup.then(function(res) {
                        if(res) {
                            $state.go('map_parkCar_confirm', {contentInfo: JSON.stringify({mode:$scope.mode,unit: place,carInfo:$scope.carInfo})});
                        } else {
                        }
                    });
                    break;
                case 'maintain':
                    $state.go('map_daily_confirm', {contentInfo: JSON.stringify({unit: place,maintain:$scope.maintain,type:$scope.type})});
                    break;
                default:
                    break;
            }
        }

        //根据所传参数搜索周边
        $scope.fetchDistrict=function () {

            var BMao=$scope.BMap;
            var map=$scope.map;

            $scope.gravity={longitude:0,latitude:0};


            $ionicLoading.show({
                template: '<p class="item-icon-left">搜索...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
            });

            var cmd=null;
            switch($scope.service)
            {
                case 'administrator':
                    cmd='fetchDetectUnitsInArea';
                    break;
                case 'paper_validate':
                    cmd='fetchServicePlacesInArea';
                    break;
                case 'airport':
                    cmd='fetchMaintenanceInArea';
                    break;
                case 'park_car':
                    cmd='fetchMaintenanceInArea';
                    break;
                case 'maintain':
                    cmd='fetchMaintenanceInArea';
                    break;
                default:
                    cmd='fetchDetectUnitsInArea';
                    break;
            }


            $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data: {
                    request: cmd,
                    info: {
                        townName: $scope.town
                    }
                }
            }).then(function (res) {
                var json = res.data;
                var map=$scope.map;
                var personHome=null;
                if($scope.service!='maintain')
                {
                    if($rootScope.gaodeHome!==undefined&&$rootScope.gaodeHome!==null)
                        personHome=$rootScope.gaodeHome;
                }else{
                    if($rootScope.maintainHome!==undefined&&$rootScope.maintainHome!==null)
                        personHome=$rootScope.maintainHome;
                }
                var BMap=$scope.BMap;
                if (json.re == 1) {
                    $scope.places = [];
                    //群体初始化
                    $scope.populations={};
                    var tagIndex=0;
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
                                var flagOfBia=true;
                                for(var tag in $scope.populations)
                                {
                                    var population=$scope.populations[tag];
                                    if(population!==undefined&&population!==null)
                                    {
                                        var bias=map.getDistance(new BMap.Point(population.center.lng,population.center.lat),
                                                            new BMap.Point(place.longitude, place.latitude)).toFixed(2);
                                        if(bias<=12000)
                                        {

                                            population.center={
                                                lng:(population.center.lng*population.plots.length+place.longitude)/(population.plots.length+1),
                                                lat:(population.center.lat*population.plots.length+place.latitude)/(population.plots.length+1)
                                            }
                                            population.plots.push(
                                                {
                                                    name:place.name!==undefined&&place.name!==null?place.name:place.unitName,
                                                    distance:place.distance,
                                                    address:place.address,
                                                    phone:place.phone,
                                                    placeId:place.placeId!==undefined&&place.placeId!==null?place.placeId:place.unitId
                                                });
                                            flagOfBia=false;
                                            break;
                                        }
                                    }
                                }
                                //如果为离群点
                                if(flagOfBia)
                                {

                                    var tag=String.fromCharCode(tagIndex+65);
                                    tagIndex++;
                                    $scope.populations[tag]={
                                        plots:[
                                            {
                                                name:place.name!==undefined&&place.name!==null?place.name:place.unitName,
                                                distance:place.distance,
                                                address:place.address,
                                                phone:place.phone,
                                                placeId:place.placeId!==undefined&&place.placeId!==null?place.placeId:place.unitId
                                            }],
                                        center:{
                                            lng:place.longitude,
                                            lat:place.latitude
                                        }
                                    };
                                }

                                if(place.unitName!==undefined&&place.unitName!==null)
                                    place.name=place.unitName;
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
                        var name=null;
                        if(place.name!==undefined&&place.name!==null)
                            name=place.name;
                        else
                            name=place.unitName;
                        var mk = new BMap.Marker(new BMap.Point(place.longitude, place.latitude));
                        var label = new BMap.Label(name, {offset: new BMap.Size(20, -10)});
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
        
        $scope.tabReDefine=function () {
            var tagIndex=$scope.tag-'A';
            tagIndex++;
            if($scope.populations[String.fromCharCode(tagIndex+65)]!==undefined&&$scope.populations[String.fromCharCode(tagIndex+65)]!==null)
                $scope.tag=String.fromCharCode(tagIndex+65);
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }



        $scope.scrollChange=function () {
            var delegate = $ionicScrollDelegate.$getByHandle('scroll-handle');
            var position=delegate.getScrollPosition();
            //TODO:algorithm

            if(position.top<=10)
            {
                $scope.pagePreviousTip=true;
            }else if(position.top>90){
                $scope.pageNextTip=true;
            }else{}
        }
        
        //更改为群体定位
        $scope.mapPanTo=function () {
            var map=$scope.map;
            if($scope.places.length==1)
            {
                //默认定位第一个搜索结果
                var firstPlace=$scope.places[0];
                map.panTo(new BMap.Point(firstPlace.longitude, firstPlace.latitude) );
            }else{
                //map pan to populations center
                map.panTo(new BMap.Point($scope.populations[$scope.tag].center.lng, $scope.populations[$scope.tag].center.lat) );
            }
        }

        $scope.tagChange=function (tag) {
            $scope.tag=tag;
            var map=$scope.map;
            var BMap=$scope.BMap;
            var population=$scope.populations[$scope.tag];
            map.panTo(new BMap.Point(population.center.lng,population.center.lat));
        }

        $scope.init_map=function (BMap) {

            var deferred=$q.defer();

            var cb=function () {
                var map = new BMap.Map("angular_baidu_map");          // 创建地图实例
                var point=null;
                if($rootScope.gaodeHome!==undefined&&$rootScope.gaodeHome!==null)
                {
                    var personLocate=$rootScope.gaodeHome;
                    point=personLocate.getCenter();
                }else{
                    point = new BMap.Point(117.144816, 36.672171);  // 创建点坐标
                }
                // $scope.point=point;
                if($scope.service=='airport'||$scope.service=='park_car')
                {
                    map.centerAndZoom(point, 13);
                }else{
                    map.centerAndZoom(point, 12);
                }
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

        $scope.selectAll=function () {
            console.log('select all......');
        }

        $scope.selectedTagStyle={
            width: '30px',height: '30px',background: '#328bff',float: 'left',
            'text-align': 'center',margin:'0px 4px'
        };
        $scope.unSelectedTagStyle={width: '30px',height: '30px',background: '#fff',float: 'left','text-align': 'center',margin:'0px 4px'};
    })
