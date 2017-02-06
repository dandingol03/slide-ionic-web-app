/**
 * Created by danding on 16/9/6.
 * 山大默认经纬度为117.144816,36.672171
 * 1.$scope.maintain.maintenance,保存选中的维修厂
 */
angular.module('starter')

  .controller('locateMaintainDailyController',function($scope,$state,$http,$timeout,$rootScope,
                                                        BaiduMapService,$cordovaGeolocation,$ionicModal,
                                                        Proxy,$stateParams,ionicDatePicker,$ionicActionSheet,
                                                       $cordovaDatePicker,$q,$cordovaFileTransfer,
                                                       $ionicPopup) {

    $scope.maintain = {
      maintenance: {}
    };

      $scope.serviceTypeMap={
          11:'维修-日常保养',
          12:'维修-故障维修',
          13:'维修-事故维修',
          21:'车驾管-审车',
          22:'车驾管-审证',
          23:'车驾管-接送机',
          24:'车驾管-取送车',
          31:'鈑喷'};

    if ($stateParams.locate !== undefined && $stateParams.locate !== null) {
      $scope.locate=$stateParams.locate;
      if(Object.prototype.toString.call($scope.locate)=='[object String]')
        $scope.locate=JSON.parse($scope.locate);
      $scope.locateType = $scope.locate.locateType;
      $scope.carInfo=$scope.locate.carInfo;
      $scope.locateIndex=$scope.locate.locateIndex;
      $scope.maintain=$scope.locate.maintain;
    }

    $scope.selectTime=true;

    $scope.appointMode=false;


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




    //查询已绑定车辆,并显示车牌信息
    $scope.selectCarInfoByCarNum=function(item,modal){

      var data={
        request:'fetchInsuranceCarInfoByCustomerId'
      };


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
            var map = new BMap.Map("locate_maintain_daily");          // 创建地图实例
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
            $scope.maintain.center = map.getCenter();
            deferred.resolve({re: 1});
        }
        cb();

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
                  $http({
                      method: "POST",
                      url: Proxy.local() + "/svr/request",
                      headers: {
                          'Authorization': "Bearer " + $rootScope.access_token,
                      },
                      data: {
                          request: 'getServicePersonByUnitId',
                          info:{
                              unitId:unit.unitId
                          }
                      }
                  }).then(function(res) {
                      var json=res.data;
                      if(json.re==1) {
                          var servicePerson=json.data;
                          $scope.maintain.servicePerson=servicePerson;
                      }
                  }).catch(function(err) {
                      var str='';
                      for(var field in err)
                          str+=err[field];
                      console.error('err=\r\n'+str);
                  })

              });


              $scope.labels.map(function (item, i) {
                  if (item.getContent().trim() != label.getContent().trim())
                      item.setStyle({color: '#222', 'font-size': '0.8em'});
              })
          }
      }

      $scope.addDragEnd=function () {



          //map添加拖拽结束事件
          map.addEventListener("dragend", function(){


              $scope.timer = $timeout(
                  function() {
                      render();
                  },
                  1000
              );

              var render=function(){

                  //5公里范围内维修厂集合
                  $scope.wholeUnits=[];
                  $scope.units = [];
                  $scope.unitsInTown.map(function (unit, i) {
                      if (unit.longitude !== undefined && unit.longitude !== null &&
                          unit.latitude !== undefined && unit.latitude !== null) {
                          var distance = map.getDistance(point, new BMap.Point(unit.longitude, unit.latitude)).toFixed(2);
                          if (distance <= 5000)
                              $scope.units.push(unit);
                      }
                  });

                  $scope.units.map(function (unit, i) {
                      var mk = new BMap.Marker(new BMap.Point(unit.longitude, unit.latitude));
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
                      $scope.labels.push(label);
                  });
              }
          });
      }


      //获取该地区的所有维修厂,并进行距离过滤
      $scope.fetchAndRenderNearBy = function () {
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
                      provinceName: $scope.area.province,
                      cityName: $scope.area.city,
                      townName: $scope.area.town
                  }
              }
          }).then(function (res) {
              var json = res.data;
              var map=$scope.map;
              if (json.re == 1) {
                  $scope.units = [];
                  $scope.wholeUnits=[];
                  $scope.unitsInTown = json.data;
                  json.data.map(function (unit, i) {
                      if (unit.longitude !== undefined && unit.longitude !== null &&
                          unit.latitude !== undefined && unit.latitude !== null) {
                          //var center = $scope.maintain.center;
                          // var distance = map.getDistance(center, new BMap.Point(unit.longitude, unit.latitude)).toFixed(2);
                          // if (distance <= 5000)
                          $scope.wholeUnits.push(unit);
                      }
                  });
                  //remove previous markers
                  map.clearOverlays();
                  //render new markers
                  $scope.labels = [];
                  $scope.wholeUnits.map(function (unit, i) {
                      var mk = new BMap.Marker(new BMap.Point(unit.longitude, unit.latitude));
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
                      $scope.labels.push(label);
                  });
              }
              deferred.resolve({re: 1});
          }).catch(function (err) {
              var str = '';
              for (var field in err)
                  str += err[field];
              console.error('error=\r\n' + str);
              deferred.reject({});
          })
          return deferred.promise;
      }
      
      
      $scope.renderCircle=function (cen,x,y) {

          var center=null;
          if(cen!==undefined&&cen!==null)
            center=cen;
          else
            center=$scope.map.getCenter();
          var BMap=$scope.bMap;
          var map=$scope.map;
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


      //切换为指派中心模式
      $scope.switchAppointMode=function () {
          var map=$scope.map;
          if($scope.appointMode!=true)
          {
            $scope.appointMode=true;
              $scope.renderCircle(map.getCenter(),0.12,0.1);
              var map=$scope.map;
              map.addEventListener("click", $scope.clickFunc);
          }else{
              $scope.appointMode=false;
              //移除圈
              if($scope.oval!==undefined&&$scope.oval!==null)
                  map.removeOverlay($scope.oval);
              map.removeEventListener('click', $scope.clickFunc);
          }
      }

      
      
      
    BaiduMapService.getBMap().then(function (res) {


        $scope.bMap = res;
        var BMap = $scope.bMap;

        $scope.init_map(BMap).then(function(json) {
            if(json.re==1) {
               return  $scope.fetchAndRenderNearBy();
            }
        }).then(function(json) {


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

            //$scope.renderCircle(map.getCenter(),0.12,0.1);


            //自我定位修正
            var posOptions = {timeout: 10000, enableHighAccuracy: false};
            $cordovaGeolocation.getCurrentPosition(posOptions)
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
                            var label = new BMap.Label("转换后的百度坐标（正确）", {offset: new BMap.Size(20, -10)});
                            marker.setLabel(label); //添加百度label
                            map.setCenter(data.points[0]);
                        }
                    }

                    convertor.translate(pointArr, 1, 5, translateCallback)


                }, function (err) {
                    // error
                    console.error('error=\r\n' + err.toString());
                });
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

          default:
            break;
        }
      }


      $scope.go_back = function () {
        $rootScope.dashboard.tabIndex=2;
        $rootScope.dashboard.subTabIndex=$scope.locateIndex;
        window.history.back();
      }


      //音频检查
      $scope.audioCheck = function (orderId) {
            var deferred = $q.defer();
            alert('audiochecking.....');
            alert('resourceulr=' + $scope.maintain.description.audio);
            if($scope.maintain.description.audio!=null&&$scope.maintain.description.audio!=undefined)
            {
                var server=Proxy.local()+'/svr/request?' +
                    'request=uploadAudio&orderId='+orderId+'&fileName='+$scope.maintain.description.audio+'&audioType=serviceAudio';
                var options = {
                    fileKey:'file',
                    headers: {
                        'Authorization': "Bearer " + $rootScope.access_token
                    }
                };
                alert('go into upload audio');
                $cordovaFileTransfer.upload(server, $scope.maintain.description.audio, options)
                    .then(function(res) {
                        var json=res.response;
                        json=JSON.parse(json);
                        if(json.re==1){

                            return   $http({
                                method: "POST",
                                url: Proxy.local() + "/svr/request",
                                headers: {
                                    'Authorization': "Bearer " + $rootScope.access_token
                                },
                                data: {
                                    request: 'createAudioAttachment',
                                    info: {
                                        orderId: orderId,
                                        docType:'I6',
                                        path:json.data
                                    }
                                }
                            });
                        }
                    }).then(function(res) {
                    var json=res.data;
                    var audioAttachId=json.data;
                    if(json.re==1){
                        $http({
                            method: "POST",
                            url: Proxy.local() + "/svr/request",
                            headers: {
                                'Authorization': "Bearer " + $rootScope.access_token
                            },
                            data: {
                                request: 'updateServiceAudioAttachment',
                                info: {
                                    orderId: orderId,
                                    audioAttachId:audioAttachId
                                }
                            }
                        });
                    }
                }).then(function(res) {
                    var json=res.data;
                    if(json.re==1) {
                        deferred.resolve({re: 1, data: ''});
                    }
                }).catch(function(err) {
                    var str='';
                    for(var field in err)
                        str+=err[field];
                    console.error('error=' + str);
                })
            }
            else{
                deferred.resolve({re:1});
            }
            return deferred.promise;
      }

      //视频检查
      $scope.videoCheck = function (orderId) {
            var deferred = $q.defer();
            if($scope.maintain.description.video!=null&&$scope.maintain.description.video!=undefined)
            {
                var server=Proxy.local()+'/svr/request?' +
                    'request=uploadVideo&orderId='+orderId+'&fileName='+$scope.maintain.description.video+'&videoType=serviceVideo';
                var options = {
                    fileKey:'file',
                    headers: {
                        'Authorization': "Bearer " + $rootScope.access_token
                    }
                };
                $cordovaFileTransfer.upload(server, $scope.maintain.description.video, options).then(function(res) {
                    var json=res.response;
                    json=JSON.parse(json);
                    if(json.re==1){
                        return   $http({
                            method: "POST",
                            url: Proxy.local() + "/svr/request",
                            headers: {
                                'Authorization': "Bearer " + $rootScope.access_token
                            },
                            data: {
                                request: 'createVideoAttachment',
                                info: {
                                    orderId: orderId,
                                    docType:'I7',
                                    path:json.data
                                }
                            }
                        });
                    }else{
                        deferred.reject({re:-1});
                    }
                }).then(function(res) {
                    var json=res.data;
                    if(json.re==1) {
                        var videoAttachId=json.data;
                        if(json.re==1){
                            return  $http({
                                method: "POST",
                                url: Proxy.local() + "/svr/request",
                                headers: {
                                    'Authorization': "Bearer " + $rootScope.access_token
                                },
                                data: {
                                    request: 'updateServiceVideoAttachment',
                                    info: {
                                        orderId: orderId,
                                        videoAttachId:videoAttachId
                                    }
                                }
                            });
                        }
                    }
                }).then(function(res) {
                    var json=res.data;
                    if(json.re==1) {
                        deferred.resolve({re: 1, data: ''});
                    }
                }).catch(function(err) {
                    var str='';
                    for(var feild in err)
                        str+=err[field];
                    console.error('error=\r\n' + str);
                })
            }
            else{
                deferred.resolve({re:1});
            }
            return deferred.promise;
        }




      //$scope.maintain.estimateTime=new Date();


      $scope.generateMaintainDailyOrder=function () {

          var orderId = null;
          //已选维修厂
          if ($scope.unit !== undefined && $scope.unit !== null) {

              var order=null;
              $http({
                  method: "POST",
                  url: Proxy.local() + "/svr/request",
                  headers: {
                      'Authorization': "Bearer " + $rootScope.access_token
                  },
                  data: {
                      request: 'getServicePersonByMaintenance',
                      info: {
                          maintenance: $scope.unit
                      }
                  }
              }).then(function (res) {
                  var json = res.data;
                  if (json.re == 1) {
                      var servicePerson = json.data;
                      $scope.maintain.servicePersonId = servicePerson.servicePersonId;
                      var maintain=$scope.maintain;
                      maintain.carId=$scope.carInfo.carId;
                      maintain.servicePlaceId=$scope.unit.unitId;
                      return $http({
                          method: "POST",
                          url: Proxy.local() + "/svr/request",
                          headers: {
                              'Authorization': "Bearer " + $rootScope.access_token
                          },
                          data: {
                              request: 'generateCarServiceOrder',
                              info: {
                                  maintain:maintain
                              }
                          }
                      });
                  } else {
                      return {re: -1};
                  }
              }).then(function(res) {
                  var json = res.data;
                  if (json.re == 1) {
                      orderId=json.data.orderId;
                      var serviceName = $scope.maintain.serviceName;
                      order=json.data;
                      var servicePersonId = [];
                      servicePersonId.push(order.servicePersonId);
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
                                  servicePersonIds: servicePersonId,
                                  serviceName: serviceName,
                                  type: 'to-servicePerson'
                              }
                          }
                      });
                  } else {
                      return ({re: -1});
                  }
              }).then(function (res) {
                  var json = res.data;
                  if (json.re == 1) {}
                  else if(json.re==2) {
                      console.error(json.data);
                  }else{}
                  alert('service order has been generated');
                  //检查是否需要上传附件信息
                  $scope.audioCheck(order.orderId).then(function(json) {
                      alert('result of audiocheck=\r\n' + json);
                      if (json.re == 1) {
                          console.log('音频附件上传成功')
                      }
                      else
                      {}
                      return $scope.videoCheck(order.orderId);
                  }).then(function(json) {
                      alert('result of videocheck=\r\n' + json);
                      if (json.re == 1) {
                          console.log('视频附件上传成功')
                      }
                      else
                      {}
                  });

                  $state.go('service_orders');
              }).catch(function (err) {
                  var str = '';
                  for (var field in err)
                      str += err[field];

              });
          }
          else//未选定服务人员
          {
              var order = null;
              var servicePersonIds = [];
              var personIds = [];
              var maintain=$scope.maintain;
              maintain.carId=$scope.carInfo.carId;
              $http({
                  method: "POST",
                  url: Proxy.local() + "/svr/request",
                  headers: {
                      'Authorization': "Bearer " + $rootScope.access_token
                  },
                  data: {
                      request: 'generateCarServiceOrder',
                      info: {
                          maintain: maintain
                      }
                  }
              }).then(function (res) {
                  var json = res.data;
                  if (json.re == 1) {
                      order = json.data;
                      return $http({
                          method: "POST",
                          url: Proxy.local() + "/svr/request",
                          headers: {
                              'Authorization': "Bearer " + $rootScope.access_token
                          },
                          data: {
                              request: 'getServicePersonsByUnits',
                              info: {
                                  units: $scope.units
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
                      alert('go into service');
                      var serviceName = $scope.serviceTypeMap[$scope.maintain.serviceType];
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
                                  type: 'to-servicePerson'
                              }
                          }
                      });
                  } else {
                      return ({re: -1});
                  }
              }).then(function (res) {
                  var json = res.data;
                  console.log('**************go into media check*****************');
                  $scope.videoCheck(order.orderId).then(function (json) {
                      alert('result of videocheck=\r\n' + json);
                      if (json.re == 1) {
                          alert('附件上传成功');
                      }
                      else
                      {}
                  });
                  $scope.audioCheck(order.orderId).then(function(json) {
                      alert('result of audioCheck=\r\n' + json);
                      if(json.re==1) {
                          alert('音频附件上传成功');
                      }else{}
                  });
                  $state.go('service_orders');

              }).catch(function (err) {
                  var str = '';
                  for (var field in err)
                      str += err[field];
                  alert('error=\r\n' + str);
              });

          }
      }


      //提交维修服务订单
      $scope.applyMaintainDailyOrder=function() {

        if ($scope.maintain.estimateTime !== undefined && $scope.maintain.estimateTime !== null) {

          var flag=false;
          if($scope.unit==undefined||$scope.unit==null)
          {
              if(!$scope.appointMode)
              {
                  flag=true;
                  var confirmPopup = $ionicPopup.confirm({
                      title: '信息',
                      template: '您未选择维修厂\r\n切换到指派模式可以由系统负责指派维修厂，是否现在切换'
                  });
                  confirmPopup.then(function(res) {
                      if(res)
                      {
                          $scope.switchAppointMode();
                      }else{
                      }
                  })
              }else
              {
                  var map=$scope.map;
                  var BMap=$scope.bMap;
                  if($scope.wholeUnits!==undefined&&$scope.wholeUnits!==null)
                  {
                    $scope.units=[];
                    $scope.wholeUnits.map(function (unit, i) {
                        if (unit.longitude !== undefined && unit.longitude !== null &&
                            unit.latitude !== undefined && unit.latitude !== null) {
                            var center = $scope.map.getCenter();
                            var distance = map.getDistance(center, new BMap.Point(unit.longitude, unit.latitude)).toFixed(2);
                            if (parseFloat(distance) <= 10000)
                            $scope.units.push(unit);
                        }
                        if($scope.units.length>0)
                        {}else{
                            flag=true;
                            var alertPopup = $ionicPopup.alert({
                                title: '信息',
                                template: '您所设定的指派中心周边没有可指派的维修厂,请重新设定指派中心'
                            });
                        }
                    });
                  }


              }

          }

          if(flag)
            return true;

            if($scope.carInfo!==undefined&&$scope.carInfo!==null&&$scope.carInfo.carId!==undefined&&$scope.carInfo.carId!==null)
            {
                //TODO:check this car free or not
                $http({
                    method: "POST",
                    url: Proxy.local() + "/svr/request",
                    headers: {
                        'Authorization': "Bearer " + $rootScope.access_token
                    },
                    data: {
                        request: 'validateCarServiceStateFree',
                        info: {
                            carId: $scope.carInfo.carId
                        }
                    }
                }).then(function (res) {
                    var json=res.data;
                    if(json.data==true)
                    {


                        var confirmPopup = $ionicPopup.confirm({
                            title: '信息',
                            template: '您所选的车已有还未完成的服务订单\r\n是否仍要继续提交订单'
                        });
                        confirmPopup.then(function(res) {
                            if(res) {
                                $scope.generateMaintainDailyOrder();
                            } else {
                              return;
                            }
                        });
                    }else{
                      //车是自由状态
                        $scope.generateMaintainDailyOrder();

                    }
                });

            }else{
                var alertPopup = $ionicPopup.alert({
                    title: '警告',
                    template: '请填写车牌'
                });
            }

            }else{
              var alertPopup = $ionicPopup.alert({
                  title: '警告',
                  template: '请填写预约时间'
              });
            }
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
