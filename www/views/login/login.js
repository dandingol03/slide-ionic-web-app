/**
 * Created by danding on 16/9/6.
 */
angular.module('starter')

    .controller('loginController',function($scope,$state,$ionicLoading,$http,$ionicPopup,$timeout,$rootScope
        ,$cordovaFile,$cordovaFileTransfer,$ionicActionSheet,$cordovaCamera,Proxy
        ,$ionicPopover,$cordovaPreferences,$ionicPlatform,$ionicModal,$ionicBackdrop
        ,$ionicViewSwitcher,$cordovaDevice,$ionicHistory,$WebSocket,$cordovaAppVersion
        ,$cordovaFileOpener2,$cordovaInAppBrowser,$stateParams){



        if($stateParams.params!==undefined&&$stateParams.params!==null&&$stateParams.params!='')
        {
            var params=$stateParams.params;
            if(Object.prototype.toString.call(params)=='[object String]')
                params=JSON.parse(params);

            if(params.redirected!==undefined&&params.redirected!==null)
                $scope.redirected=params.redirected;
        }


        $ionicHistory.clearHistory();


        $scope.formUser = {};

        $scope.user={};

        $scope.users=[];

        if($rootScope.username!==undefined&&$rootScope.username!==null){
            $scope.user.username = $rootScope.username;
        }

        if($rootScope.password!==undefined&&$rootScope.password!==null){
            $scope.user.password = $rootScope.password;
        }

        $WebSocket.registeCallback(function(msg) {
            console.log('//-----ws\r\n' + msg);
        });

        //如果登录不是跳转状态
        if($scope.redirected!=true)
            $WebSocket.connect();


        $scope.getPreferences=function () {

            $cordovaPreferences.fetch('preferences')
                .success(function (data) {


                    if(data!==undefined&&data!==null&&data!='')
                    {

                        var preferences=data;
                        if(Object.prototype.toString.call(preferences)=='[object String]')
                            preferences = JSON.parse(preferences);
                        if(preferences.initial==false)
                        {
                        }else{
                            preferences.initial=false;
                            $cordovaPreferences.store('preferences', preferences)
                                .success(function(value) {
                                    $state.go('map_lead_page');
                                })
                                .error(function(error) {
                                    alert("Error: " + error);
                                })
                        }

                    }else{
                        //TODO:初始化preferences

                        var preferences={
                            initial:false
                        };
                        $cordovaPreferences.store('preferences', preferences)
                            .success(function(value) {
                                $state.go('map_lead_page');
                            })
                            .error(function(error) {
                                alert("Error: " + error);
                            })
                    }
                })
                .error(function (err) {
                    var str='';
                    for(var field in err)
                        str+=err[field];
                    console.error('err================\r\n'+str);
                });
        }


        $scope.$on('modal.hidden', function() {
            // Execute action
            $ionicBackdrop.release();
        });





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

        $rootScope.screen={
            height:screen.height
        }

        if(window.cordova)
        {
            $ionicPlatform.ready (function () {


                if(ionic.Platform.isAndroid())
                {

                    //检查是否含有danding.wav文件
                    $cordovaFile.checkFile(cordova.file.externalRootDirectory, "danding.wav")
                        .then(function (success) {
                            $cordovaFile.removeFile(cordova.file.externalRootDirectory, "danding.wav")
                                .then(function (success) {
                                    alert('success=' + success);
                                }, function (error) {
                                    // error
                                    var str='';
                                    for(var field in error)
                                        str+=error[field];
                                    alert('err===============\r\n' + str);
                                });
                        }, function (error) {
                        });


                    //获取手机版本号
                    $cordovaAppVersion.getVersionNumber().then(function (version) {
                        var appVersion = version;
                        console.log('app version=================' + appVersion);
                        $http({
                            method:"GET",
                            url:Proxy.local()+'/getLastAppVersion',
                            headers: {
                                'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        }).then(function (res) {
                            var json=res.data;
                         //   alert('version in server='+json.data);
                            if(json.data>appVersion)
                            {
                                var confirmPopup = $ionicPopup.confirm({
                                    title: '您的app版本过旧，需要更新',
                                    template:'是否现在立即更新'
                                });
                                confirmPopup.then(function (res) {
                                    if(res)
                                    {

                                        //打开浏览器下载apk
                                        $cordovaInAppBrowser.open(Proxy.local() + '/downloadAndroidApk', '_system', options)
                                            .then(function(event) {
                                            //    for(var field in event)
                                            //    {
                                            //         alert(field + '\r\n' + event[field]);
                                            //    }
                                            })
                                            .catch(function(event) {
                                                alert('download encounter error')
                                            });
                                        $cordovaInAppBrowser.close();

                                        $rootScope.$on('$cordovaInAppBrowser:loadstop', function(e, event){
                                            console.log('load stop...');
                                        });
                                    }else{}
                                })
                            }else{}
                        })

                    });

                }


                if($scope.redirected==true)
                {}
                else{
                    $scope.getPreferences();
                }

                $scope.fetch();


                var model = $cordovaDevice.getModel();
                var version = $cordovaDevice.getVersion();
                console.log('===============device info==============');
                //this is the customize version name
                console.log('model=\r\n' + model);
                //this is the android sdk version
                console.log('version=\r\n' + version);

            })
        }else{
            //浏览器环境
            $ionicPlatform.ready(function () {
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


            })
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


        var options = {
                date: new Date(),
                mode: 'datetime',
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


        $scope.doLogin=function(){

          if($scope.user.password!==undefined&&$scope.user.password!==null&&$scope.user.password!='')
          {
              if($rootScope.registrationId==undefined||$rootScope.registrationId==null||$rootScope.registrationId=='')
              {

                  if(window.plugins!==undefined&&window.plugins!==null) {
                      try {

                          window.plugins.jPushPlugin.getRegistrationID(function(data) {

                              console.log('registrationId=\r\n'+data);
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
          }else{
              $ionicPopup.alert({
                  title: '错误',
                  template: '请填入密码后登录'
              });
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
                  $rootScope.access_token = access_token;
                  console.log('registrationId=\r\n' + $rootScope.registrationId);

                  //TODO:send a login action with websocket
                  $WebSocket.login($scope.user.username,$scope.user.password,access_token);


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

                          if($rootScope.user!==undefined&&$rootScope.user!==null)
                          {
                              $rootScope.user.personInfo=json.data;
                          }else{
                              $rootScope.user={
                                  personInfo:json.data
                              };
                          }
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

                                      $http({
                                          method: "post",
                                          url: Proxy.local() + "/svr/request",
                                          headers: {
                                              'Authorization': "Bearer " + $rootScope.access_token,
                                          },
                                          data: {
                                              request: 'getTTSToken'
                                          }
                                      }).then(function (res) {
                                          var json=res.data;
                                          if(json.re==1) {
                                              var ttsToken=json.data;
                                              if(ttsToken!==null&&ttsToken!==undefined)
                                              {
                                                  $rootScope.ttsToken=ttsToken;
                                                  $state.go('tabs.dashboard_backup');
                                                  $ionicHistory.clearHistory();
                                              }else{
                                                  $ionicPopup.alert({
                                                      title: '错误',
                                                      template: '百度语音无法识别'
                                                  });
                                              }
                                          }
                                      })
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
                              $ionicViewSwitcher.nextDirection("forwoard")
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

      $scope.goFetchPassword=function(){
          $state.go('passwordForget');
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


      /********** ws *************/


    });
