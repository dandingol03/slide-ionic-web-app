/**
 * Created by yiming on 16/10/31.
 */
angular.module('starter')

  .controller('appendLifeInsurancederController',function($scope,$state,$http, $location,
                                                     $rootScope,$ionicActionSheet,$cordovaCamera,$cordovaImagePicker,
                                                     $ionicModal,Proxy,$stateParams,$cordovaFileTransfer,$ionicPopup,
                                                          $ionicLoading){

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



    $scope.insuranceder={perTypeCode:'I'};

    if($stateParams.info!==undefined&&$stateParams.info!==null)
    {
      var info=$stateParams.info;
      if(Object.prototype.toString.call(info)=='[object String]')
        info = JSON.parse(info);
      $scope.info=info;
    }

    $scope.mutex=function(item,cluster){
      if(item.checked==true)
      {
        item.checked=false;
      }
      else{
          item.checked=true;
          cluster.map(function(cell,i) {
              if(cell.personId!=item.personId)
                  cell.checked=false;
          });

          $rootScope.dashboard.tabIndex=1;
          $rootScope.life_insurance.insuranceder=item;
          $state.go('life');
      }
    }



    //$scope.car_insurance.relativePersons={};

      $scope.fetchRelativePersons=function () {
          $ionicLoading.show({
              template:'<p class="item-icon-left">拉取关联人...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
          });
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
                              perName:''
                          }
                  }
          }).then(function(res) {
              $ionicLoading.hide();
              var json=res.data;
              if(json.re==1){

                  $scope.relativePersons=[];

                  if(json.data==null||json.data==undefined||json.data.length==0){
                      var myPopup = $ionicPopup.alert({
                          template: '没有已绑定的被保险人，请新建被保险人！',
                          title: '<strong style="color:red">信息</strong>'
                      });
                  }else{

                      var insuranceder=null;

                      if($rootScope.life_insurance.insuranceder!==undefined&&$rootScope.life_insurance.insuranceder!==null)
                          insuranceder=$rootScope.life_insurance.insuranceder;


                      json.data.map(function (person, i) {
                         if(insuranceder!==null)
                         {
                             if(person.personId==insuranceder.personId)
                                 person.checked=true;
                         }
                      });
                      $scope.relativePersons=json.data;
                  }

              }
          }).catch(function (err) {
              var str='';
              for(var field in err)
                  str+=err[field];
              console.error('err=\r\n'+str);
              $ionicLoading.hide();
          })
      }

      $scope.fetchRelativePersons();

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
          {
              item[addon_field] = (index + 1);
              switch(item[field])
              {
                  case '父母':
                      item[addon_field]=1;
                      break;
                  case '子女':
                      item[addon_field]=2;
                      break;
                  case '配偶':
                      item[addon_field]=3;
                      break;
                  case '本人':
                      item[addon_field]=7;
                      break;
                  default:
                      break;
              }
          }
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


    //确认寿险被保险人
    $scope.confirm=function(){

      var persons=$scope.relativePersons;
      var person=null;
      if(persons!==undefined&&persons!==null&&Object.prototype.toString.call(persons)=='[object Array]')
      {
        persons.map(function(relative,i) {
          if(relative.checked==true)
            person=relative;
        });
      }else{
        var myPopup = $ionicPopup.alert({
          template: '请先查询已有关联人',
          title: '<strong style="color:red">错误</strong>'
        });
        return ;
      }
      if(person!==null)
      {
        $scope.order.insuranceder=person;
        $rootScope.dashboard.tabIndex=1;
        $rootScope.life_insurance.insuranceder=person;
        $state.go('life');

      }else{
        var myPopup = $ionicPopup.alert({
          template: '请选择投保人后提交',
          title: '<strong style="color:red">错误</strong>'
        });
      }


      $scope.relativePersons.map(function(relative,i) {
        if(relative.checked==true)
        {
          $scope.order.insuranceder=relative;
          $rootScope.dashboard.tabIndex=1;
          $rootScope.life_insurance.insuranceder=relative;
          $state.go('life');
        }
      });

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
                $scope.insuranceder.personId = personId;

                var suffix = '';
                var imageType = 'perIdCard';
                if ($scope.insuranceder.perIdCard1_img.indexOf('.jpg') != -1)
                    suffix = 'jpg';
                else if ($scope.insuranceder.perIdCard1_img.indexOf('.png') != -1)
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

                return $cordovaFileTransfer.upload(server, $scope.insuranceder.perIdCard1_img, options);
            }else{
                deferred.reject('command encounter error');
            }
        }).then(function(res) {

            alert('upload perIdCard1 success');
            for (var field in res) {
                alert('field=' + field + '\r\n' + res[field]);
            }
            var su = null
            if ($scope.insuranceder.perIdCard1_img.indexOf('.jpg') != -1)
                su = 'jpg';
            else if ($scope.insuranceder.perIdCard1_img.indexOf('.png') != -1)
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
                if ($scope.insuranceder.perIdCard2_img.indexOf('.jpg') != -1)
                    su = 'jpg';
                else if ($scope.insuranceder.perIdCard2_img.indexOf('.png') != -1)
                    su = 'png';
                server = Proxy.local() + '/svr/request?request=uploadPhoto' +
                    '&imageType=' + imageType + '&suffix=' + su + '&filename=' + 'perIdAttachId2' + '&personId=' + personId;

                return $cordovaFileTransfer.upload(server, $scope.insuranceder.perIdCard2_img, options);
            }
        }).then(function (res) {
            alert('upload perIdCard2 success');
            var su = null;
            if ($scope.insuranceder.perIdCard2_img.indexOf('.jpg') != -1)
                su = 'jpg';
            else if ($scope.insuranceder.perIdCard2_img.indexOf('.png') != -1)
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





      //寿险新建被保险人  新"保存"方法

      $scope.uploadNew=function(cmd,item){

          if($scope.insuranceder.perIdCard1_img!==undefined&&$scope.insuranceder.perIdCard1_img!==null)
          {
              if($scope.insuranceder.perIdCard2_img!==undefined&&$scope.insuranceder.perIdCard2_img!==null)
              {
                  var personId=null;
                  $http({
                      method: "POST",
                      url: Proxy.local()+'/svr/request',
                      headers: {
                          'Authorization': "Bearer " + $rootScope.access_token,
                      },
                      data: {
                          request:cmd,
                          info:item
                      }
                  }).then(function(res) {
                      var json =res.data;

                      if(json.re==1){
                          personId=json.data.personId;
                          alert('personId='+ personId);
                          $scope.insuranceder.personId=personId;

                          var suffix='';
                          var imageType='perIdCard';
                          if($scope.insuranceder.perIdCard1_img.indexOf('.jpg')!=-1)
                              suffix='jpg';
                          else if($scope.insuranceder.perIdCard1_img.indexOf('.png')!=-1)
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

                          $cordovaFileTransfer.upload(server, $scope.insuranceder.perIdCard1_img, options)
                              .then(function(res) {
                                  alert('upload perIdCard1 success');
                                  for(var field in res) {
                                      alert('field=' + field + '\r\n' + res[field]);
                                  }
                                  var su=null
                                  if($scope.insuranceder.perIdCard1_img.indexOf('.jpg')!=-1)
                                      su='jpg';
                                  else if($scope.insuranceder.perIdCard1_img.indexOf('.png')!=-1)
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
                                      if($scope.insuranceder.perIdCard2_img.indexOf('.jpg')!=-1)
                                          su='jpg';
                                      else if($scope.insuranceder.perIdCard2_img.indexOf('.png')!=-1)
                                          su='png';
                                      server=Proxy.local()+'/svr/request?request=uploadPhoto' +
                                          '&imageType='+imageType+'&suffix='+su+'&filename='+'perIdAttachId2'+'&personId='+personId;
                                      return  $cordovaFileTransfer.upload(server, $scope.insuranceder.perIdCard2_img, options)
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
                                              alert('insuranceInfoPersonInfo create successfully');
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
                                              alert('go life');
                                              var json=res.data;
                                              if(json.re==1) {

                                                  $rootScope.life_insurance.insuranceder=json.data;
                                                  $state.go('life');
                                              }
                                          });
                                  }
                              })
                      }else{}


                  }).then(function(res) {

                  }).catch(function(err) {
                      var str='';
                      for(var field in err)
                          str+=err[field];
                      alert('error=\r\n' + str);
                  });

              }
              else{
                  var myPopup = $ionicPopup.alert({
                      template: '请拍入关联人的身份证反面再点击关联',
                      title: '<strong style="color:red">错误</strong>'
                  });
              }
          }
          else{
              var myPopup = $ionicPopup.alert({
                  template: '请拍入关联人的身份证正面再点击关联',
                  title: '<strong style="color:red">错误</strong>'
              });
          }


      }








//提交统一函数
    $scope.upload=function(cmd,item){

      var perName=$scope.insuranceder.perName;
      var reg=/\d|\w/;
      if(perName!==undefined&&perName!==null&&perName!==''&&reg.exec(perName)==null)
      {
        if($scope.insuranceder.perIdCard1_img!==undefined&&$scope.insuranceder.perIdCard1_img!==null)
        {
          if($scope.insuranceder.perIdCard2_img!==undefined&&$scope.insuranceder.perIdCard2_img!==null)
          {
            if($scope.insuranceder.relation!==undefined&&$scope.insuranceder.relation!==null)
            {
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
                    perName:$scope.insuranceder.perName
                  }
                }
              }).then(function(res) {
                 var json=res.data;
                 if(json.data==true) {

                   var confirmPopup = $ionicPopup.confirm({
                        template: '您填入的被保人姓名已存在\r\n是否选择关联',
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
                                       perName:$scope.insuranceder.perName
                                   }
                               }
                           }).then(function(res) {
                               var json=res.data;
                               if(json.data==true) {
                                   //已为合法被保险人
                                   $http({
                                       method: "POST",
                                       url: Proxy.local() + "/svr/request",
                                       headers: {
                                           'Authorization': "Bearer " + $rootScope.access_token
                                       },
                                       data: {
                                           request: 'bindLifeInsurancederByPerName',
                                           info: {
                                               perName: $scope.insuranceder.perName,
                                               relation: $scope.insuranceder.relation
                                           }
                                       }
                                   }).then(function(res) {
                                       var json=res.data;
                                       if(json.re==1) {
                                           var myAlert = $ionicPopup.alert({
                                               template: '被保险人绑定成功',
                                               title: '<strong style="color:red">信息</strong>'
                                           });
                                           myAlert.then(function (res) {
                                               $scope.tabIndex=0;
                                               $scope.order.insuranceder=json.data;

                                           });
                                       }else{
                                           var myAlert = $ionicPopup.alert({
                                               template: '被保险人绑定失败',
                                               title: '<strong style="color:red">错误</strong>'
                                           });
                                       }
                                   })


                               }else{
                                 //创键新的合法被保险人
                                   if ($scope.insuranceder.perIdCard1_img !== undefined && $scope.insuranceder.perIdCard1_img !== null
                                       && $scope.insuranceder.perIdCard2_img !== undefined && $scope.insuranceder.perIdCard2_img !== null)
                                   {
                                       $scope.createInsurancePerson($scope.insuranceder.perName).then(function(json) {

                                           return $http({
                                               method: "POST",
                                               url: Proxy.local() + "/svr/request",
                                               headers: {
                                                   'Authorization': "Bearer " + $rootScope.access_token
                                               },
                                               data: {
                                                   request: 'bindLifeInsurerByPerName',
                                                   info: {
                                                       perName: $scope.insuranceder.perName,
                                                       relation: $scope.insuranceder.relation
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
                                                   $scope.order.insuranceder=json.data;
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
                                               if($scope.insuranceder.perIdCard1_img==undefined||$scope.insuranceder.perIdCard1_img==null)
                                                   $scope.addAttachment($scope.insuranceder, 'perIdCard1_img');
                                               else
                                                   $scope.addAttachment($scope.insuranceder, 'perIdCard2_img');
                                           } else {
                                           }
                                       });
                                   }


                               }
                           })



                       }else{

                       }
                   })



                }else{

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

                           $scope.insuranceder.personId=personId;

                           alert('personid='+personId);
                           alert('personid='+$scope.insuranceder.personId);
                           var suffix='';
                           var imageType='perIdCard';
                           alert('path='+$scope.insuranceder.perIdCard1_img);
                           if($scope.insuranceder.perIdCard1_img.indexOf('.jpg')!=-1)
                             suffix='jpg';
                           else if($scope.insuranceder.perIdCard1_img.indexOf('.png')!=-1)
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

                           $cordovaFileTransfer.upload(server, $scope.insuranceder.perIdCard1_img, options)
                               .then(function(res) {
                                 alert('upload perIdCard1 success');
                                 for(var field in res) {
                                   alert('field=' + field + '\r\n' + res[field]);
                                 }
                                 var su=null
                                 if($scope.insuranceder.perIdCard1_img.indexOf('.jpg')!=-1)
                                   su='jpg';
                                 else if($scope.insuranceder.perIdCard1_img.indexOf('.png')!=-1)
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
                                   if($scope.insuranceder.perIdCard2_img.indexOf('.jpg')!=-1)
                                     su='jpg';
                                   else if($scope.insuranceder.perIdCard2_img.indexOf('.png')!=-1)
                                     su='png';
                                   server=Proxy.local()+'/svr/request?request=uploadPhoto' +
                                       '&imageType='+imageType+'&suffix='+su+'&filename='+'perIdAttachId2'+'&personId='+personId;
                                   return  $cordovaFileTransfer.upload(server, $scope.insuranceder.perIdCard2_img, options)
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
                                           $rootScope.life_insurance.insuranceder=json.data;
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
                 }

              })

              }else{
              var myPopup = $ionicPopup.alert({
                template: '请选择亲属关系后再点击关联',
                title: '<strong style="color:red">错误</strong>'
              });
            }

            }
          else{
            var myPopup = $ionicPopup.alert({
              template: '请拍入关联人的身份证反面再点击关联',
              title: '<strong style="color:red">错误</strong>'
            });
          }

          }
        else{
          var myPopup = $ionicPopup.alert({
            template: '请拍入关联人的身份证正面再点击关联',
            title: '<strong style="color:red">错误</strong>'
          });
        }
      }else{
        var myPopup = $ionicPopup.alert({
          template: '您填入的被保人姓名有误\r\n'+'请重新填入后再次点击关联',
          title: '<strong style="color:red">错误</strong>'
        });
      }


    }

  })
