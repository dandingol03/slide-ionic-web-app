/**
 * Created by apple-1 on 16/10/13.
 */
/**
 * Created by danding on 16/9/6.
 * 山大默认经纬度为117.144816,36.672171
 * 1.$scope.maintain.maintenance,保存选中的维修厂
 */
angular.module('starter')

  .controller('locateAirportTransferNearbyController',function($scope,$state,$http,$timeout,$rootScope,
                                                        BaiduMapService,$cordovaGeolocation,$ionicModal,
                                                        Proxy,$stateParams) {

    $scope.airTransfer = {
      airTransfers: {}
    };

    if ($stateParams.locateType !== undefined && $stateParams.locateType !== null) {
      $scope.locateType = $stateParams.locateType;
    }



      //提交车驾管服务订单
      $scope.generateServiceOrder=function(){

          $scope.carManage.carId=$scope.carInfo.carId;
          if($scope.carManage.estimateTime!==undefined&&$scope.carManage.estimateTime!==null)
          {
              var unit=null;
              var units=null;
              var servicePerson=null;
              var servicePlace=null;
              unit=$scope.unit;
              units=$scope.units;
              if(unit!==undefined&&unit!==null)
                  servicePlace=unit.unitName;

              $scope.carManage.serviceType=23;

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
                          var serviceName = '车驾管-接送机';
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



      BaiduMapService.getBMap().then(function (res) {
      $scope.bMap = res;
      var BMap = $scope.bMap;
      var map = new BMap.Map("container");          // 创建地图实例
      var point = new BMap.Point(117.219, 36.852);
      map.centerAndZoom(point, 10);  //初始化地图,设置城市和地图级别
      var mk = new BMap.Marker(point);  // 创建标注
      map.addOverlay(mk);               // 将标注添加到地图中
      mk.setAnimation(BMAP_ANIMATION_DROP); //跳动的动画// 。
      map.addControl(new BMap.NavigationControl());
      map.addControl(new BMap.ScaleControl());
      map.enableScrollWheelZoom(true);
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
      var circle = new BMap.Circle(point, 50000, {strokeColor: "blue", strokeWeight: 2, strokeOpacity: 0.5}); //创建圆
      map.addOverlay(circle);
      //获取该地区的所有维修厂,并进行距离过滤
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
            townName: '历城区'
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
              var distance = map.getDistance(point, new BMap.Point(unit.longitude, unit.latitude)).toFixed(2);
              if (distance <= 100000)
                $scope.units.push(unit);
            }
          });
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
              $scope.unit = unit;

              $scope.labels.map(function (item, i) {
                if (item.getContent().trim() != label.getContent().trim())
                  item.setStyle({color: '#222', 'font-size': '0.8em'});
              })
            }
          }
          //remove previous markers

          //render new markers
          $scope.labels = [];
          $scope.units.map(function (unit, i) {
            var nmk = new BMap.Marker(new BMap.Point(unit.longitude, unit.latitude));
            var npoint =new BMap.Point(unit.longitude, unit.latitude);
            var polyline = new BMap.Polyline([point,npoint], {strokeColor:"blue", strokeWeight:6, strokeOpacity:0.5});  //定义折线

            map.addOverlay(nmk);
            map.addOverlay(polyline);     //添加折线到地图上
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
      }).catch(function (err) {
        var str = '';
        for (var field in err)
          str += err[field];
        console.error('error=\r\n' + str);
      })


      $scope.pct_confirm = function (town) {
        if (town !== undefined && town !== null)
          $scope.area.town = town;
        $scope.close_selectPCTModal();
        //map.setCenter($scope.area.province + $scope.area.city + $scope.area.town);
        $scope.maintain.center = '';
        console.log('center=' + map.getCenter());
        $scope.maintain.center = map.getCenter();
        $scope.fetchAndRenderNearBy();
      }


      $scope.go_back = function () {
        window.history.back();
      }

    });
  })
