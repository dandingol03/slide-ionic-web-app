/**
 * Created by danding on 16/9/6.
 * 山大默认经纬度为117.144816,36.672171
 * 1.$scope.maintain.maintenance,保存选中的维修厂
 */
angular.module('starter')

  .controller('locateAirportNearbyController',function($scope,$state,$http,$timeout,$rootScope,
                                                        BaiduMapService,$cordovaGeolocation,$ionicModal,
                                                        Proxy,$stateParams,$ionicLoading,$cordovaDatePicker,
                                                       $ionicPopup,$ionicActionSheet,$q) {

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




      $scope.go_to=function (state) {
          $state.go(state);
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






    //提交车驾管服务订单
    $scope.generateServiceOrder=function(){
        //$scope.carManage.carId=$scope.carInfo.carId;

        //TODO:servicePlaceId is unknown
        if($scope.carManage.estimateTime!==undefined&&$scope.carManage.estimateTime!==null)
        {
            var unit=null;
            var units=null;
            var servicePerson=null;
            //服务地点


            if($scope.filterType.pickUp==true)
            {
                $scope.carManage.customerPlace=$scope.carManage.destination;
            }else{
                $scope.carManage.customerPlace=$scope.carManage.originStop;
            }
            unit=$scope.unit;
            units=$scope.units;

            $scope.serviceTypeMap={
                11:'维修-日常保养',
                12:'维修-故障维修',
                13:'维修-事故维修',
                21:'车驾管-审车',
                22:'车驾管-审证',
                23:'车驾管-接送机',
                24:'车驾管-取送车',
                31:'鈑喷'};

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
                                    carManage: $scope.carManage
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
                }).then(function(res) {
                  var json=res.data;
                  if(json.re==1) {
                      var myPopup = $ionicPopup.show({
                          template: '',
                          title: '<strong>取送机服务已生成订单</strong>',
                          subTitle: '',
                          scope: $scope,
                          buttons: buttons
                      });
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


    $scope.selectDestination=function () {
        $http({
            method: "POST",
            url: Proxy.local() + "/svr/request",
            headers: {
                'Authorization': "Bearer " + $rootScope.access_token
            },
            data: {
                request: 'selectDestinationByPersonId'
            }
        }).then(function(res) {
            var json=res.data;
            if(json.re==1) {
                var destinations=json.data;
                if(destinations!==undefined&&destinations!==null&&destinations.length>0) {
                    var buttons=[];
                    buttons.push({text:"创建新地址"});
                    destinations.map(function (destination) {
                        var item=destination;
                        item.text=destination.address;
                        buttons.push(item);
                    })
                    var destinationSheet = $ionicActionSheet.show({
                        buttons: buttons,
                        titleText: '<b>选择目的地</b>',
                        cancelText: 'Cancel',
                        cancel: function() {
                            // add cancel code..
                        },

                        buttonClicked: function(index) {
                            if(index==0){
                                $scope.go_to('create_new_customerPlace');
                            }else{
                                $scope.carManage.destination=buttons[index];
                            }

                            return true;
                        },
                        cssClass:'center'
                    });
                }
            }else if(json.re==2)
            {
                var confirmPopup = $ionicPopup.confirm({
                    title: '信息',
                    template: '<strong>没有可供选择的地址</strong><br/><strong>是否创建住址</strong>',
                    subTitle: '',
                    scope: $scope
                });
                confirmPopup.then(function(res) {
                    if(res) {
                        $scope.go_to('create_new_customerPlace')
                    } else {}
                });


            }else{}


        })
    }



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

    $scope.appendAirportLocation=function(BMap,map,servicePlace){


      if(servicePlace!==undefined&&servicePlace!==null)
          $scope.carManage.servicePlaceId=servicePlace.placeId;
      var point=new BMap.Point(servicePlace.longitude, servicePlace.latitude);
      var bIcon = new BMap.Icon('img/mark_b.png', new BMap.Size(20,25));
      var mk = new BMap.Marker(point,{icon:bIcon});  // 创建标注
      map.addOverlay(mk);               // 将标注添加到地图中
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
        var deferred=$q.defer();
      var map = new BMap.Map("locate_airport_nearby");          // 创建地图实例
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
                map.centerAndZoom(point, 10);  //初始化地图,设置城市和地图级别
                $scope.map=map;

                //添加自身位置
                $scope.appendAirportLocation(BMap,map,servicePlace);
                deferred.resolve({re: 1});
            }else{
                deferred.resolve({re: 1});
            }
        });
        return deferred.promise;
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

        var deferred=$q.defer();


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
            $scope.map.addOverlay(nmk);

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
          deferred.resolve({re: 1});
      });

      return deferred.promise;
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
      $scope.init_map(BMap).then(function(json) {
        return $scope.fetchMaintennacesInArea(BMap);
      }).then(function(json) {
          if(json.re==1)
            console.log('map init completely');
      }).catch(function(err) {
          var str='';
          for(var field in err)
              str+=err[field];
          alert('err=\r\n'+str);
      })

    });

    $scope.go_back = function () {
      $rootScope.dashboard.tabIndex=3;
      $rootScope.dashboard.service='接送机'
      window.history.back();
    }



  })



