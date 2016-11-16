/**
 * Created by danding on 16/9/6.
 * 山大默认经纬度为117.144816,36.672171
 * 1.$scope.maintain.maintenance,保存选中的维修厂
 */
angular.module('starter')

  .controller('locateMaintainNearbyController',function($scope,$state,$http,$timeout,$rootScope,
                                                        BaiduMapService,$cordovaGeolocation,$ionicModal,
                                                        Proxy,$stateParams,
                                                        $ionicActionSheet,$cordovaDatePicker) {

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




      $scope.maintain = {
        maintenance: {}
      };

      $scope.carManage={

      };

      $scope.servicePlace=null;


      if ($stateParams.locate !== undefined && $stateParams.locate !== null) {
        $scope.locate=$stateParams.locate;
        if(Object.prototype.toString.call($scope.locate)=='[object String]')
          $scope.locate=JSON.parse($scope.locate);
        $scope.locateType = $scope.locate.locateType;
        $scope.carInfo=$scope.locate.carInfo;
      }

      //查询已绑定车辆,并显示车牌信息
      $scope.selectCarInfoByCarNum=function(item,modal){

        var data={
          request:'fetchInsuranceCarInfoByCustomerId'
        };
        if($scope.carInfo.carNum!==undefined&&$scope.carInfo.carNum!==null)
          data.carNum=$scope.carInfo.carNum;


        $http({
          method: "POST",
          url: Proxy.local()+"/svr/request",
          headers: {
            'Authorization': "Bearer " + $rootScope.access_token
          },
          data:data
        }).then(function(res) {
          var json=res.data;
          if(json.re==1) {
            var cars=json.data;
            var buttons=[];
            buttons.push({text: "<b>创建新车</b>"});
            cars.map(function(car,i) {
              var ele=car;
              ele.text='<b>'+car.carNum+'</b>';
              buttons.push(ele);
            });
            var carSheet = $ionicActionSheet.show({
              buttons: buttons,
              titleText: '<b>选择车辆信息</b>',
              cancelText: 'Cancel',
              cancel: function() {
                // add cancel code..
              },
              buttonClicked: function(index) {
                if(index==0) {
                  //TODO:create new car info
                  if(modal!==undefined&&modal!==null)
                    modal.hide();
                  $state.go('update_car_info');
                }else{
                  var car=cars[index-1];
                  $scope.carInfo=car;

                }
                return true;
              },
              cssClass:'center'
            });
          }
        }).catch(function(err) {
          var str='';
          for(var field in err)
            str+=err[field];
          console.error('error=\r\n' + str);
        });
      }


      $scope.generateServiceOrder=function(){

        $scope.carManage.carId=$scope.carInfo.carId;
        if($scope.carManage.estimateTime!==undefined&&$scope.carManage.estimateTime!==null
            &&$scope.carManage.carId!=undefined&&$scope.carManage.estimateTime!=null)
        {
          var unit=null;
          var units=null;
          var servicePerson=$scope.carManage.servicePerson;
          //所选车管所
          var servicePlace=$scope.servicePlace.name;
          unit=$scope.unit;
          //范围围修厂
          units=$scope.units;

          $scope.carManage.serviceType=21;

          if(unit!==undefined&&unit!==null)//已选维修厂
          {
            $scope.carManage.servicePersonId=servicePerson.servicePersonId;
            $http({
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

            }).then(function(res) {
            var json = res.data;
            if (json.re == 1) {
              //TODO:append address and serviceType and serviceTime
              var serviceName = '车驾管-审车';
              var order=json.data;
              var servicePersonIds = [order.servicePersonId];
              var serviceItems=$scope.maintain.subServiceTypes;
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
          }else//未选定维修厂
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
                    carManage: $scope.carManage,
                    servicePlace:servicePlace
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

        }else{
            if($scope.carManage.estimateTime==undefined&&$scope.carManage.estimateTime==null){
                $ionicPopup.alert({
                    title: '',
                    template: '请选择预约时间'
                });
            }else{
                $ionicPopup.alert({
                    title: '',
                    template: '请选择车辆信息'
                });

            }


        }

      }


    BaiduMapService.getBMap().then(function (res) {
      $scope.bMap = res;
      var BMap = $scope.bMap;
      var map = new BMap.Map("container");          // 创建地图实例
      var point = new BMap.Point(117.144816, 36.672171);  // 创建点坐标

      map.centerAndZoom(point, 15);
      map.addControl(new BMap.NavigationControl());
      map.addControl(new BMap.ScaleControl());
      map.enableScrollWheelZoom(true);


      $scope.tpMarkers=[];
      $scope.dragF=false;
      //map添加拖拽结束事件
      // map.addEventListener("dragend", function(){
      //   //中心点渲染
      //   var center = map.getCenter();
      //   console.log("地图中心点变更为：" + center.lng + ", " + center.lat);
      //   map.clearOverlays();
      //   var point=center;
      //   //设置地图中心点覆盖物
      //   var mkCenter = new BMap.Marker(point);
      //   mkCenter.setIcon("http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png");
      //   map.addOverlay(mkCenter);
      //   var label = new BMap.Label('中心', {offset: new BMap.Size(20, -10)});
      //   label.setStyle({
      //     color: '#fff',
      //     fontSize: "12px",
      //     height: "20px",
      //     lineHeight: "20px",
      //     fontFamily: "微软雅黑",
      //     border: '0px',
      //     'background-color':'#222'
      //   });
      //   mkCenter.setLabel(label);
      //
      //   //拖拽延时
      //   if($scope.timer!==undefined&&$scope.timer!==null)
      //   {
      //     $timeout.cancel( $scope.timer);
      //   }
      //   else{}
      //   $scope.timer = $timeout(
      //     function() {
      //       render();
      //     },
      //     1000
      //   );
      //
      //   var render=function(){
      //   }
      //
      // });



      var mk = new BMap.Marker(point);
      mk.setAnimation(BMAP_ANIMATION_BOUNCE);
      map.addOverlay(mk);
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


      //选择维修厂
      $scope.marker_select = function (unit, label) {
        if ($scope.unit !== undefined && $scope.unit !== null) {
          $scope.unit = null;
          label.setStyle({color: '#222', 'font-size': '0.8em'});
        }
        else {
          label.setStyle({
            color: '#ff8000'
          });
          $scope.unit = unit;

          var unitId=unit.unitId;
            $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data: {
                    request: 'getServicePersonByUnitId',
                    info:{
                      unitId:unitId
                    }
                }
            }).then(function(res) {
                var json=res.data;
                $scope.carManage.servicePerson=json.data;
            })

          $scope.unitLabels.map(function (item, i) {
            if (item.getContent().trim() != label.getContent().trim())
              item.setStyle({color: '#222', 'font-size': '0.8em'});
          })
        }
      }

        //选择车管所
        $scope.servicePlace_select = function (servicePlace, label) {
            if ($scope.servicePlace !== undefined && $scope.servicePlace !== null) {
                $scope.servicePlace = null;
                label.setStyle({color: '#222', 'font-size': '0.8em'});
            }
            else
              {

                  label.setStyle({
                      color: '#00f'
                  });

                  $scope.$apply(function(){
                      $scope.servicePlace = servicePlace;
                  });

                  $scope.servicePlaceLabels.map(function (item, i) {
                      if (item.getContent().trim() != label.getContent().trim())
                          item.setStyle({color: '#222', 'font-size': '0.8em'});
                  });

                  //渲染5公里的维修厂
                  var ll=new BMap.Point(servicePlace.longitude, servicePlace.latitude);
                  $scope.unitsInTown.map(function (unit, i) {
                      if (unit.longitude !== undefined && unit.longitude !== null &&
                          unit.latitude !== undefined && unit.latitude !== null) {

                          var distance = map.getDistance(ll, new BMap.Point(unit.longitude, unit.latitude)).toFixed(2);
                          if (distance <= 5000)
                              $scope.units.push(unit);
                      }
                  });

                  //移除周边维修厂覆盖物
                  if($scope.unitOverlays!==undefined&&$scope.unitOverlays!==null&&$scope.unitOverlays.length>0)
                  {
                      $scope.unitOverlays.map(function(overlay,i) {
                          map.removeOverlay(overlay);
                      })
                  }

                  $scope.unitOverlays=[];

                  $scope.unitLabels=[];

                  $scope.units.map(function (unit, i) {
                      var bIcon = new BMap.Icon('img/mark_b.png', new BMap.Size(100,100));
                      var mk = new BMap.Marker(new BMap.Point(unit.longitude, unit.latitude),{icon:bIcon});
                      map.addOverlay(mk);
                      var label = new BMap.Label(unit.unitName, {offset: new BMap.Size(20, -10)});
                      label.setStyle({
                          color: '#222',
                          fontSize: "12px",
                          height: "20px",
                          lineHeight: "20px",
                          fontFamily: "微软雅黑",
                          border: '0px'
                      });
                      mk.addEventListener("click", $scope.marker_select.bind(this, unit, label));
                      mk.setLabel(label);
                      $scope.unitOverlays.push(mk);
                      $scope.unitLabels.push(label);
                  });


              }
        }


      var posOptions = {timeout: 10000, enableHighAccuracy: false};

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
              //map.addOverlay(marker);
              var label = new BMap.Label("转换后的百度坐标（正确）", {offset: new BMap.Size(20, -10)});
              marker.setLabel(label); //添加百度label
              //map.setCenter(data.points[0]);
            }
          }

          convertor.translate(pointArr, 1, 5, translateCallback)


        }, function (err) {
          // error
          console.error('error=\r\n' + err.toString());
        });


      //fetch provinces list
      $http({
        method: "POST",
        url: Proxy.local() + "/svr/request",
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token,
        },
        data: {
          request: 'getProvinces',
        }
      }).then(function (res) {
        var json = res.data;
        if (json.re == 1) {
          $scope.provinces = json.data;
        }
      }).catch(function (err) {
        var str = '';
        for (var field in err)
          str += err[field];
        console.error('error=\r\n' + str);
      })

      $scope.tabTag = 'province';

      $scope.tab_change = function (tag) {
        $scope.tabTag = tag;
      }

      /*** bind select_province_city_town modal ***/
      $ionicModal.fromTemplateUrl('views/modal/select_province_city_town.html', {
        scope: $scope,
        animation: 'animated ' + 'bounceInDown',
        hideDelay: 920
      }).then(function (modal) {
        $scope.select_PCT = {
          modal: modal
        }
      });

      $scope.open_selectPCTModal = function (item, field, matched) {
        $scope.select_PCT.modal.show();
        if (item !== undefined && item !== null && field !== undefined && field !== null) {
          $scope.select_PCT.item = item;
          $scope.select_PCT.field = field;
          $scope.select_PCT.matched = matched;
        }
      };

      $scope.close_selectPCTModal = function (cluster) {
        if (cluster !== undefined && cluster !== null) {
          cluster.map(function (singleton, i) {
            if (singleton.checked == true) {
              if ($scope.select_PCT.item !== undefined && $scope.select_PCT.item !== null
                && $scope.select_PCT.field !== undefined && $scope.select_PCT.field !== null) {
                if ($scope.select_PCT.matched !== undefined && $scope.select_PCT.matched !== null)
                  $scope.select_PCT.item[$scope.select_PCT.field] = singleton[$scope.select_PCT.matched];
                else
                  $scope.select_PCT.item[$scope.select_PCT.field] = singleton;
              }
            }
          });
        }
        $scope.select_PCT.modal.hide();
      };
      /*** bind select_province_city_town modal ***/

      $scope.selectPTC = function () {
        $scope.open_selectPCTModal();
      }

      $scope.area = {
        province: '山东省',
        city: '济南市',
        town: '历下区'
      }

      //fetch maintenances in area


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

      $scope.fetchCitiesByProvince = function (pro) {
        $http({
          method: "POST",
          url: Proxy.local() + "/svr/request",
          headers: {
            'Authorization': "Bearer " + $rootScope.access_token,
          },
          data: {
            request: 'fetchCitiesByProvince',
            info: {
              provinceName: pro
            }
          }
        }).then(function (res) {
          var json = res.data;
          if (json.re == 1) {
            $scope.cities = json.data;
            $scope.area.city = '请选择';
            $scope.tab_change('city');
          }
        }).catch(function (err) {
          var str = '';
          for (var field in err)
            str += err[field];
          console.error('error=\r\n' + str);
        })
      };

      $scope.fetchTownsByCity = function (city) {
        $http({
          method: "POST",
          url: Proxy.local() + "/svr/request",
          headers: {
            'Authorization': "Bearer " + $rootScope.access_token,
          },
          data: {
            request: 'fetchTownsByCity',
            info: {
              cityName: city,
              provinceName: $scope.area.province
            }
          }
        }).then(function (res) {
          var json = res.data;
          if (json.re == 1) {
            $scope.towns = json.data;
            if ($scope.towns !== '' && $scope.towns !== undefined && $scope.towns !== null)
              $scope.area.town = '请选择';
            else
              $scope.area.town = '';
            $scope.tab_change('town');
          }
        }).catch(function (err) {
          var str = '';
          for (var field in err)
            str += err[field];
          console.error('error=\r\n' + str);
        })
      };


      //获取该地区的所有维修厂,并进行距离过滤
      $scope.fetchAndRenderNearBy = function () {
        $http({
          method: "POST",
          url: Proxy.local() + "/svr/request",
          headers: {
            'Authorization': "Bearer " + $rootScope.access_token,
          },
          data: {
            request: 'fetchMaintenanceInArea',
            info: {
              provinceName: $scope.area.province,
              cityName: $scope.area.city,
              townName: $scope.area.town
            }
          }
        }).then(function (res) {
          var json = res.data;
          if (json.re == 1) {
            $scope.unitsInTown = json.data;
          }
        }).catch(function (err) {
          var str = '';
          for (var field in err)
            str += err[field];
          console.error('error=\r\n' + str);
        })
      }

      $scope.maintain.center = map.getCenter();
      $scope.fetchAndRenderNearBy();

      //获取本地区的所有车管所,并添加覆盖物
        $scope.fetchServicePlacesInArea = function () {
            $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data: {
                    request: 'fetchServicePlacesInArea',
                    info: {
                        provinceName: $scope.area.province,
                        cityName: $scope.area.city,
                        townName: $scope.area.town
                    }
                }
            }).then(function (res) {
                var json = res.data;
                if (json.re == 1) {
                    $scope.units = [];
                    $scope.servicePlaces = json.data;

                    //remove previous markers
                    map.clearOverlays();
                    //render new markers
                    $scope.servicePlaceLabels = [];
                    $scope.servicePlaces.map(function (servicePlace, i) {
                        var rIcon = new BMap.Icon('img/mark_r.png', new BMap.Size(100,100));
                        var mk = new BMap.Marker(new BMap.Point(servicePlace.longitude, servicePlace.latitude),{icon:rIcon});
                        map.addOverlay(mk);
                        var label = new BMap.Label(servicePlace.name, {offset: new BMap.Size(20, -10)});
                        label.setStyle({
                            color: '#222',
                            fontSize: "12px",
                            height: "20px",
                            lineHeight: "20px",
                            fontFamily: "微软雅黑",
                            border: '0px'
                        });
                        mk.addEventListener("click", $scope.servicePlace_select.bind(this, servicePlace, label));
                        mk.setLabel(label);
                        $scope.servicePlaceLabels.push(label);
                    });
                }
            }).catch(function (err) {
                var str = '';
                for (var field in err)
                    str += err[field];
                console.error('error=\r\n' + str);
            })
        }

        $scope.fetchServicePlacesInArea();


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

      //确认维修厂回调
      $scope.maintenance_confirm = function () {

        if($rootScope.carManage==undefined||$rootScope.carManage==null)
          $rootScope.carManage={};
        switch ($scope.locateType) {
          case 'maintain':
            $rootScope.dashboard.tabIndex=2;
            if($scope.locate.locateIndex!==undefined&&$scope.locate.locateIndex!==null)
              $rootScope.dashboard.subTabIndex=$scope.locate.locateIndex;
            else
              $rootScope.dashboard.subTabIndex=1;
            if ($rootScope.maintain == undefined || $rootScope.maintain == null)
              $rootScope.maintain = {};
            //维修厂已选
            if ($scope.unit !== undefined && $scope.unit !== null)
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
                $rootScope.maintain.unit=$scope.unit;
                $rootScope.maintain.servicePerson =json.data;

                $state.go('tabs.dashboard');
              });
            } else {
              $rootScope.maintain.units = $scope.units;
              $state.go('tabs.dashboard');
            }
            break;
          case 21:
            //审车

            $rootScope.dashboard.tabIndex=3;
            if($scope.locate.locateIndex!==undefined&&$scope.locate.locateIndex!==null)
              $rootScope.dashboard.subTabIndex=$scope.locate.locateIndex;
            if ($scope.unit !== undefined && $scope.unit !== null)
            {
              var carValidate={
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
                carValidate.servicePerson =json.data;
                $rootScope.carManage.carValidate=carValidate;

                $rootScope.carManage.serviceType='21';
                var ob = {tabIndex:3};
                $state.go('tabs.dashboard',{params:JSON.stringify(ob)});

              });
            }
            else
            {
              var carValidate={
                units:$scope.units
              };
              $rootScope.carManage.carValidate=carValidate;
              $rootScope.dashboard.tabIndex=3;
              $rootScope.dashboard.service='代办车辆年审';
              $rootScope.carManage.serviceType='21';
              $state.go('tabs.dashboard');

            }
            break;
          default:
            break;
        }
      }



      $scope.go_back = function () {
        $rootScope.dashboard.tabIndex=3;
        $rootScope.dashboard.service='代办车辆年审';
        window.history.back();
      }


      //var geolocation = new BMap.Geolocation();
      //geolocation.getCurrentPosition(function(r){
      //  if(this.getStatus() == BMAP_STATUS_SUCCESS){
      //    //var mk = new BMap.Marker(r.point);
      //    //map.addOverlay(mk);
      //    //map.panTo(r.point);
      //
      //    //map.setCenter(new BMap.Point(r.point.lng, r.point.lat));
      //
      //
      //    var pointArr = [];
      //    alert(r.point.lng + ',' + r.point.lat);
      //
      //
      //  }
      //  else {
      //    alert('failed'+this.getStatus());
      //  }
      //},{enableHighAccuracy: true});

    });
  })
