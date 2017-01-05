/**
 * Created by apple-1 on 2016/10/24.
 */
angular.module('starter')
  .controller('adviseGiftController',function($scope,$state,$http,
                                              $rootScope,$cordovaFileTransfer,
                                              Proxy,$timeout,$ionicPopup){

    $scope.downloadQrCode=function() {

      var url = Proxy.local() + '/svr/request?request=qrcodeGenerate';
      var fileSystem = null;
      if (ionic.Platform.isIOS()) {
        fileSystem = cordova.file.documentsDirectory;
        $scope.target = 'cdvfile://localhost/persistent/' + 'qrcode.png';
      } else if (ionic.Platform.isAndroid()) {
        fileSystem = cordova.file.externalApplicationStorageDirectory;
        $scope.target = fileSystem + 'qrcode.png';
      }


      $scope.filepath = fileSystem + 'qrcode.png';
      //var targetPath='cdvfile://localhost/persistent/Application/2AF47566-EE4A-41A8-94F5-73ED11427A80/ionic-serve-person.app/test.caf';
      alert('target path=\r\n' + $scope.target);

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
          alert('success');
        }, function (err) {
          // Error
          alert('error=' + err);
          for (var field in err) {
            alert('field=' + field + '\r\n' + err[field]);
          }
        }, function (progress) {
          $timeout(function () {
            $scope.downloadProgress = (progress.loaded / progress.total) * 100;
          });
        });

    }

    $scope.go_back=function(){
      window.history.back();
    };

    $scope.go_to=function(state){
      $state.go(state);
    };

    $scope.wx={};

    $scope.share=function () {
        alert('text='+$scope.wx.text);
    }
      //分享至指定朋友
      $scope.wxShareText=function () {

        var personInfo=null;
        $scope.wx.text = 'http://139.129.96.231:3000/wx';
          if($rootScope.user.personInfo!==undefined&&$rootScope.user.personInfo!==null)
          {
              personInfo=$rootScope.user.personInfo;
              $scope.wx.text+='?personId='+personInfo.personId;
          }


          if($scope.wx.text!==undefined&&$scope.wx.text!==null&&$scope.wx.text!='')
          {
            Wechat.isInstalled(function (installed) {
                if(installed)
                {
                    var ob={
                        scene:Wechat.Scene.SESSION,
                        text :$scope.wx.text
                    };
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
        }else{
            $ionicPopup.alert({
                title: '错误',
                template: '请填写您需要分享的内容再点击分享'
            });
        }
      }


  })
