/**
 * Created by yiming on 16/10/31.
 */
angular.module('starter')

  .controller('appendCarInsurancederController',function($scope,$state,$http, $location,
                                                $rootScope,$ionicActionSheet,$cordovaCamera,$cordovaImagePicker,
                                                $ionicModal,Proxy,$stateParams,$cordovaFileTransfer,
                                                $q,$ionicPopup,$ionicLoading){

    $scope.go_back=function(){
      window.history.back();
    }

    $scope.tabIndex=0;
    $scope.tab_change=function(i) {
      $scope.tabIndex=i;
    };

    $scope.insuranceder={};

    $scope.photoIndex=0;
    $scope.imgArrs=['perIdCard1_img','perIdCard2_img'];

<<<<<<< HEAD
      $scope.changePhotoIndex=function(photoIndex){
          if(photoIndex==0){
              $scope.photoIndex=1;
          }else{
              $scope.photoIndex=0;
          }
=======
      $scope.changePhotoIndex=function(i){
              $scope.photoIndex=i;
>>>>>>> 19545a9c04ba73376564c861e54a520d9c01fd40
      }

      $scope.validate=function(item,field,pattern) {
          if(pattern!==undefined&&pattern!==null)
          {
              var reg=eval(pattern);
              var re=reg.exec(item[field]);
              if(re!==undefined&&re!==null)
              {
                  item[field+'_error']=true;
              }
              else{
                  item[field+'_error']=false;
              }
          }
      };


    if($stateParams.info!==undefined&&$stateParams.info!==null)
    {
      var info=$stateParams.info;
      if(Object.prototype.toString.call(info)=='[object String]')
        info = JSON.parse(info);
      $scope.info=info;

      $scope.info.products.map(function(product,i){
        if(product.productId==null||product.productId==undefined){
          product.productId=product.productIds[0];
        }
      })
    }

    $scope.mutex=function(item,cluster){
      if(item.checked==true)
      {
       item.checked=false;
      }
      else{
        item.checked=true;
        $scope.car_insurance.insuranceder=item;
        cluster.map(function(cell,i) {
          if(cell.personId!=item.personId)
            cell.checked=false;
        })
      }
    }

    $scope.selectInsuranceder=function(person){
      person.check=true;
    }

    $scope.car_insurance.insuranceder={
      perName:''
    };

    $scope.car_insurance.relativePersons={};

    $scope.selectCarInsuranceder=function(){

        if($scope.sheild!==true)
        {
            $scope.sheild=true;
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
                                perName:$scope.car_insurance.insuranceder.perName
                            }
                    }
            }).then(function(res) {
                var json=res.data;
                if(json.re==1){
                    $scope.car_insurance.relativePersons=json.data;
                }
                $scope.sheild=false;
            }).catch(function(err) {
                var str='';
                for(var field in err)
                    str+=err[field];
                console.error('err=\r\n'+str);
                $scope.sheild=false;
            })
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


    $scope.checkCarFreeOrNot=function () {
        var deferred=$q.defer();

        return deferred.promise;
    }

      //提交车险意向
      $scope.confirm=function(){

          if($scope.tabIndex==0)
          {
              //选择已有被保险人,提交车险订单

              if($scope.car_insurance.insuranceder.perName!==undefined&&$scope.car_insurance.insuranceder.perName!==null
                &&$scope.car_insurance.insuranceder.perName!=='')
              {

                  if($scope.car_insurance.insuranceder.personId==null||$scope.car_insurance.insuranceder.personId==undefined)
                  {
                      var myPopup = $ionicPopup.alert({
                          template: '被选择被保险人后点击提交',
                          title: '<strong style="color:red">错误</strong>'
                      });
                  }else{

                      //TODO:check car is free or not
                      $http({
                          method: "POST",
                          url: Proxy.local() + "/svr/request",
                          headers: {
                              'Authorization': "Bearer " + $rootScope.access_token
                          },
                          data: {
                              request: 'validateCarFree',
                              info: {
                                  carId: $scope.info.carId
                              }
                          }
                      }).then(function (res) {
                          var json=res.data;
                          if(json.data==true)
                          {
                              $ionicLoading.show({
                                  template:'<p class="item-icon-left">生成车险订单...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
                              });
                              $http({
                                  method: "POST",
                                  url: Proxy.local()+"/svr/request",
                                  headers: {
                                      'Authorization': "Bearer " + $rootScope.access_token
                                  },
                                  data:
                                      {
                                          request:'generateCarInsuranceOrder',
                                          info:
                                              {
                                                  products:$scope.info.products,
                                                  companys:$scope.info.companys,
                                                  carId:$scope.info.carId,
                                                  insurancederId:$scope.car_insurance.insuranceder.personId
                                              }
                                      }
                              }).then(function(res) {
                                  var json=res.data;
                                  var orderId=json.data;
                                  if(orderId!==undefined&&orderId!==null)
                                  {
                                      $ionicLoading.hide();
                                      alert('订单已创建,请等待报价');

                                      $state.go('car_orders');
                                  }
                              }).catch(function(err) {
                                  var str='';
                                  for(var field in err)
                                      str+=err[field];
                                  console.error('err=\r\n'+str);
                              });
                          }else{
                              var myPopup = $ionicPopup.alert({
                                  template: '您所选的车已在订单状态,\r\n不能重复提交订单',
                                  title: '<strong style="color:red">错误</strong>'
                              });
                          }
                      });
                  }



              }else{
                  var myPopup = $ionicPopup.alert({
                      template: '被输入被保险人后点击提交',
                      title: '<strong style="color:red">错误</strong>'
                  });
              }





          }else{
              //新建被保险人,提交车险订单
              var reg=/\d|\w/;
              var flag=false;
              if($scope.car_insurance.insuranceder.perName==undefined||$scope.car_insurance.insuranceder.perName==null
                ||$scope.car_insurance.insuranceder.perName==''||reg.exec($scope.car_insurance.insuranceder.perName)!==null)
              {
                    flag=true;
              }
              if(flag)
              {
                  var myPopup = $ionicPopup.alert({
                      template: '被保险人姓名输写不对,请重新输入后提交',
                      title: '<strong style="color:red">错误</strong>'
                  });

              }else{

                  //TODO:check car is free or not
                  $http({
                      method: "POST",
                      url: Proxy.local() + "/svr/request",
                      headers: {
                          'Authorization': "Bearer " + $rootScope.access_token
                      },
                      data: {
                          request: 'validateCarFree',
                          info: {
                              carId: $scope.info.carId
                          }
                      }
                  }).then(function(res) {
                      var json=res.data;
                      if(json.data==true)
                      {
                          $http({
                              method: "POST",
                              url: Proxy.local()+"/svr/request",
                              headers: {
                                  'Authorization': "Bearer " + $rootScope.access_token
                              },
                              data:
                                  {
                                      request:'validatePerNameRedundancy',
                                      info:
                                          {
                                              perName:$scope.car_insurance.insuranceder.perName
                                          }
                                  }
                          }).then(function(res) {
                              var json=res.data;
                              if(json.data==true)
                              {
                                  $ionicPopup.alert({
                                      title: '错误',
                                      template: '已有该被保险人，无法进行创建'
                                  });

                              }else{
                                  if($scope.car_insurance.insuranceder.perIdCard1_img!==undefined&&$scope.car_insurance.insuranceder.perIdCard1_img!==null
                                      &&$scope.car_insurance.insuranceder.perIdCard2_img!==undefined&&$scope.car_insurance.insuranceder.perIdCard2_img!==null)
                                  {
                                      //提交照片
                                      $scope.upload('createRelativePerson',$scope.car_insurance.insuranceder,'perIdCard_img').then(function(json) {
                                          if(json.re==1) {
                                              $http({
                                                  method: "POST",
                                                  url: Proxy.local()+"/svr/request",
                                                  headers: {
                                                      'Authorization': "Bearer " + $rootScope.access_token
                                                  },
                                                  data:
                                                      {
                                                          request:'generateCarInsuranceOrder',
                                                          info:
                                                              {
                                                                  products:$scope.info.products,
                                                                  companys:$scope.info.companys,
                                                                  carId:$scope.info.carId,
                                                                  insurancederId:$scope.insuranceder.personId
                                                              }
                                                      }
                                              }).then(function(res) {
                                                  var json=res.data;
                                                  var orderId=json.data;
                                                  if(orderId!==undefined&&orderId!==null)
                                                  {

                                                      alert('订单已创建,请等待报价');

                                                      $state.go('car_orders');
                                                  }
                                              }).catch(function(err) {
                                                  var str='';
                                                  for(var field in err)
                                                      str+='field'+field+'\r\n'
                                                          +err[field];
                                                  console.error('error=\r\n' + str);
                                              });
                                          }
                                      })
                                  }else{

                                      var confirmPopup = $ionicPopup.confirm({
                                          title: '您还未上传身份证',
                                          template: '是否现在进行拍照'
                                      });
                                      confirmPopup.then(function(res) {
                                          if(res) {
                                              $scope.addAttachment($scope.car_insurance.insuranceder,'perIdCard1_img');
                                          } else {}
                                      });
                                  }
                              }
                          });
                      }else{
                          var myPopup = $ionicPopup.alert({
                              template: '您所选的车已在订单状态,\r\n不能重复提交订单',
                              title: '<strong style="color:red">错误</strong>'
                          });
                      }
                  });


              }


          }
      }


//提交统一函数
    $scope.upload=function(cmd,item,field){

        var deferred=$q.defer();
        var server='';

        var perIdAttachId1 = null;
        var perIdAttachId2 = null;
        var imageType = '';
        var options='';
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
          if(json.re==1) {

              personId = json.data.personId;
              $scope.insuranceder.personId = personId;

              var suffix = '';
              var imageType = 'perIdCard';
              if ($scope.car_insurance.insuranceder.perIdCard1_img.indexOf('.jpg') != -1)
                  suffix = 'jpg';
              else if ($scope.car_insurance.insuranceder.perIdCard1_img.indexOf('.png') != -1)
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

              return $cordovaFileTransfer.upload(server, $scope.car_insurance.insuranceder.perIdCard1_img, options);
          }else{
              deferred.reject('command encounter error');
          }
        }).then(function(res) {

          alert('upload perIdCard1 success');
          for (var field in res) {
              alert('field=' + field + '\r\n' + res[field]);
          }
          var su = null
          if ($scope.car_insurance.insuranceder.perIdCard1_img.indexOf('.jpg') != -1)
              su = 'jpg';
          else if ($scope.car_insurance.insuranceder.perIdCard1_img.indexOf('.png') != -1)
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
              if ($scope.car_insurance.insuranceder.perIdCard2_img.indexOf('.jpg') != -1)
                  su = 'jpg';
              else if ($scope.car_insurance.insuranceder.perIdCard2_img.indexOf('.png') != -1)
                  su = 'png';
              server = Proxy.local() + '/svr/request?request=uploadPhoto' +
                  '&imageType=' + imageType + '&suffix=' + su + '&filename=' + 'perIdAttachId2' + '&personId=' + personId;

              return $cordovaFileTransfer.upload(server, $scope.car_insurance.insuranceder.perIdCard2_img, options);
          }
      }).then(function (res) {
            alert('upload perIdCard2 success');
          var su = null;
          if ($scope.car_insurance.insuranceder.perIdCard2_img.indexOf('.jpg') != -1)
              su = 'jpg';
          else if ($scope.car_insurance.insuranceder.perIdCard2_img.indexOf('.png') != -1)
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
      })
      .catch(function(err) {
          var str='';
          for(var field in err)
            str+=err[field];
          alert('error=\r\n' + str);
          deferred.reject(str);
        });

      return deferred.promise;
    }





  })
