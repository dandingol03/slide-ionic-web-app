/**
 * Created by apple-2 on 16/8/23.
 */
angular.module('starter')
  .controller('myController',function($scope,$state,$http,$rootScope,
                                      Proxy,$ionicSideMenuDelegate,$ionicHistory,
                                      $cordovaPreferences,$ionicModal,$timeout,
                                      $cordovaFileTransfer,$ionicLoading){


    $scope.toggleLeft=function () {
        $ionicSideMenuDelegate.toggleLeft();
    }

    $scope.go_to=function(state){
      $state.go(state);
    };

    //每次进入我的界面都会清除,请通过底部tab页进行切换
    $ionicHistory.clearHistory();

    $scope.quit=function () {
        localStorage.pwdPersisted='false';
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
        if(window.cordova)
        {
            $cordovaPreferences.store('username', '')
                .success(function(value) {
                    $cordovaPreferences.store('password', '')
                        .success(function(value) {
                            $state.go('login');
                            $rootScope.flags.carManage.onFresh=true;
                        })
                        .error(function(error) {
                            console.error("Error: " + error);
                        })
                })
                .error(function(error) {
                    console.error("Error: " + error);
                })
        }else{
            //浏览器环境
            $rootScope.flags.carManage.onFresh=true;
            $state.go('login');
        }
    }

    $scope.notification_count=0;
    if($rootScope.notifications!==undefined&& $rootScope.notifications!==null&& $rootScope.notifications.length>0){
        if($rootScope.notifications[0]!==undefined&& $rootScope.notifications[0]!==null&& $rootScope.notifications[0].length>0){
            $scope.notification_count =  $rootScope.notifications[0].length;
        }
        if($rootScope.notifications[1]!==undefined&& $rootScope.notifications[1]!==null&& $rootScope.notifications[1].length>0){
            $scope.notification_count +=  $rootScope.notifications[1].length;
        }
        if($rootScope.notifications[2]!==undefined&& $rootScope.notifications[2]!==null&& $rootScope.notifications[2].length>0){
            $scope.notification_count +=  $rootScope.notifications[2].length;
        }
    }

      $scope.infos=[];
      $scope.userInfo=$rootScope.user.personInfo;


      //同步个人头像
      if($rootScope.user.portrait!==undefined&&$rootScope.user.portrait!==null&&$rootScope.user.portrait!='')
      {
          $scope.portrait={
              path:$rootScope.user.portrait
          };
      }else{
          $scope.portrait={};
          //TODO:download your portrait
          $ionicLoading.show({
              template:'<p class="item-icon-left">拉取个人信息<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
          });
          $http({
              method: "POST",
              url: "/proxy/node_server/svr/request",
              headers: {
                  'Authorization': "Bearer " + $rootScope.access_token
              },
              data: {
                  request:'checkPortrait'
              }
          }).then(function (res) {
              var json=res.data;
              if(json.re==1) {
                  var filePath=json.data;

                  var url = Proxy.local() + '/svr/request?request=downloadPortrait&filePath='+filePath;
                  var fileSystem = null;
                  if (ionic.Platform.isIOS()) {
                      $scope.target = 'cdvfile://localhost/persistent/' + 'portrait.png';
                  } else if (ionic.Platform.isAndroid()) {
                      fileSystem = cordova.file.externalApplicationStorageDirectory;
                      $scope.target = fileSystem + 'portrait.png';
                  }

                  var trustHosts = true;
                  var options = {
                      fileKey: 'file',
                      headers: {
                          'Authorization': "Bearer " + $rootScope.access_token
                      }
                  };
                  $cordovaFileTransfer.download(url, $scope.target, options, trustHosts)
                      .then(function (res) {
                          var json = res.response;
                          if (Object.prototype.toString.call(json) == '[object String]')
                              json = JSON.parse(json);
                          $scope.portrait.path=$scope.target;
                          $rootScope.user.portrait=$scope.target;
                          $ionicLoading.hide();
                      }, function (err) {
                          // Error
                          $ionicPopup.alert({
                              title: '失败',
                              template: '个人头像同步失败'
                          });
                          $ionicLoading.hide();
                      }, function (progress) {
                          $timeout(function () {
                              $scope.downloadProgress = (progress.loaded / progress.total) * 100;
                          });
                      });

              }else{
                  $ionicLoading.hide();
              }
          }).catch(function (err) {
              $ionicLoading.hide();
              var str='';
              for(var field in err)
                  str+=err[field];
              console.error('err=\r\n'+str);
          });

      }





      /*** 微信分享模态框 ***/
      $ionicModal.fromTemplateUrl('views/modal/wx_share_modal.html',{
          scope:  $scope,
          animation: 'animated '+'bounceInUp',
          hideDelay:920
      }).then(function(modal) {
          $scope.wx_share_modal = modal;
      });

      $scope.openWxShareModal= function(){
          try{
              $scope.wx_share_modal.show();
          }catch(e){
              alert('error=\r\n'+ e.toString());
          }
      };

      $scope.closeWxShareModal= function() {
          $scope.wx_share_modal.hide();
          $scope.wxVisible=false;
      };
      /*** 微信分享模态框 ***/

      $scope.wxVisible=false;

      $scope.wx={
          type:'friend'
      }

      $scope.typeChange=function () {
          console.log('type=' + $scope.wx.type);
      }

      $scope.toggleWxDialog=function () {
          if($scope.wxVisible==false)
          {
              $scope.openWxShareModal();
              $scope.wxVisible=true;
          }else{}
      }


      //分享至指定朋友
      $scope.wxConfirm=function () {

          var personInfo=null;
          $scope.wx.text = 'http://139.129.96.231:3000/wx';
          if($rootScope.user.personInfo!==undefined&&$rootScope.user.personInfo!==null)
          {
              personInfo=$rootScope.user.personInfo;
              $scope.wx.text+='?personId='+personInfo.personId;
          }

          Wechat.isInstalled(function (installed) {
              if(installed)
              {
                  var ob={
                      scene: $scope.wx.type=='friend'?Wechat.Scene.SESSION:Wechat.Scene.TIMELINE,
                      text :$scope.wx.text
                  };
                  //TODO:Wechat share iamge
                  ob={
                      message: {
                          title: '下载链接',
                          description: "我正在使用捷慧宝App,想与您一起分享",
                          thumb: "www/img/logo.png",
                          mediaTagName: "TEST-TAG-001",
                          messageExt: "这是第三方带的测试字段",
                          messageAction: "<action>dotalist</action>",
                          media:{
                              type:Wechat.Type.LINK,
                              webpageUrl:$scope.wx.text
                          }
                      },
                      scene: $scope.wx.type=='friend'?Wechat.Scene.SESSION:Wechat.Scene.TIMELINE   // share to Timeline
                  }

                  Wechat.share(ob, function () {
                      alert('share success')
                  }, function (reason) {
                      alert('share encounter failure');
                  });
              }else{
                  $ionicPopup.alert({
                      title: '信息',
                      template: '您的手机上没有安装微信'
                  });
              }
          });

      }

      $scope.wxCancel=function () {
          $scope.closeWxShareModal();
      }


      $scope.gotoNotificationPanel=function () {
          $state.go('notification');
      }

  });
