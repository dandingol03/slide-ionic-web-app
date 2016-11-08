/**
 * Created by danding on 16/9/6.
 * 山大默认经纬度为117.144816,36.672171
 * 1.$scope.maintain.maintenance,保存选中的维修厂
 */
angular.module('starter')

  .controller('locateAirportNearbyController',function($scope,$state,$http,$timeout,$rootScope,
                                                        BaiduMapService,$cordovaGeolocation,$ionicModal,
                                                        Proxy,$stateParams,$ionicLoading,ionicDatePicker) {
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

      $scope.airTransfer = {
          airTransfers: {}
      };

      if($stateParams.locateType !== undefined && $stateParams.locateType !== null) {
          $scope.locateType = $stateParams.locateType;
      }

      $scope.filterType={
      };

    //提交车驾管服务订单
    $scope.generateServiceOrder=function(){

        //$scope.carManage.carId=$scope.carInfo.carId;
        if($scope.carManage.estimateTime!==undefined&&$scope.carManage.estimateTime!==null)
        {
            var unit=null;
            var units=null;
            var servicePerson=null;
            //服务地点
            var servicePlace='遥墙机场';
            unit=$scope.unit;
            units=$scope.units;
            if(unit!==undefined&&unit!==null)
                servicePlace=unit.unitName;


            $scope.carManage.serviceType='23';
            if(unit!==undefined&&unit!==null)//已选维修厂
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
                    if(json.re==1) {
                        servicePerson=json.data;
                        $scope.carManage.servicePersonId=servicePerson.servicePersonId;
                        return $http({
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
                        })
                    }
                }).then(function(res) {
                    var json = res.data;
                    if (json.re == 1) {
                        //TODO:append address and serviceType and serviceTime
                        var serviceName = $scope.serviceTypeMap[$scope.maintain.serviceType];
                        var order=json.data;
                        var servicePersonIds = [order.servicePersonId];
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
            }
            else//未选定维修厂
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
                            carManage: $scope.carManage
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
        }

    }

      $scope.filterType.destiny=false;
      $scope.filterType.maintenance=true;



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

    $scope.appendAirportLocation=function(BMap,map){
      //设置本地位置
      var point = new BMap.Point(117.219, 36.852);
      var mk = new BMap.Marker(point);  // 创建标注
      map.addOverlay(mk);               // 将标注添加到地图中
      mk.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画// 。
      map.addControl(new BMap.NavigationControl());
      map.addControl(new BMap.ScaleControl());
      map.enableScrollWheelZoom(true);
      var label = new BMap.Label("遥墙机场", {offset: new BMap.Size(20, -10)});
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

    $scope.clickFunc=function(e){
      console.log('click point='+e.point.lng + "," + e.point.lat);
      $scope.destiny={lng: e.point.lng,lat: e.point.lat};
      var BMap=$scope.BMap;
      var mk = new BMap.Marker(e.point);  // 创建标注
      var map=$scope.map;
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
      if($scope.mk!=null&&$scope.mk!=undefined){
        map.removeOverlay($scope.mk);

      }
      $scope.mk=mk;
      map.panTo(e.point);
    }

    //地图初始化
    $scope.init_map=function(BMap){
      var map = new BMap.Map("locate_airport_nearby");          // 创建地图实例
      //遥墙机场经纬度
      var point = new BMap.Point(117.219, 36.852);
      if(point!==undefined&&point!==null)
        $scope.point=point;
      map.centerAndZoom(point, 9);  //初始化地图,设置城市和地图级别

      $scope.map=map;

      //地图添加点击事件
      //map.addEventListener('click', $scope.clickFunc);


      //添加自身位置
      $scope.appendAirportLocation(BMap,map);
    }

    //选择维修厂
    $scope.marker_select = function (unit, label) {
      if ($scope.unit !== undefined && $scope.unit !== null) {
        $scope.unit = null;
        label.setStyle({color: '#222', 'font-size': '0.8em'});
      }
      else {
        label.setStyle({
          color: '#00f'
        });


        $scope.$apply(function(){
            $scope.unit = unit;
        });

        $scope.labels.map(function (item, i) {
          if (item.getContent().trim() != label.getContent().trim())
            item.setStyle({color: '#222', 'font-size': '0.8em'});
        })
      }
    }

    //刷新附近维修厂
    //获取该地区的所有维修厂,并进行距离过滤
    $scope.fetchMaintennacesInArea=function(BMap){
      $http({
        method: "POST",
        url: Proxy.local() + "/svr/request",
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token,
        },
        data: {
          request: 'fetchMaintenanceInArea',
          info: {
            provinceName: '山东省',
            cityName: '济南市',
            townName: ['历城区','历下区','槐荫区','天桥区','市中区']
          }
        }
      }).then(function (res) {
        var json = res.data;
        if (json.re == 1) {
          $scope.units = [];
          json.data.map(function (unit, i) {
            if (unit.longitude !== undefined && unit.longitude !== null &&
              unit.latitude !== undefined && unit.latitude !== null) {
              //var center = $scope.airportTransfer.center;
              var distance = $scope.map.getDistance($scope.point, new BMap.Point(unit.longitude, unit.latitude)).toFixed(2);
              if (distance <= 50000)
                $scope.units.push(unit);
            }
          });


          //render new markers
          $scope.labels = [];
          $scope.units.map(function (unit, i) {
            var nmk = new BMap.Marker(new BMap.Point(unit.longitude, unit.latitude));
            var npoint =new BMap.Point(unit.longitude, unit.latitude);
            var polyline = new BMap.Polyline([$scope.point,npoint], {strokeColor:"blue", strokeWeight:6, strokeOpacity:0.5});  //定义折线

            $scope.map.addOverlay(nmk);
            $scope.map.addOverlay(polyline);     //添加折线到地图上
            var label = new BMap.Label(unit.unitName, {offset: new BMap.Size(20, -10)});
            label.setStyle({
              color: '#222',
              fontSize: "12px",
              height: "20px",
              lineHeight: "20px",
              fontFamily: "微软雅黑",
              border: '0px'
            });

            nmk.addEventListener("click", $scope.marker_select.bind(this, unit, label));
            nmk.setLabel(label);
            $scope.labels.push(label);
          });
        }
        //圈渲染
        //var circle = new BMap.Circle($scope.point, 50000, {strokeColor: "blue", strokeWeight: 2, strokeOpacity: 0.5}); //创建圆
        //$scope.map.addOverlay(circle);

      }).catch(function (err) {
        var str = '';
        for (var field in err)
          str += err[field];
        console.error('error=\r\n' + str);
      });
    }

    //维修厂确定
    $scope.maintenance_confirm = function () {
      if($rootScope.carManage==undefined||$rootScope.carManage==null)
        $rootScope.carManage={};
      if($scope.unit!==undefined&&$scope.unit!==null)//选定维修厂
      {
        var airportTransfer={
          destiny:$scope.destiny,
          unit:$scope.unit,
          servicePlace:$scope.unit.unitName
        };
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
          airportTransfer.servicePerson =json.data;
          $rootScope.carManage.airportTransfer=airportTransfer;
          $rootScope.dashboard.tabIndex=3;
          $rootScope.dashboard.service='接送机';
          $rootScope.carManage.serviceType='23';
          $state.go('tabs.dashboard');
        })
      }else//未选定维修厂
      {
        var airportTransfer={
          destiny:$scope.destiny,
          units:$scope.units
        };
        $rootScope.carManage.airportTransfer=airportTransfer;
        $rootScope.dashboard.tabIndex=3;
        $rootScope.dashboard.service='接送机';
        $state.go('tabs.dashboard');
      }

    }

    BaiduMapService.getBMap().then(function (res) {

      $scope.bMap = res;
      var BMap = $scope.bMap;
      $scope.BMap=BMap;
      //地图初始化
      $scope.init_map(BMap);

      $scope.fetchMaintennacesInArea(BMap);

    });

    $scope.go_back = function () {
      $rootScope.dashboard.tabIndex=3;
      $rootScope.dashboard.service='接送机'
      window.history.back();
    }

  })



