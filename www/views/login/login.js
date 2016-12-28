/**
 * Created by danding on 16/9/6.
 */
angular.module('starter')

    .controller('loginController',function($scope,$state,$ionicLoading,$http,$ionicPopup,$timeout,$rootScope
        ,$cordovaFile,$cordovaFileTransfer,$ionicActionSheet,$cordovaCamera,Proxy
        ,$WebSocket,$ionicPopover,$cordovaPreferences,$ionicPlatform){



      $scope.formUser = {};

      $scope.user={};

      $scope.users=[];

      if($rootScope.username!==undefined&&$rootScope.username!==null){
          $scope.user.username = $rootScope.username;
      }

       if($rootScope.password!==undefined&&$rootScope.password!==null){
           $scope.user.password = $rootScope.password;
       }

      $scope.fetch = function() {

          $cordovaPreferences.fetch('username')
              .success(function(value) {
                  if(value!==undefined&&value!==null&&value!='')
                      $scope.user.username=value;
                  $cordovaPreferences.fetch('password')
                      .success(function(value) {
                          if(value!==undefined&&value!==null&&value!='')
                              $scope.user.password=value;
                          if($scope.user.username!==undefined&&$scope.user.username!==null&&$scope.user.username!=''
                            &&$scope.user.password!==undefined&&$scope.user.password!==null&&$scope.user.password!='')
                          {
                              $scope.doLogin();
                          }

                      })
                      .error(function(error) {
                          alert("Error: " + error);
                      });
              })
              .error(function(error) {
                  alert("Error: " + error);
              });

      };


        if(window.cordova)
        {
            $ionicPlatform.ready (function () {
                $scope.fetch();
            })
        }else{
            //浏览器环境
            if(window.localStorage.user!==undefined&&window.localStorage.user!==null&&window.localStorage.user!='')
            {
                try{
                    var user=JSON.parse(window.localStorage.user);
                    if(user.username!==null&&user.username!==undefined)
                        $scope.user.username=user.username;
                    if(user.password!==null&&user.password!==undefined)
                        $scope.user.password=user.password;
                }catch(e)
                {
                    console.error(e.toString());
                }

            }
        }

        $scope.goto = function(){
            $state.go('wechatDemo');

        }

        $scope.togglePwdPersistent = function(){
          if($scope.pwdPersisted==true){
              $scope.pwdPersisted=false;
              $cordovaPreferences.store('pwdPersisted', false)
                  .success(function(value) {
                  })
                  .error(function(error) {
                      alert("Error: " + error);
                  })
          }else{

              $scope.pwdPersisted=true;
              $cordovaPreferences.store('pwdPersisted', true)
                  .success(function(value) {
                  })
                  .error(function(error) {
                      console.error("Error: " + error);
                  })
          }
      }

      $scope.historyUserName = function(){
          try{
              $cordovaPreferences.fetch('users')
                  .success(function(value) {
                      if(value!==undefined&&value!==null&&value.length>0){

                          var buttons=[];
                          value.map(function(user,i) {
                              buttons.push({text: user.username});
                              $scope.users.push(user);

                          });

                          $ionicActionSheet.show({
                              buttons:buttons,
                              titleText: '曾登录过的账号',
                              cancelText: 'Cancel',
                              buttonClicked: function(index) {
                                  $scope.user.username = buttons[index].text;
                                  $scope.user.password = value[index].password;
                                  return true;
                              },
                              cssClass:'motor_insurance_actionsheet'
                          });
                      }

                  })
          }catch(e)
          {
              alert('exception=' + e.toString());
          }



      }





        $WebSocket.registeCallback(function(msg) {
        console.log('//-----ws\r\n' + msg);
      });

      /**
       * websocket测试
       */
      //$WebSocket.connect();


      var options = {
            date: new Date(),
            mode: 'datetime',
        };

//*******************测试百悟短信验证码*********************//

      $scope.baiwu = function(){

        $http({
          method:'POST',
          url:"/proxy/send",
          headers:{
            'Content-Type':'application/json'
          },
          data:{  corp_id:'hy6550',
            corp_pwd:'mm2289',
            corp_service:'1069003256550',
            mobile:'18253160627',
            msg_content:'hello,xyd',
            corp_msg_id:'',
            ext:'' // your data” }
          }}).
        success(function (response) {
          console.log('success');
        }).
        error(function (err) {
          var str='';
          for(var field in err)
            str+=field+':'+err[field];
          console.log('error='+str);
        });
      }


//*******************测试百悟短信验证码*********************//

      $scope.securityCode_generate=function(){

        $http.get('/securityCode?cellphone='+$scope.user.username,{
          headers:{
            'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then(function(res) {
          console.log('scurity code generated');
        }).catch(function (err) {
          var error='';
          for(var field in err) {
            error+=field+':'+err[field]+'\r\n';
          }
          alert('error=' + error);
        });
      };

      $scope.insuranceder={};

      $scope.initModal=function() {
        ModalService.initModal($scope,$scope.insuranceder);
      }

      $scope.openModal=function(){
        $scope.insuranceder.modal.show();
      }


      //注册
      $scope.goRegister = function(){
        $state.go('register');
      }


        // var deregister = $ionicPlatform.registerBackButtonAction(
        //     function () {
        //         console.log("close the popup")
        //     }, 505
        // );
        //
        // $scope.$on('$destroy', deregister)




        $scope.doLogin=function(){
        if($rootScope.registrationId==undefined||$rootScope.registrationId==null||$rootScope.registrationId=='')
        {

          if(window.plugins!==undefined&&window.plugins!==null) {
            try {

                window.plugins.jPushPlugin.getRegistrationID(function(data) {
                    alert('registrationId=\r\n'+data);
                    $rootScope.registrationId=data;
                    $scope.login();
                });
            } catch (e) {
              alert(e);
            }
          }
          else{
            $scope.login();
          }
        }else{
          $scope.login();
        }
      }


      //登录
      $scope.login = function() {

          $ionicLoading.show({
                  template:'<p class="item-icon-left">Loading...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
          });

          $http({
              method: "POST",
              data: "grant_type=password&password=" + $scope.user.password + "&username=" + $scope.user.username,
              url: Proxy.local() + '/login',
              headers: {
                  'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
                  'Content-Type': 'application/x-www-form-urlencoded'
              }
          }).then(function (res) {

              $ionicLoading.hide();

              var json = res.data;
              var access_token = json.access_token;

              if(window.plugins!==undefined&&window.plugins!==null) {
                  $cordovaPreferences.store('username', $scope.user.username)
                      .success(function(value) {
                      })
                      .error(function(error) {
                          alert("Error: " + error);
                      });
                  $cordovaPreferences.store('password', $scope.user.password)
                      .success(function(value) {
                      })
                      .error(function(error) {
                          alert("Error: " + error);
                      })
              }else{
                  window.localStorage.user = JSON.stringify({
                      username: $scope.user.username,
                      password: $scope.user.password
                  });
              }


              if (access_token !== undefined && access_token !== null) {
                  alert('access_token='+access_token);
                  $rootScope.access_token = access_token;
                  console.log('registrationId=\r\n' + $rootScope.registrationId);


                  //获取个人信息
                  $http({
                      method: "POST",
                      url: Proxy.local() + "/svr/request",
                      headers: {
                          'Authorization': "Bearer " + $rootScope.access_token
                      },
                      data: {
                          request: 'getPersonInfoByPersonId'
                      }
                  }).then(function(res) {
                      var json=res.data;
                      if(json.re==1) {
                          $rootScope.userInfo=json.data;
                          //手机环境
                          if (window.cordova !== undefined && window.cordova !== null) {
                              $http({
                                  method: "POST",
                                  url: Proxy.local() + "/svr/request",
                                  headers: {
                                      'Authorization': "Bearer " + $rootScope.access_token
                                  },
                                  data: {
                                      request: 'activatePersonOnline',
                                      info: {
                                          registrationId: $rootScope.registrationId !== undefined && $rootScope.registrationId !== null ? $rootScope.registrationId : ''
                                      }
                                  }
                              }).then(function (res) {
                                  var json = res.data;
                                  if (json.re == 1 || json.result == 'ok') {
                                      $state.go('tabs.dashboard_backup');
                                  }
                              }).catch(function (err) {
                                  var error = '';
                                  for (var field in err) {
                                      error += err[field] + '\r\n';
                                  }
                                  alert('error=' + error);
                              });
                          } else {
                              $state.go('tabs.dashboard_backup');
                          }
                      }
                  })
              }
              else
                  console.log('cannot get access_token');
          }).catch(function(err) {
              var msg=err.data;
              if(msg.error=='invalid_grant')
              {
                  if(msg.error_description=='User credentials are invalid')
                  {

                      $http({
                          method: "POST",
                          url: Proxy.local() + "/validateUser?username="+$scope.user.username+'&'+'password='+$scope.user.password,
                          headers: {
                              'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
                              'Content-Type': 'application/x-www-form-urlencoded'
                          }
                      }).then(function(res) {
                          var json=res.data;
                          if(json.re==2)
                          {
                              $ionicPopup.alert({
                                  title: '错误',
                                  template: '密码无法匹配用户名'
                              });
                          }else if(json.re==-1)
                          {
                              $ionicPopup.alert({
                                  title: '错误',
                                  template: '用户名不存在'
                              });
                          }else{}
                      });


                  }
              }
              $ionicLoading.hide();

          })
      }

      $scope.doSend=function(){
        $WebSocket.send({
          action:'msg',
          msgid:$WebSocket.getMsgId(),
          timems:new Date(),
          msg:'first message',
          to:{
            groupid:'presale'
          }
        });
      }


      //文件下载
      $scope.download=function(){
        var url='http://192.168.0.199:9030/get/photo/home.jpg';
        var targetPath=cordova.file.documentsDirectory + "home.jpg";
        var trustHosts = true;
        var options = {};
        $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
            .then(function(result) {
              alert('success');
            }, function(err) {
              // Error
              alert('error');
            }, function (progress) {
              $timeout(function () {
                $scope.downloadProgress = (progress.loaded / progress.total) * 100;
              });
            });
      }


      //文件上传
      $scope.upload=function(){
        var server='http://192.168.0.199:9030/upload/photo/image.jpg';
        var options = {};
        options.fileKey = "file";
        $cordovaFileTransfer.upload(server, $scope.photo, options)
            .then(function(result) {
              // Success!
              alert('upload success');
            }, function(err) {
              // Error
              alert('encounter error');
            }, function (progress) {
              // constant progress updates
            });
      }



      $scope.test=function() {
        $http.get("http://202.194.14.106:3000/insurance/get_lifeinsurance_list").
        then(function(res) {
          if(res.data!==undefined&&res.data!==null)
          {
            var life_insurances=res.data.life_insurances;
            if(Object.prototype.toString.call(life_insurances)!='[object Array]')
              life_insurances=JSON.parse(life_insurances);
            life_insurances.map(function(insurance,i) {
              alert(insurance);
            });
          }
        }).catch(function(err) {
          alert('err=' + err);
        });

      }

      //拍照
      $scope.addPicture = function(type) {

        $ionicActionSheet.show({
          buttons: [
            { text: '拍照' },
            { text: '从相册选择' }
          ],
          titleText: '选择照片',
          cancelText: '取消',
          cancel: function() {
            return true;
          },
          buttonClicked: function(index) {
            if(index == 0){

              var options = {
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: 1,
                saveToPhotoAlbum: true
              };


            }else if(index == 1){
              var options = {
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: 0
              };
            }

            $cordovaCamera.getPicture(options).then(function(imageURI) {
              $scope.photo= imageURI;
              alert('url of photo =\r\n' + imageURI);
            }, function(err) {
              // error
              alert('errpr=' + err);
            });
            return true;
          }
        });
      }

      $scope.uploadPhoto=function(){

        $cordovaFileTransfer.upload(server, $scope.photo,options)
            .then(function(result) {
              var response=result.response;
              var json=eval('('+response+')');
              if(json.type!==undefined&&json.type!==null)
              {
                $ionicLoading.show({
                  template: json.content,
                  duration: 2000
                });
                //TODO:将本用户更新照片的消息通过websocket发送给其他用户

              }else{
                $ionicLoading.show({
                  template: "field type doesn't exist in response",
                  duration: 2000
                });
              }

            }, function(err) {
              // Error
              alert("err:"+err);
            }, function (progress) {
              // constant progress updates
            });

      }

      $scope.goMap=function () {
          $state.go('map_search');
      }


      /***  悬浮窗  ***/
      $ionicPopover.fromTemplateUrl('/views/popover/order_special_popover.html', {
        scope: $scope
      }).then(function(popover) {
        $scope.popover = popover;
      });

      $scope.openPopover = function($event) {
        $scope.popover.show($event);
      };
      $scope.closePopover = function() {
        $scope.popover.hide();
      };
      /***  悬浮窗  ***/



      $scope.uploadCarAndOwnerInfo=function()
      {
        $http.get("http://localhost:9030/insurance/get_lifeinsurance_list",
            {
              data:
              {
                request:'uploadCarAndOwnerInfo',
                info:
                {
                  carPhoto:$scope.photo,
                  ownerIdPhoto:$scope.photo
                }
              }
            }).
        then(function(res) {
          if(res.data!==undefined&&res.data!==null)
          {
            var life_insurances=res.data.life_insurances;
            if(Object.prototype.toString.call(life_insurances)!='[object Array]')
              life_insurances=JSON.parse(life_insurances);
            life_insurances.map(function(insurance,i) {
              alert(insurance);
            });
          }
        }).catch(function(err) {
          alert('err=' + err);
        });
      }


      $scope.baidu=function(){
        $http({
          method:'GET',
          url:"/proxy/send",
          headers:{
            'Access-Control-Allow-Origin':'*'
          }}).
        success(function (response) {
          console.log('success');
        }).error(function(err) {
          console.log('...');
        });
      }

      $scope.goFetchPassword=function(){
          $state.go('passwordForget');
      }

      $scope.init_voice=function () {
          var options_init={
              appId:"8974317",
              apiKey:"Pm9rUkPY2jLPcTLqWvGV99rt",
              secretKey:"4547c02c2b8e8db4ea7042e642a143ef",
              speed:"5", //朗读语速，取值范围[0, 9]，数值越大，语速越快
              pitch:"5"  //音调，取值范围[0, 9]，数值越大，音量越高
          };
          baidu_tts.init(options_init);
      }


      $scope.speak=function () {
          $scope.speakingText='我是山大研究生丁一铭';
          try {
              //navigator.speech.startSpeaking( $scope.speakingText);

              //navigator.speech.startSpeaking($scope.speakingText);
              try{
                  // TTS.speak(
                  //     {
                  //         text:'您好',
                  //         locale:'zh-cn',
                  //         rate: 0.75
                  //     }
                  //     , function () {
                  //     alert('success');
                  // }, function (reason) {
                  //     alert(reason);
                  // });
                  //百度语音说话

                  var options = {txt:"新年好"};
                  baidu_tts.speak(
                      function(ret){}, //success
                      function(e){},   //error
                      options);
              }catch(e)
              {
                  alert('err=\r\n' + e.toString());
              }
          }catch (e)
          {
              alert('exception=' + e.toString());
          }

      }

      $scope.installWxOrNot=function () {
          Wechat.isInstalled(function (installed) {
              alert("Wechat installed: " + (installed ? "Yes" : "No"));
          });
      }

      //分享至指定朋友
      $scope.wxSendText=function (text) {
          var ob={
              scene:Wechat.Scene.SESSION,
              text :text
          };
          Wechat.share(ob, function () {
              alert('share success')
          }, function (reason) {
              alert('share encounter failure');
          });

      }




    });
