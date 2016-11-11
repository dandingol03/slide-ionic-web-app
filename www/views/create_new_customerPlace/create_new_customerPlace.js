/**
 * Created by danding on 16/9/6.
 * 山大默认经纬度为117.144816,36.672171
 * 1.$scope.point为当前地图中心点
 */
angular.module('starter')

    .controller('createNewCustomerPlaceController',function($scope,$state,$http,$timeout,$rootScope,
                                                         BaiduMapService,$cordovaGeolocation,$ionicModal,
                                                         Proxy,$stateParams,$ionicLoading,ionicDatePicker,
                                                         $ionicPopup) {

        $scope.customerPlace={
        };

        $scope.datepick = function(item,field){
            var ipObj1 = {
                callback: function (val) {  //Mandatory

                    var date=new Date(val);
                    var month=parseInt(date.getMonth())+1;
                    item[field]=date.getFullYear()+'-'+month+'-'+date.getDate();
                },
                disabledDates: [            //Optional
                    new Date(2016, 2, 16),
                    new Date(2015, 3, 16),
                    new Date(2015, 4, 16),
                    new Date(2015, 5, 16),
                    new Date('Wednesday, August 12, 2015'),
                    new Date("08-16-2016"),
                    new Date(1439676000000)
                ],
                from: new Date(1949, 10, 1), //Optional
                to: new Date(2040, 10, 30), //Optional
                inputDate: new Date(),      //Optional
                mondayFirst: false,          //Optional
                disableWeekdays: [0],       //Optional
                closeOnSelect: false,       //Optional
                templateType: 'popup'     //Optional
            };
            ionicDatePicker.openDatePicker(ipObj1);
        };

        $scope.go_back = function () {
            window.history.back();
        }

        //创建新的用户地址
        $scope.createNewCustomerPlace=function () {
            var destiny=$scope.destiny;
            var address=$scope.customerPlace.address;
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
                            address:address,
                            longitude:destiny.lng,
                            latitude:destiny.lat
                        }

                    }
            }).then(function(res) {
                var json=res.data;
                if(json.re==1) {
                    var myPopup = $ionicPopup.alert({
                        template: '',
                        title: '<strong>用户地址已创建完成</strong>',
                        subTitle: '',
                        scope: $scope
                    });


                    $timeout(function(){
                        var popup=myPopup;
                        if(popup.$$state.status==0)
                        {
                            myPopup.close();
                            $scope.go_back();
                        }
                    },2000);
                }
            })
        }

        $scope.airTransfer = {
            airTransfers: {}
        };



        $scope.filterType={
            pickUp:true,
            seeOff:false
        };

        $scope.Mutex=function(field,item) {
            if(item[field]==true)
            {
                item[field]=false;
            }else{
                item[field]=true;
                for(var f in item) {
                    if(f!=field)
                        item[f]=false;
                }
            }
        };



        $scope.appendSelfLocation=function(BMap,map) {
            var posOptions = {timeout: 10000, enableHighAccuracy: false};
            // Setup the loader

            //仅限手机环境
            if(window.cordova!==undefined&&window.cordova!==null)
            {
                $ionicLoading.show({
                    content: 'Loading',
                    animation: 'fade-in',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                });

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
                                map.addOverlay(marker);
                                var label = new BMap.Label("转换后的您的位置", {offset: new BMap.Size(20, -10)});
                                marker.setLabel(label); //添加百度label
                                map.centerAndZoom(data.points[0],14);
                                $ionicLoading.hide();
                            }
                        }
                        convertor.translate(pointArr, 1, 5, translateCallback)
                    }, function (err) {
                        $ionicLoading.hide();
                        console.error('error=\r\n' + err.toString());
                    });
            }else//浏览器环境
            {}

        }


        $scope.clickFunc=function(e){
            console.log('click point='+e.point.lng + "," + e.point.lat);
            $scope.destiny={lng: e.point.lng,lat: e.point.lat};
            var BMap=$scope.BMap;
            var mk = new BMap.Marker(e.point);  // 创建标注
            var map=$scope.map;
            if($scope.mk!=null&&$scope.mk!=undefined){
                map.removeOverlay($scope.mk);

            }
            map.addOverlay(mk);               // 将标注添加到地图中
            var label = new BMap.Label("目的地", {offset: new BMap.Size(20, -10)});
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
        }

        //地图初始化
        $scope.init_map=function(BMap){
            var map = new BMap.Map("new_customer_place");          // 创建地图实例
            //遥墙机场经纬度
            $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data: {
                    request: 'getInsuranceCarServicePlaceByName',
                    info: {
                        name:'遥墙机场'
                    }
                }
            }).then(function(res) {
                var json=res.data;
                if(json.re==1) {
                    var servicePlace=json.data;
                    var point = new BMap.Point(servicePlace.longitude, servicePlace.latitude);
                    if(point!==undefined&&point!==null)
                        $scope.point=point;
                    map.centerAndZoom(point, 14);  //初始化地图,设置城市和地图级别
                    $scope.map=map;

                    map.addEventListener("click", $scope.clickFunc);
                }

            })

        }


        BaiduMapService.getBMap().then(function (res) {

            $scope.bMap = res;
            var BMap = $scope.bMap;
            $scope.BMap=BMap;
            //地图初始化
            $scope.init_map(BMap);

        });

        $scope.go_back = function () {
            window.history.back();
        }

    })



