/**
 * Created by yiming on 16/10/31.
 */
angular.module('starter')

  .controller('appendLifeBenefiterController',function($scope,$state,$http, $location,
                                                          $rootScope,$ionicActionSheet,$cordovaCamera,$cordovaImagePicker,
                                                          $ionicModal,Proxy,$stateParams,$cordovaFileTransfer,
                                                       $ionicPopup){

    $scope.go_back=function(){
      window.history.back();
    }

    $scope.tabIndex=0;
    $scope.tab_change=function(i) {
      $scope.tabIndex=i;
    };

      $scope.photoIndex=0;
      $scope.imgArrs=['perIdCard1_img','perIdCard2_img'];

      $scope.changePhotoIndex=function(i){
          $scope.photoIndex=i;

      }

      $scope.selectedTabStyle={width:'26%',display: 'inline-block',background: 'rgba(199, 207, 216, 0.470588)',padding: '7px'};
      $scope.unSelectedTabStyle={width:'26%', display: 'inline-block',padding: '7px'};
      $scope.selectedCellStyle={color:'#fff','text-align': 'center'};
      $scope.unSelectedCellStyle={color:'#eee','text-align': 'center'};

    if($stateParams.info!==undefined&&$stateParams.info!==null)
    {
      var info=$stateParams.info;
      if(Object.prototype.toString.call(info)=='[object String]')
        info=JSON.parse(info);
      if(info.order!==undefined&&info.order!==null)
        $scope.order=info.order;

    }



    $scope.benefiter={};
    $scope.legal={perName:'法定',checked:false};

    $scope.checkLegal=function(){
      if($scope.legal.checked==false){
        $scope.legal.checked=true;
        $scope.order.benefiter.perName=$scope.legal.perName;
        if($scope.relativePersons!==undefined&&$scope.relativePersons!==null){
            $scope.relativePersons.map(function(person,i) {
                person.checked=false;
            });
        }
      }else{
        $scope.legal.checked=false;
        $scope.order.benefiter.perName=null;
      }
    }


    if($stateParams.info!==undefined&&$stateParams.info!==null)
    {
      var info=$stateParams.info;
      if(Object.prototype.toString.call(info)=='[object String]')
        info = JSON.parse(info);
      $scope.info=info;
    }

    $scope.mutex=function(item,cluster){
      if($scope.legal.checked==true){
        cluster.map(function(cell,i) {
          if(cell.personId!=item.personId)
            cell.checked=false;
        })
      }
      else{
        if(item.checked==true)
        {
          item.checked=false;
        }
        else{
          item.checked=true;
          cluster.map(function(cell,i) {
            if(cell.personId!=item.personId)
              cell.checked=false;
          })
        }

      }

    }



    $scope.car_insurance.relativePersons={};

    $scope.selectLifeBenefiter=function(){

      var reg=/\d|\w/;
      if($scope.order.benefiter.perName!==undefined&&$scope.order.benefiter.perName!==null
          &&$scope.order.benefiter.perName!==''&&reg.exec($scope.order.benefiter.perName)==null)
      {
          $http({
              method: "POST",
              url: Proxy.local()+"/svr/request",
              headers: {
                  'Authorization': "Bearer " + $rootScope.access_token
              },
              data:
                  {
                      request:'getRelativePersonsWithinPerName',
                      info:
                          {
                              perName:$scope.order.benefiter.perName
                          }
                  }
          }).then(function(res) {
              var json=res.data;
              if(json.re==1){
                  $scope.relativePersons=json.data;
              }
          })
      }else{
          var myPopup = $ionicPopup.alert({
              template: '所填的关联人姓名有误\r\n'+'请填入关联人姓名后再点击查询',
              title: '<strong style="color:red">错误</strong>'
          });
      }

    }


    $scope.ActionSheet= function (options,item,field,addon_field) {
      var buttons = [];
      options.map(function (item, i) {
        buttons.push({text: item});
      });
      $ionicActionSheet.show({
        buttons: buttons,
        titleText: '',
        cancelText: '取消',
        buttonClicked: function (index) {
          item[field] = buttons[index].text;
          if (addon_field !== undefined && addon_field !== null)
            item[addon_field] = (index + 1);
          return true;
        },
        cssClass: 'motor_insurance_actionsheet'
      });
    }



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
          alert('img url=' + results[0]);
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
        alert('image url=' + item[field]);
      }, function(err) {
        // error
      });
    };


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


    //确认寿险受益人
    $scope.confirm=function(){

      var benefiter=null;
      if($scope.relativePersons!==undefined&&$scope.relativePersons!==null)
      {
        $scope.relativePersons.map(function(relative,i) {
            if(relative.checked==true)
            {
              benefiter=relative;
            }
        })
      };

      if($scope.legal.checked==true){
        $scope.order.benefiter=null;
        $rootScope.dashboard.tabIndex=1;
        $rootScope.life_insurance.benefiter=null;
        $rootScope.life_insurance.isLegalBenefiter=1;
        $state.go('life');
      }
      else{
          if(benefiter!==null)
          {
              $scope.order.benefiter=benefiter;
              $rootScope.dashboard.tabIndex=1;
              $rootScope.life_insurance.benefiter=benefiter;
              $state.go('life');
          }else{
              var myPopup = $ionicPopup.alert({
                  template: '请选择受益人后再点击确认',
                  title: '<strong style="color:red">错误</strong>'
              });
          }
      }

    }


    $scope.createInsurancePerson=function (perName) {
        var deferred=$q.defer();
        var server='';

        var perIdAttachId1 = null;
        var perIdAttachId2 = null;
        var imageType = '';
        var options='';
        var personId=null;
        alert('go into getPersonInfo');
        $http({
            method: "POST",
            url: Proxy.local()+'/svr/request',
            headers: {
                'Authorization': "Bearer " + $rootScope.access_token,
            },
            data:
                {
                    request:'getPersonInfoByPerName',
                    info:{
                        perName:perName
                    }
                }
        }).then(function(res) {

            var json =res.data;
            alert(json.re);
            if(json.re==1) {

                personId = json.data.personId;
                $scope.new={
                    personId:personId
                };
                $scope.benefiter.personId = personId;

                var suffix = '';
                var imageType = 'perIdCard';
                if ($scope.benefiter.perIdCard1_img.indexOf('.jpg') != -1)
                    suffix = 'jpg';
                else if ($scope.benefiter.perIdCard1_img.indexOf('.png') != -1)
                    suffix = 'png';
                else {
                }
                server = Proxy.local() + '/svr/request?request=uploadPhoto' +
                    '&imageType=' + imageType + '&suffix=' + suffix +
                    '&filename=' + 'perIdCard1_img' + '&personId=' + personId;
                options = {
                    fileKey: 'file',
                    headers: {
                        'Authorization': "Bearer " + $rootScope.access_token
                    }
                };

                return $cordovaFileTransfer.upload(server, $scope.benefiter.perIdCard1_img, options);
            }else{
                deferred.reject('command encounter error');
            }
        }).then(function(res) {

            alert('upload perIdCard1 success');
            for (var field in res) {
                alert('field=' + field + '\r\n' + res[field]);
            }
            var su = null
            if ($scope.benefiter.perIdCard1_img.indexOf('.jpg') != -1)
                su = 'jpg';
            else if ($scope.benefiter.perIdCard1_img.indexOf('.png') != -1)
                su = 'png';
            alert('suffix=' + su);
            return $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data: {
                    request: 'createPhotoAttachment',
                    info: {
                        imageType: 'perIdCard',
                        filename: 'perIdAttachId1',
                        suffix: su,
                        docType: 'I1',
                        personId: personId
                    }
                }
            });
        }).then(function (res) {
            var json = res.data;
            if (json.re == 1) {
                perIdAttachId1 = json.data;
                alert('perIdAttachId1=' + perIdAttachId1);
                var su = null;
                if ($scope.benefiter.perIdCard2_img.indexOf('.jpg') != -1)
                    su = 'jpg';
                else if ($scope.benefiter.perIdCard2_img.indexOf('.png') != -1)
                    su = 'png';
                server = Proxy.local() + '/svr/request?request=uploadPhoto' +
                    '&imageType=' + imageType + '&suffix=' + su + '&filename=' + 'perIdAttachId2' + '&personId=' + personId;

                return $cordovaFileTransfer.upload(server, $scope.benefiter.perIdCard2_img, options);
            }
        }).then(function (res) {
            alert('upload perIdCard2 success');
            var su = null;
            if ($scope.benefiter.perIdCard2_img.indexOf('.jpg') != -1)
                su = 'jpg';
            else if ($scope.benefiter.perIdCard2_img.indexOf('.png') != -1)
                su = 'png';

            return $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data: {
                    request: 'createPhotoAttachment',
                    info: {
                        imageType: 'perIdCard',
                        filename: 'perIdAttachId2',
                        suffix: su,
                        docType: 'I1',
                        personId: personId
                    }
                }
            })
        }).then(function (res) {
            var json = res.data;
            if (json.re == 1) {
                perIdAttachId2 = json.data;
                $http({
                    method: "POST",
                    url: Proxy.local() + "/svr/request",
                    headers: {
                        'Authorization': "Bearer " + $rootScope.access_token,
                    },
                    data: {
                        request: 'createInsuranceInfoPersonInfo',
                        info: {
                            perIdAttachId1: perIdAttachId1,
                            perIdAttachId2: perIdAttachId2,
                            personId: personId
                        }
                    }
                }).then(function(res) {
                    var json=res.data;
                    if(json.re==1) {
                        deferred.resolve({re: 1, data: '上传照片完成'});
                    }
                })
            }
        }).catch(function(err) {
            var str='';
            for(var field in err)
                str+=err[field];
            alert('error=\r\n' + str);
            deferred.reject(str);
        });
        return deferred.promise;
    }


    //提交统一函数
    $scope.upload=function(cmd,item){

      var reg=/\d|\w/;
      if($scope.benefiter.perName!==undefined&&$scope.benefiter.perName!==null&&reg.exec($scope.benefiter.perName)==null)
      {
          if($scope.benefiter.relation!==undefined&&$scope.benefiter.relation!==null)
          {
              if($scope.benefiter.perIdCard1_img!==undefined&&$scope.benefiter.perIdCard1_img!==null)
              {
                  if($scope.benefiter.perIdCard2_img!==undefined&&$scope.benefiter.perIdCard2_img!==null)
                  {
                      //TODO:checkPerNameRedundancy
                      $http({
                          method: "POST",
                          url: Proxy.local()+'/svr/request',
                          headers: {
                              'Authorization': "Bearer " + $rootScope.access_token,
                          },
                          data:
                              {
                                  request:'validatePerNameRedundancy',
                                  info:{
                                      perName:$scope.benefiter.perName
                                  }
                              }
                      }).then(function(res) {
                          var json=res.data;
                          if(json.data==true)
                          {
                              var confirmPopup = $ionicPopup.alert({
                                  template: '您新建的受益人姓名已存在\r\n是否选择关联',
                                  title: '<strong style="color:red">信息</strong>'
                              });

                              confirmPopup.then(function(res) {
                                  if(res) {
                                      $http({
                                          method: "POST",
                                          url: Proxy.local() + "/svr/request",
                                          headers: {
                                              'Authorization': "Bearer " + $rootScope.access_token
                                          },
                                          data: {
                                              request: 'validateIsLegitimateInsurancePersonOrNot',
                                              info:{
                                                  perName:$scope.benefiter.perName
                                              }
                                          }
                                      }).then(function(res) {
                                          var json=res.data;
                                          if(json.data==true) {
                                              //已为合法受益人
                                              $http({
                                                  method: "POST",
                                                  url: Proxy.local() + "/svr/request",
                                                  headers: {
                                                      'Authorization': "Bearer " + $rootScope.access_token
                                                  },
                                                  data: {
                                                      request: 'bindLifeBenefiterByPerName',
                                                      info: {
                                                          perName: $scope.benefiter.perName,
                                                          relation: $scope.benefiter.relation
                                                      }
                                                  }
                                              }).then(function(res) {
                                                  var json=res.data;
                                                  if(json.re==1) {
                                                      var myAlert = $ionicPopup.alert({
                                                          template: '受益人绑定成功',
                                                          title: '<strong style="color:red">信息</strong>'
                                                      });
                                                      myAlert.then(function (res) {
                                                          $scope.tabIndex=0;
                                                          $scope.order.benefiter=json.data;
                                                      });
                                                  }
                                                  else{
                                                      var myAlert = $ionicPopup.alert({
                                                          template: '受益人绑定失败',
                                                          title: '<strong style="color:red">错误</strong>'
                                                      });
                                                  }
                                              })


                                          }else{
                                              //创建新的合法受益人
                                              if ($scope.benefiter.perIdCard1_img !== undefined && $scope.benefiter.perIdCard1_img !== null
                                                  && $scope.benefiter.perIdCard2_img !== undefined && $scope.benefiter.perIdCard2_img !== null)
                                              {
                                                  $scope.createInsurancePerson($scope.benefiter.perName).then(function(json) {

                                                      return $http({
                                                          method: "POST",
                                                          url: Proxy.local() + "/svr/request",
                                                          headers: {
                                                              'Authorization': "Bearer " + $rootScope.access_token
                                                          },
                                                          data: {
                                                              request: 'bindLifeInsurerByPerName',
                                                              info: {
                                                                  perName: $scope.benefiter.perName,
                                                                  relation: $scope.benefiter.relation
                                                              }
                                                          }
                                                      });
                                                  }).then(function (res) {
                                                      var json = res.data;
                                                      if (json.re == 1) {

                                                          var myAlert = $ionicPopup.alert({
                                                              template: '投保人绑定成功',
                                                              title: '<strong style="color:red">信息</strong>'
                                                          });

                                                          //跳转回第1子tab
                                                          myAlert.then(function(res) {
                                                              $scope.tabIndex=0;
                                                              $scope.order.benefiter=json.data;
                                                          });

                                                      } else {
                                                          var myPopup = $ionicPopup.alert({
                                                              template: '投保人绑定失败',
                                                              title: '<strong style="color:red">错误</strong>'
                                                          });
                                                      }
                                                  })
                                              }else{
                                                  var confirmPopup = $ionicPopup.confirm({
                                                      title: '信息',
                                                      template: '请上传身份证后关联此投保人\r\n是否现在进行拍照'
                                                  });
                                                  confirmPopup.then(function (res) {
                                                      if (res) {
                                                          if($scope.benefiter.perIdCard1_img==undefined||$scope.benefiter.perIdCard1_img==null)
                                                              $scope.addAttachment($scope.benefiter, 'perIdCard1_img');
                                                          else
                                                              $scope.addAttachment($scope.benefiter, 'perIdCard2_img');
                                                      } else {
                                                      }
                                                  });
                                              }


                                          }
                                      })
                                  }
                              })





                            return ;
                          }


                          var personId=null;
                          $http({
                              method: "POST",
                              url: Proxy.local()+'/svr/request',
                              headers: {
                                  'Authorization': "Bearer " + $rootScope.access_token,
                              },
                              data:
                                  {
                                      request:cmd,
                                      info:item
                                  }
                          })
                              .then(function(res) {

                                  var json =res.data;
                                  alert(json.re);
                                  if(json.re==1){

                                      personId=json.data.personId;

                                      $scope.benefiter.personId=personId;

                                      alert('personid='+personId);
                                      alert('personid='+$scope.benefiter.personId);
                                      var suffix='';
                                      var imageType='perIdCard';
                                      alert('path='+$scope.benefiter.perIdCard1_img);
                                      if($scope.benefiter.perIdCard1_img.indexOf('.jpg')!=-1)
                                          suffix='jpg';
                                      else if($scope.benefiter.perIdCard1_img.indexOf('.png')!=-1)
                                          suffix='png';
                                      else{}
                                      var server=Proxy.local()+'/svr/request?request=uploadPhoto' +
                                          '&imageType='+imageType+'&suffix='+suffix+
                                          '&filename='+'perIdCard1_img'+'&personId='+personId;
                                      var options = {
                                          fileKey:'file',
                                          headers: {
                                              'Authorization': "Bearer " + $rootScope.access_token
                                          }
                                      };

                                      var perIdAttachId1=null;
                                      var perIdAttachId2=null;

                                      $cordovaFileTransfer.upload(server, $scope.benefiter.perIdCard1_img, options)
                                          .then(function(res) {
                                              alert('upload perIdCard1 success');
                                              for(var field in res) {
                                                  alert('field=' + field + '\r\n' + res[field]);
                                              }
                                              var su=null
                                              if($scope.benefiter.perIdCard1_img.indexOf('.jpg')!=-1)
                                                  su='jpg';
                                              else if($scope.benefiter.perIdCard1_img.indexOf('.png')!=-1)
                                                  su='png';
                                              alert('suffix=' + su);
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
                                                              imageType:'perIdCard',
                                                              filename:'perIdAttachId1',
                                                              suffix:su,
                                                              docType:'I1' ,
                                                              personId:personId
                                                          }
                                                      }
                                              });
                                          })
                                          .then(function(res) {
                                              var json=res.data;
                                              if(json.re==1) {
                                                  perIdAttachId1=json.data;
                                                  alert('perIdAttachId1=' + perIdAttachId1);
                                                  var su=null;
                                                  if($scope.benefiter.perIdCard2_img.indexOf('.jpg')!=-1)
                                                      su='jpg';
                                                  else if($scope.benefiter.perIdCard2_img.indexOf('.png')!=-1)
                                                      su='png';
                                                  server=Proxy.local()+'/svr/request?request=uploadPhoto' +
                                                      '&imageType='+imageType+'&suffix='+su+'&filename='+'perIdAttachId2'+'&personId='+personId;
                                                  return  $cordovaFileTransfer.upload(server, $scope.benefiter.perIdCard2_img, options)
                                                      .then(function(res) {
                                                          alert('upload perIdCard2 success');
                                                          for(var field in res) {
                                                              alert('field=' + field + '\r\n' + res[field]);
                                                          }
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
                                                                          imageType:'perIdCard',
                                                                          filename:'perIdAttachId2',
                                                                          suffix:su,
                                                                          docType:'I1' ,
                                                                          personId:personId
                                                                      }
                                                                  }
                                                          });
                                                      }) .then(function(res) {
                                                          var json=res.data;
                                                          if(json.re==1){
                                                              perIdAttachId2=json.data;
                                                              return $http({
                                                                  method: "POST",
                                                                  url: Proxy.local()+"/svr/request",
                                                                  headers: {
                                                                      'Authorization': "Bearer " + $rootScope.access_token,
                                                                  },
                                                                  data:
                                                                      {
                                                                          request:'createInsuranceInfoPersonInfo',
                                                                          info:{
                                                                              perIdAttachId1:perIdAttachId1,
                                                                              perIdAttachId2:perIdAttachId2,
                                                                              personId:personId
                                                                          }
                                                                      }
                                                              });
                                                          }
                                                      }).then(function(res) {
                                                          var json=res.data;
                                                          if(json.re==1) {
                                                              return $http({
                                                                  method: "POST",
                                                                  url: Proxy.local()+"/svr/request",
                                                                  headers: {
                                                                      'Authorization': "Bearer " + $rootScope.access_token,
                                                                  },
                                                                  data:
                                                                      {
                                                                          request:'getInfoPersonInfoByPersonId',
                                                                          info:{
                                                                              personId:personId
                                                                          }
                                                                      }
                                                              });
                                                          }
                                                      }).then(function(res) {
                                                          var json=res.data;
                                                          if(json.re==1) {
                                                              $rootScope.life_insurance.benefiter=json.data;
                                                              $rootScope.dashboard.tabIndex=1;
                                                              $state.go('tabs.dashboard');
                                                          }
                                                      });
                                              }
                                          })
                                  }else{}


                              }).then(function(res) {
                          })
                              .catch(function(err) {
                                  var str='';
                                  for(var field in err)
                                      str+=err[field];
                                  alert('error=\r\n' + str);
                              });

                      });


                  }else{
                      var myPopup = $ionicPopup.alert({
                          template: '请上传关联人的身份证反面后再点击关联',
                          title: '<strong style="color:red">错误</strong>'
                      });
                  }
              }else{
                  var myPopup = $ionicPopup.alert({
                      template: '请上传关联人的身份证正面后再点击关联',
                      title: '<strong style="color:red">错误</strong>'
                  });
              }
          }else{
              var myPopup = $ionicPopup.alert({
                  template: '请选择亲属关系后再点击关联',
                  title: '<strong style="color:red">错误</strong>'
              });
          }
      }else{
          var myPopup = $ionicPopup.alert({
              template: '所填的姓名格式有误\r\n'+'请填入关联人姓名后再点击关联',
              title: '<strong style="color:red">错误</strong>'
          });
      }




    }





  })
