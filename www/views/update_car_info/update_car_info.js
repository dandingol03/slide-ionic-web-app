/**
 * Created by apple-1 on 16/9/13.
 */
angular.module('starter')
    .controller('updateCarInfoController',function($scope,$state,$http,$rootScope,$ionicActionSheet,
                                                   $cordovaFileTransfer,$cordovaFile,
                                                   $cordovaCamera,$cordovaImagePicker,Proxy,
                                                   $ionicModal,ionicDatePicker,$ionicSlideBoxDelegate,
                                                   $timeout,$ionicPopup,$cordovaDatePicker,
                                                    $stateParams,$ionicHistory,$ionicNativeTransitions,
                                                   $q){

        $scope.carInfo={};

        if($stateParams.carNumInfo!==undefined&&$stateParams.carNumInfo!==null)
        {
            var carNumInfo=$stateParams.carNumInfo;
            if(Object.prototype.toString.call(carNumInfo)=='[object String]')
                carNumInfo = JSON.parse(carNumInfo);
            if(carNumInfo.carNum!==undefined&&carNumInfo.carNum!==null)
                $scope.carInfo.carNum=carNumInfo.carNum;
            if(carNumInfo.city!==undefined&&carNumInfo.city!==null)
                $scope.city_confirmed=carNumInfo.city;
        }

        $scope.imgArrs=['','licenseCard1_img','licenseCard2_img','licenseCard3_img'];

        $scope.city=null;

        $scope.city_select=function (city) {
            $scope.city=city;
        }


        $scope.getCarNumPrefixByCity=function (city) {
            var carNum=null;
            switch (city) {
                case '济南':
                    carNum='鲁A';
                    break;
                case '青岛':
                    carNum='鲁B';
                    break;
                case '淄博':
                    carNum='鲁C';
                    break;
                case '枣庄':
                    carNum='鲁D';
                    break;
                case '东营':
                    carNum='鲁E';
                    break;
                case '烟台':
                    carNum='鲁F';
                    break;
                case '潍坊':
                    carNum='鲁G';
                    break;
                case '济宁':
                    carNum='鲁H';
                    break;
                case '泰安':
                    carNum='鲁J';
                    break;
                case '威海':
                    carNum='鲁K';
                    break;
                case '日照':
                    carNum='鲁L';
                    break;
                case '滨州':
                    carNum='鲁M';
                    break;
                case '德州':
                    carNum='鲁N';
                    break;
                case '聊城':
                    carNum='鲁P';
                    break;
                case '临沂':
                    carNum='鲁Q';
                    break;
                case '菏泽':
                    carNum='鲁R';
                    break;
                case '莱芜':
                    carNum='鲁S';
                    break;
                default:
                    break;
            }
            return carNum;
        }

        $scope.city_confirm=function () {

            $scope.city_confirmed=$scope.city;
            $scope.carInfo.carNum=$scope.getCarNumPrefixByCity($scope.city);
            $scope.close_append_carNumPrefixModal();

        }

        $scope.plainStyle={width: '30%',display: 'inline-block',
            'text-align': 'center',background: '#fff',padding: '10px','border-radius': '5px'};
        $scope.selectedStyle={width: '30%',display: 'inline-block',color:'#fff',
            'text-align': 'center',background: 'rgba(0, 235, 255, 0.74)',padding: '10px','border-radius': '5px','font-size':'1.2em','font-weight':'bolder'};


        $scope.licenseIndexChange=function(i) {
            $scope.licenseIndex=i;
            $ionicSlideBoxDelegate.$getByHandle('carInfo-slide').slide(i);
        };

        $scope.licenseSlideChanged=function(i){
            $scope.licenseIndex=i;
        }

        $scope.photoIndex=1;

        $scope.changePhotoIndex = function(i){

            if(i<1){
                $scope.photoIndex=1;
            }else{
                if(i>3) {
                    $scope.photoIndex=3;
                }else{
                    $scope.photoIndex=i;
                }
            }
        }


        $scope.goBack=function(){
            $ionicNativeTransitions.stateGo('car_manage', {params:JSON.stringify({previous:'update_car_info'})}, {}, {
                "type": "slide",
                "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
                "duration": 240, // in milliseconds (ms), default 400
            });
            $timeout(function () {

            })
            //$ionicHistory.clearHistory();
        };



        $scope.Toggle=function(type,item,field)
        {
            switch(type)
            {
                case 'boolean':
                    if(item[field]!=true)
                        item[field]=true;
                    else
                        item[field]=false;
                    break;
            }
        }

        $scope.fetchRelative=function(item,field,matched) {
            $http({
                method: "POST",
                url: Proxy.local()+'/svr/request',
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data:
                    {
                        request:'getRelativePersons'
                    }
            }).then(function(res) {
                var json=res.data;
                if(json.re==1) {
                    if(json.data!=undefined&&json.data!=null){
                        $scope.relatives=json.data;

                        $scope.open_selectRelativeModal(item,field,matched);
                    }
                }else{
                    $scope.open_selectRelativeModal(item,field,matched);
                }

            }).catch(function(err) {
                var str='';
                for(var field in err)
                    str+=err[field];
                console.error('error=\r\n' + str);
            });
        };


        //查询已绑定车辆,并显示车牌信息
        $scope.selectCarInfoByCarNum=function(item){
            $http({
                method: "POST",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data:
                    {
                        request:'fetchInsuranceCarInfoByCustomerId'
                    }
            }).then(function(res) {
                var json=res.data;
                if(json.re==1) {
                    var cars=json.data;
                    var buttons=[];
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

                            var car=cars[index];
                            if(item!==undefined&&item!==null)
                            {
                                item.carId=car.carId;
                            }else{
                                $scope.carInfo.carNum=car.carNum;
                                $scope.carInfo.ownerName=car.ownerName;
                                $scope.carInfo.ownerIdCard=car.ownerIdCard;
                                $scope.carInfo.issueDate=car.issueDate;
                                $scope.carInfo.factoryNum=car.factoryNum;
                                $scope.carInfo.engineNum=car.engineNum;
                                $scope.carInfo.frameNum=car.frameNum;
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

        $scope.selectCarInfoWithPerName=function(){
            $http({
                method: "POST",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data:
                    {
                        request:'getRelativePersons'
                    }
            }).then(function(res) {
                var json=res.data;
                if(json.re==1) {
                    var persons=json.data;
                    var buttons=[];
                    persons.map(function(person,i) {
                        var ele=person;
                        ele.text='<b>'+person.perName+'</b>';
                        buttons.push(ele);
                    });
                    var personSheet = $ionicActionSheet.show({
                        buttons: buttons,
                        titleText: '<b>选择人员</b>',
                        cancelText: 'Cancel',
                        cancel: function() {
                            // add cancel code..
                        },
                        buttonClicked: function(index) {
                            var person=persons[index];
                            if(person!==undefined&&person!==null) {
                                $http({
                                    method: "POST",
                                    url: Proxy.local()+"/svr/request",
                                    headers: {
                                        'Authorization': "Bearer " + $rootScope.access_token
                                    },
                                    data:
                                        {
                                            request:'getCarInfoByPersonId',
                                            info:{
                                                personId:person.personId
                                            }
                                        }
                                }).then(function(res) {
                                    var json=res.data;
                                    var cars=json.data;
                                    $scope.carInfo=cars[0];

                                });
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


        /***  悬浮窗  ***/
        $scope.carNumHint='hidden list';
        $scope.focusInCarNum=function(){
            $scope.carNumHint='list';
        }
        $scope.blurCarNum= function () {
            $scope.carNumHint = 'hidden list';
        }

        $scope.factoryNumHint='hidden list';
        $scope.focusInFactoryNum=function(){
            $scope.factoryNumHint='list';
        }
        $scope.blurFactoryNum=function(){
            $scope.factoryNumHint='hidden list';
        }

        $scope.engineNumHint='hidden list';
        $scope.focusInEngineNum=function(){
            $scope.engineNumHint='list';
        }
        $scope.blurEngineNum=function(){
            $scope.engineNumHint='hidden list';
        }

        $scope.frameNumHint='hidden list';
        $scope.focusInFrameNum=function(){
            $scope.frameNumHint='list';
        }

        $scope.blurFrameNum=function(){
            $scope.frameNumHint='hidden list';
        }


        $scope.firstTabHint='hidden list';
        $scope.firstTabStyle={display:'none'};
        $scope.focusInFirstTab=function(){
            $scope.firstTabHint='hidden list';
        }

        $scope.blurFirstTab=function(){
            $scope.firstTabHint='list';
            $scope.firstTabStyle='';
            $timeout(function(){
                $scope.firstTabHint='hidden list';
                $scope.firstTabStyle={display:'none'};
            },4000);
        }

        $scope.secondTabHint='list';
        $timeout(function(){
            $scope.secondTabHint='hidden list';
        },4000);

        $scope.focusInSecondTab=function(){
            $scope.secondTabHint='hidden list';
        }

        $scope.blurSecondTab=function(){
            $scope.secondTabHint='list';
            $timeout(function(){
                $scope.secondTabHint='hidden list';
            },2000);

        }



        $scope.slideDescriptionHint='list';
        /***  悬浮窗  ***/



        //车险行驶证框下标
        if($rootScope.dashboard.licenseIndex!==undefined&&$rootScope.dashboard.licenseIndex!==null)
            $scope.licenseIndex=$rootScope.dashboard.licenseIndex;
        else
            $scope.licenseIndex=0;


        //上传第三张行驶证
        $scope.uploadThirdLicenseCardPhoto=function (carId) {
            var deferred=$q.defer();

            if($scope.carInfo.licenseCard3_img!==undefined&&$scope.carInfo.licenseCard3_img!==null)
            {
                var licenseAttachId3=null;
                var imageType = 'licenseCard';
                var options = {
                    fileKey: 'file',
                    headers: {
                        'Authorization': "Bearer " + $rootScope.access_token
                    }
                };
                var suffix = '';
                var server=null;
                if ($scope.carInfo.licenseCard3_img.indexOf('.jpg') != -1)
                    suffix = 'jpg';
                else if ($scope.carInfo.licenseCard3_img.indexOf('.png') != -1)
                    suffix = 'png';
                else {
                }
                server = Proxy.local() + '/svr/request?request=uploadPhoto' +
                    '&imageType=' + imageType + '&suffix=' + suffix + '&filename=' + 'licenseAttachId3' + '&carId=' + carId;

                $cordovaFileTransfer.upload(server, $scope.carInfo.licenseCard3_img, options).then(function (res) {
                    var su=null
                    if($scope.carInfo.licenseCard3_img.indexOf('.jpg')!=-1)
                        su='jpg';
                    else if($scope.carInfo.licenseCard3_img.indexOf('.png')!=-1)
                        su='png';
                    return $http({
                        method: "POST",
                        url: Proxy.local()+"/svr/request",
                        headers: {
                            'Authorization': "Bearer " + $rootScope.access_token,
                        },
                        data:
                            {
                                request:'createPhotoAttachment',
                                info:{
                                    imageType:'licenseCard',
                                    filename:'licenseAttachId3',
                                    suffix:su,
                                    docType:'I3',
                                    carId:carId
                                }
                            }
                    });
                }).then(function (res) {
                    var json=res.data;
                    if(json.re==1)
                    {
                        deferred.resolve({re:1,data:json.data});
                    }else{
                        deferred.resolve({re:1,data:null});
                    }
                }).catch(function (err) {
                    alert(err);
                    deferred.reject({re: -1});
                })


            }else{
                deferred.reject({re: -1});
            }
            return deferred.promise;
        }


        $scope.fillLicenseInfo=function (carId) {
            alert('fill licenseInfo');
            $http({
                method: "POST",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data:
                    {
                        request:'updateCarInfo',
                        info:{
                            licenseAttachId2:$scope.carInfo.licenseAttachId2,
                            licenseAttachId1:$scope.carInfo.licenseAttachId1,
                            licenseAttachId3:$scope.carInfo.licenseAttachId3,
                            carId:carId
                        }
                    }
            }).then(function (res) {
                var json=res.data;
                if(json.re==1){

                    var popup = $ionicPopup.alert({
                        title: '信息',
                        template: '车辆信息保存成功'
                    });
                    $rootScope.flags.carManage.onFresh=true;
                    popup.then(function(res) {
                        // $state.go('car_insurance',{carInfo:JSON.stringify(carInfo)});
                        $scope.goBack();

                    })

                }
            })
        }

        //统一上传行驶症
        $scope.licenseCardPhotoUpload=function () {


            if($scope.carInfo.licenseCard1_img!==undefined&&$scope.carInfo.licenseCard1_img!==null
                &&$scope.carInfo.licenseCard2_img!==undefined&&$scope.carInfo.licenseCard2_img!==null)
            {

                var carInfo = null;

                var licenseAttachId1 = null;
                var licenseAttachId2 = null;
                var licenseAttachId3 = null;
                var carId=null;
                var server=null;
                var imageType = 'licenseCard';
                var options = {
                    fileKey: 'file',
                    headers: {
                        'Authorization': "Bearer " + $rootScope.access_token
                    }
                };
                $http({
                    method: "POST",
                    url: Proxy.local()+"/svr/request",
                    headers: {
                        'Authorization': "Bearer " + $rootScope.access_token
                    },
                    data:
                        {
                            request:'uploadCarAndOwnerInfo',
                            info:$scope.carInfo
                        }
                }).then(function (res) {
                    var json=res.data;
                    if(json.re==1) {

                        carInfo = json.data;
                        carId = carInfo.carId;
                        //TODO:update licenseCard
                        var suffix = '';
                        if ($scope.carInfo.licenseCard1_img.indexOf('.jpg') != -1)
                            suffix = 'jpg';
                        else if ($scope.carInfo.licenseCard1_img.indexOf('.png') != -1)
                            suffix = 'png';
                        else {
                        }
                        server = Proxy.local() + '/svr/request?request=uploadPhoto' +
                            '&imageType=' + imageType + '&suffix=' + suffix + '&filename=' + 'licenseAttachId1' + '&carId=' + carId;

                        return $cordovaFileTransfer.upload(server, $scope.carInfo.licenseCard1_img, options);
                    }}).then(function(res) {

                    var su=null
                    if($scope.carInfo.licenseCard1_img.indexOf('.jpg')!=-1)
                        su='jpg';
                    else if($scope.carInfo.licenseCard1_img.indexOf('.png')!=-1)
                        su='png';
                    //    alert('suffix=' + su);
                    return $http({
                        method: "POST",
                        url: Proxy.local()+"/svr/request",
                        headers: {
                            'Authorization': "Bearer " + $rootScope.access_token,
                        },
                        data:
                            {
                                request:'createPhotoAttachment',
                                info:{
                                    imageType:'licenseCard',
                                    filename:'licenseAttachId1',
                                    suffix:su,
                                    docType:'I3',
                                    carId:carId
                                }
                            }
                    });
                }).then(function(res) {
                    var json=res.data;
                    if(json.re==1) {

                        $scope.carInfo.licenseAttachId1=json.data;

                        var su=null;
                        if($scope.carInfo.licenseCard2_img.indexOf('.jpg')!=-1)
                            su='jpg';
                        else if($scope.carInfo.licenseCard2_img.indexOf('.png')!=-1)
                            su='png';
                        server=Proxy.local()+'/svr/request?request=uploadPhoto' +
                            '&imageType='+imageType+'&suffix='+su+'&filename='+'licenseAttachId2'+'&carId='+carId;
                        return  $cordovaFileTransfer.upload(server, $scope.carInfo.licenseCard2_img, options);
                    }

                }).then(function(res) {
                    //    alert('second image upload success');

                    var su=null;
                    if($scope.carInfo.licenseCard2_img.indexOf('.jpg')!=-1)
                        su='jpg';
                    else if($scope.carInfo.licenseCard2_img.indexOf('.png')!=-1)
                        su='png';
                    return $http({
                        method: "POST",
                        url: Proxy.local()+"/svr/request",
                        headers: {
                            'Authorization': "Bearer " + $rootScope.access_token,
                        },
                        data:
                            {
                                request:'createPhotoAttachment',
                                info:{
                                    imageType:'licenseCard',
                                    filename:'licenseAttachId2',
                                    suffix:su,
                                    docType:'I3',
                                    carId:carId
                                }
                            }
                    });

                }).then(function(res) {
                    var json=res.data;
                    if(json.re==1) {
                        $scope.carInfo.licenseAttachId2=json.data;


                        if($scope.carInfo.licenseCard3_img!==undefined&&$scope.carInfo.licenseCard3_img!==null)
                        {
                            $scope.uploadThirdLicenseCardPhoto(carId).then(function (json) {
                                if(json.re==1)
                                {
                                    var attachId=json.data;
                                    if(attachId!==undefined&&attachId!==null)
                                    {
                                        alert('attachId='+attachId);
                                        $scope.carInfo.licenseAttachId3=attachId;
                                        licenseAttachId3=attachId;
                                    }

                                }else{}
                                $scope.fillLicenseInfo(carId);
                            });
                        }else{
                           $scope.fillLicenseInfo(carId);
                        }

                    }

                }).catch(function(err) {
                    var str='';
                    for(var field in err)
                        str+=err[field];
                    alert('error=================\r\n' + str);
                })
            }else{
                $ionicPopup.alert({
                    title: '错误',
                    template: '请完成行驶证的拍摄后再点击车辆创建'
                });
            }


        }


        $scope.checkPhotoUploadOrNot=function () {
            var deferred=$q.defer();
            if(($scope.carInfo.licenseCard1_img!==undefined&&$scope.carInfo.licenseCard1_img!==null)
                ||($scope.carInfo.licenseCard2_img!==undefined&&$scope.carInfo.licenseCard2_img!==null)
                ||($scope.carInfo.licenseCard3_img!==undefined&&$scope.carInfo.licenseCard3_img!==null))
            {
                var confirmPopup = $ionicPopup.confirm({
                    title: '信息',
                    template:'您有未上传的行驶证照片,是否选择上传行驶证'
                });

                confirmPopup.then(function(res) {
                    if(res) {
                        deferred.resolve({re:1,data:true});
                    } else {
                        deferred.resolve({re:1,data:false});
                    }

                });
            }else{
                deferred.resolve({re:1,data:false});
            }

            return deferred.promise;
        }

        $scope.postCarInfo=function(){

            var engineNum=$scope.carInfo.engineNum;
            //validate engineNum

            if($scope.carInfo.carNum!==undefined&&$scope.carInfo.carNum!==null&&$scope.carInfo.carNum!=='')
            {
                if($scope.carInfo.carNum.toString().length!=7)
                {
                    $ionicPopup.alert({
                        title: '错误',
                        template: '请填入6位的车牌号'
                    });
                }else{
                    var carNum=$scope.carInfo.carNum;
                    var carNumPrefix=carNum.substring(0,2);
                    var prefix=$scope.getCarNumPrefixByCity($scope.city_confirmed);
                    if(prefix!=carNumPrefix)
                    {
                        $ionicPopup.alert({
                            title: '错误',
                            template: '您输入的车牌号前缀不符合您选择的城市'
                        });
                    }else{
                      if($scope.carInfo.ownerName!==undefined&&$scope.carInfo.ownerName!==null&&$scope.carInfo.ownername!=='')
                      {
                          if($scope.carInfo.ownerName.toString().length<2)
                          {
                              $ionicPopup.alert({
                                  title: '错误',
                                  template: '您输入的车主姓名不能少于2位\r\n请重新输入'
                              });
                              return ;
                          }


                          //填入车驾号的方式提交
                          if($scope.licenseIndex==0)
                          {
                              //如果要是有未清空的行驶证照片，提醒用户是否选择上传行驶证
                              $scope.checkPhotoUploadOrNot().then(function (json) {
                                  if(json.re==1) {
                                      if(json.data==true)
                                      {
                                        $scope.licenseIndexChange(1);
                                      }else{
                                          if($scope.carInfo.factoryNum!==undefined&&$scope.carInfo.factoryNum!==null)
                                          {
                                              if($scope.carInfo.engineNum!==undefined&&$scope.carInfo.engineNum!==null)
                                              {

                                                  if($scope.carInfo['engineNum_error']==true)
                                                  {
                                                      $ionicPopup.alert({
                                                          title: '错误',
                                                          template: '请重新输入6位以上的发动机号再点击车辆创建'
                                                      });
                                                  }else{
                                                      if($scope.carInfo.frameNum!==undefined&&$scope.carInfo.frameNum!==null){

                                                          if($scope.carInfo['frameNum_error']==true)
                                                          {
                                                              $ionicPopup.alert({
                                                                  title: '错误',
                                                                  template: '请重新输入17位的车架号再点击车辆创建'
                                                              });
                                                          }else{
                                                              $http({
                                                                  method: "POST",
                                                                  url: Proxy.local()+"/svr/request",
                                                                  headers: {
                                                                      'Authorization': "Bearer " + $rootScope.access_token
                                                                  },
                                                                  data:
                                                                      {
                                                                          request:'getCarInfoByCarNum',
                                                                          info:{
                                                                              carNum:carNum,
                                                                              ownerName:$scope.carInfo.ownerName
                                                                          }
                                                                      }
                                                              }).then(function(res) {
                                                                  var json=res.data;
                                                                  if(json.re==1) {
                                                                      //TODO:核实已匹配车牌号
                                                                      $ionicPopup.alert({
                                                                          title: '警告',
                                                                          template: '你提交的车牌号重复,请重新填入后提交'
                                                                      });
                                                                  }else if(json.re==-1) {


                                                                      $http({
                                                                          method: "POST",
                                                                          url: Proxy.local()+"/svr/request",
                                                                          headers: {
                                                                              'Authorization': "Bearer " + $rootScope.access_token
                                                                          },
                                                                          data:
                                                                              {
                                                                                  request:'uploadCarAndOwnerInfo',
                                                                                  info:$scope.carInfo
                                                                              }
                                                                      }).then(function(res) {
                                                                          var json=res.data;
                                                                          if(json.re==1){
                                                                              var carInfo = json.data;
                                                                              var popup = $ionicPopup.alert({
                                                                                  title: '信息',
                                                                                  template: '车辆信息保存成功'
                                                                              });
                                                                              popup.then(function(res) {
                                                                                  $rootScope.flags.carManage.onFresh=true;
                                                                                  $scope.goBack();
                                                                              })
                                                                              $timeout(function(){
                                                                                  //如果模态框未关闭
                                                                                  if(popup.$$state.status==0){
                                                                                      popup.close();
                                                                                      $rootScope.flags.carManage.onFresh=true;
                                                                                      $scope.goBack();
                                                                                  }
                                                                              },3000);

                                                                          }

                                                                      }).catch(function(err) {
                                                                          var str='';
                                                                          for(var field in err)
                                                                              str+=err[field];
                                                                          alert('error=================\r\n' + str);
                                                                      })
                                                                  }else{}
                                                              });
                                                          }
                                                      }else{
                                                          $ionicPopup.alert({
                                                              title: '错误',
                                                              template: '请填入车架号后再点击保存车辆信息'
                                                          });
                                                      }
                                                  }
                                              }else{
                                                  $ionicPopup.alert({
                                                      title: '错误',
                                                      template: '请填入发动机后再点击保存车辆信息'
                                                  });
                                              }
                                          }else{
                                              $ionicPopup.alert({
                                                  title: '错误',
                                                  template: '请填入厂牌型号后再点击保存车辆信息'
                                              });
                                          }
                                      }
                                  }
                              })

                          }else{
                              //上传行驶证的方式提交


                              $http({
                                  method: "POST",
                                  url: Proxy.local()+"/svr/request",
                                  headers: {
                                      'Authorization': "Bearer " + $rootScope.access_token
                                  },
                                  data:
                                      {
                                          request:'getCarInfoByCarNum',
                                          info:{
                                              carNum:carNum,
                                              ownerName:$scope.carInfo.ownerName
                                          }
                                      }
                              }).then(function (res) {
                                  var json=res.data;
                                  if(json.re==1) {
                                      //TODO:核实已匹配车牌号
                                      $ionicPopup.alert({
                                          title: '警告',
                                          template: '你提交的车牌号重复,请重新填入后提交'
                                      });

                                  }else if(json.re==-1) {
                                      //上传行驶证
                                      $scope.licenseCardPhotoUpload();
                                  }else{}
                              })




                          }


                      }else{
                          $ionicPopup.alert({
                              title: '错误',
                              template: '请填入车主姓名'
                          });
                      }
                    }
                }


            }else{
                $ionicPopup.alert({
                    title: '错误信息',
                    template: '请填入车牌号'
                });
            }
        }


        $scope.$on('$destroy', function() {
        });

        /*** bind upload_licenseCard_modal***/
        $ionicModal.fromTemplateUrl('views/modal/upload_licenseCard_modal.html',{
            scope:  $scope,
            animation: 'animated '+' bounceInUp',
            hideDelay:920
        }).then(function(modal) {
            $scope.upload_licenseCard_modal = modal;
        });

        $scope.open_uploadLicenseCardModal= function(){
            $scope.upload_licenseCard_modal.show();
        };

        $scope.close_uploadLicenseCardModal= function() {
            $scope.upload_licenseCard_modal.hide();
        };
        /*** bind upload_licenseCard_modal ***/


        /*** ShowLicenseCard1 ***/
        $ionicModal.fromTemplateUrl('views/modal/show_license_card_modal1.html',{
            scope:  $scope,
            animation: 'slide-in-bottom'
        }).then(function(modal) {
            $scope.show_license_card_modal1 = modal;
        });

        $scope.openLicenseCard1= function(){
            $scope.show_license_card_modal1.show();
        };

        $scope.closeLicenseCard1= function() {
            $scope.show_license_card_modal1.hide();
        };
        /*** ShowLicenseCard1 ***/

        /*** ShowLicenseCard2 ***/
        $ionicModal.fromTemplateUrl('views/modal/show_license_card_modal2.html',{
            scope:  $scope,
            animation: 'slide-in-bottom'
        }).then(function(modal) {
            $scope.show_license_card_modal2 = modal;
        });

        $scope.openLicenseCard2= function(){
            $scope.show_license_card_modal2.show();
        };

        $scope.closeLicenseCard2= function() {
            $scope.show_license_card_modal2.hide();
        };
        /*** ShowLicenseCard2 ***/

        /*** ShowLicenseCard3 ***/
        $ionicModal.fromTemplateUrl('views/modal/show_license_card_modal3.html',{
            scope:  $scope,
            animation: 'slide-in-bottom'
        }).then(function(modal) {
            $scope.show_license_card_modal3 = modal;
        });

        $scope.openLicenseCard3= function(){
            $scope.show_license_card_modal3.show();
        };

        $scope.closeLicenseCard3= function() {
            $scope.show_license_card_modal3.hide();
        };
        /*** ShowLicenseCard3 ***/



        /*** bind append_carNumPrefix_modal***/
        $ionicModal.fromTemplateUrl('views/modal/append_carNumPrefix_modal.html',{
            scope:  $scope,
            animation: 'animated '+' bounceInUp',
            hideDelay:920
        }).then(function(modal) {
            $scope.append_carNumPrefix_modal = modal;
        });

        $scope.open_append_carNumPrefixModal= function(){
            $scope.append_carNumPrefix_modal.show();
        };

        $scope.close_append_carNumPrefixModal= function() {
            $scope.append_carNumPrefix_modal.hide();
        };
        /*** bind append_carNumPrefix_modal ***/


        /*** bind license_info_modal***/
        $ionicModal.fromTemplateUrl('views/modal/license_info_modal.html',{
            scope:  $scope,
            animation: 'animated '+' bounceInUp',
            hideDelay:920
        }).then(function(modal) {
            $scope.license_info_modal = modal;
        });

        $scope.open_licenseInfoModal= function(){
            $scope.license_info_modal.show();
        };

        $scope.close_licenseInfoModal= function() {
            $scope.license_info_modal.hide();
        };
        /*** license_info_modal ***/

        $scope.selectCarNumPrefixByCity=function () {
            $scope.open_append_carNumPrefixModal();
        }



        $scope.showDemoPicture = function() {
            $scope.openDemoModal();
        };
        $scope.showDemoPicture1 = function() {
            $scope.openDemoModal1();
        };
        $scope.showDemoPicture2 = function() {
                $scope.openDemoModal2();
        };
        $scope.showDemoPicture3 = function() {
                $scope.openDemoModal3();
        };
        $scope.isShowPicture = false;
        $scope.isShowPicture1 = false;
        $scope.isShowPicture2 = false;
        $scope.isShowPicture3= false;

        $scope.isShowLicenseCard1 = false;
        $scope.isShowLicenseCard2 = false;
        $scope.isShowLicenseCard3 = false;

        $scope.setIsShowPicture = function(){
            $scope.isShowPicture = true;
            $scope.showDemoPicture();
        };
        $scope.setIsShowPicture1 = function(){
            $scope.isShowPicture1 = true;
            $scope.showDemoPicture1();
        };
        $scope.setIsShowPicture2 = function(){
            $scope.isShowPicture2 = true;
            $scope.showDemoPicture2();
        };
        $scope.setIsShowPicture3 = function(){
            $scope.isShowPicture3 = true;
            $scope.showDemoPicture3();
        };

        $scope.setIsShowLicenseCard1 = function(){
            $scope.isShowLicenseCard1 = true;
            $scope.openLicenseCard1();
        };
        $scope.setIsShowLicenseCard2 = function(){
            $scope.isShowLicenseCard2 = true;
            $scope.openLicenseCard2();
        };
        $scope.setIsShowLicenseCard3 = function(){
            $scope.isShowLicenseCard3 = true;
            $scope.openLicenseCard3();
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



        //1.附件,通过图库
        $scope.pickImage=function(item,field){
            var options = {
                maximumImagesCount: 1,
                width: 800,
                height: 800,
                quality: 80
            };

            $cordovaImagePicker.getPictures(options)
                .then(function (results) {
                    item[field]=results[0];
                 //   alert('img url=' + results[0]);
                }, function (error) {
                    alert("error="+error);
                    // error getting photos
                });
        };

        //2.附件,通过照片
        $scope.takePhoto=function(item,field){
            var options = {
                quality: 100,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: false,
                encodingType: Camera.EncodingType.PNG,
                targetWidth: 300,
                targetHeight: 300,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: true,
                correctOrientation:true
            };

            $cordovaCamera.getPicture(options).then(function(imageURI) {
                item[field] = imageURI;
            //    alert('image url=' + item[field]);
            }, function(err) {
                // error
            });
        };

        //添加附件
        $scope.addAttachment=function(item,field)
        {
            $ionicActionSheet.show({
                buttons: [
                    {text:'图库'},
                    {text:'拍照'}
                ],
                cancelText: '关闭',
                cancel: function() {
                    return true;
                },
                buttonClicked: function(index) {

                    switch (index){
                        case 0:
                            $scope.pickImage(item,field);
                            break;
                        case 1:
                            $scope.takePhoto(item,field);
                            break;
                        default:
                            break;
                    }
                    return true;
                }
            });
        }

        $scope.carInfo['ownerName_error']==true;

        $scope.validate=function(item,field,pattern) {
            if(pattern!==undefined&&pattern!==null)
            {
                var reg=eval(pattern);
                var re=reg.exec(item[field]);
                if(re!==undefined&&re!==null)
                {
                    item[field+'_error']=false;
                }
                else{
                    item[field+'_error']=true;
                }
            }
        };


        $scope.uploadLicenseCardPhotoConfirm=function(){
            if($scope.carInfo.licenseCard1_img!==undefined&&$scope.carInfo.licenseCard1_img!==null
                &&$scope.carInfo.licenseCard2_img!==undefined&&$scope.carInfo.licenseCard2_img!==null
                &&$scope.carInfo.licenseCard3_img!==undefined&&$scope.carInfo.licenseCard3_img!==null)
            {

                console.log('path of licenseCard1 =' + $scope.carInfo.licenseCard1_img);
                console.log('path of licenseCard2 =' + $scope.carInfo.licenseCard2_img);
                console.log('path of licenseCard3 =' + $scope.carInfo.licenseCard3_img);
                $scope.close_uploadLicenseCardModal();
            }
            else{
                $ionicPopup.alert({
                    title: '',
                    template: '请同时上传行驶证3面'
                });
            }
        }

        $scope.carNumChange=function () {
            $scope.carInfo.carNum=$scope.carInfo.carNum.toString().toUpperCase();
        }



        $scope.selectTime=true;
        $scope.datetimepicker=function (item,field) {

            var options = {
                date: new Date(),
                mode: 'date',
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




    });
