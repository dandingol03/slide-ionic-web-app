/**
 * Created by apple-2 on 16/8/23.
 */
angular.module('starter')
  .controller('passwordModifyController',function($scope,$state,$http,
                                                  $rootScope,Proxy,$ionicPopup){

    $scope.info={};

    $scope.go_back=function(){
      window.history.back();
    };

    $scope.go_to=function(state){
      $state.go(state);
    };

      $scope.getCode=function () {

          if($scope.info.phone!==undefined&&$scope.info.phone!==null&&$scope.info.phone!='')
          {

              $http({
                  method: "post",
                  url: Proxy.local()+"/svr/request",
                  headers: {
                      'Authorization': "Bearer " + $rootScope.access_token,
                  },
                  data:
                      {
                          request:'getPersonInfoByPersonId',
                      }
              }).then(function (res) {
                  var json=res.data;
                  if(json.re==1) {
                      var personInfo=json.data;
                      var mobilePhone=personInfo.mobilePhone;
                      if(mobilePhone==$scope.info.phone)
                      {
                          $http({
                              method:"GET",
                              url:Proxy.local()+'/securityCode?'+"phoneNum=" + $scope.info.phone,
                              headers: {
                                  'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
                                  'Content-Type': 'application/x-www-form-urlencoded'
                              }

                          }).then(function(res) {
                              var json=res.data;
                              if(json.re==1){
                                  $scope.code=json.data;
                              }
                              else{
                                  var myPopup = $ionicPopup.alert({
                                      template: '获取验证码失败',
                                      title: '错误'
                                  });
                              }
                          })
                      }else{
                          var myPopup = $ionicPopup.alert({
                              template: '您输入的手机号没有被当前帐号所绑定',
                              title: '错误'
                          });
                      }
                  }else{
                  }
              })
          }else{
              var myPopup = $ionicPopup.alert({
                  template: '请填入手机号再获取验证码',
                  title: '错误'
              });
          }
      }



      $scope.preCheck=function () {
          if($scope.info.code!==undefined&&$scope.info.code!==null&&$scope.info.code!='')
          {
              if($scope.info.pwd!==undefined&&$scope.info.pwd!==null)
              {
                  if($scope.info.pwd_again!==undefined&&$scope.info.pwd_again!==null)
                  {
                      if($scope.info.pwd_again==$scope.info.pwd)
                      {
                          if($scope.code!=$scope.info.code)
                          {
                              $scope.save();
                          }else{
                              var myPopup = $ionicPopup.alert({
                                  template: '您输入的验证码不正确',
                                  title: '错误'
                              });
                          }
                      }else{
                          var myPopup = $ionicPopup.alert({
                              template: '您2次输入的密码不一致',
                              title: '错误'
                          });
                      }
                  }else{
                      var myPopup = $ionicPopup.alert({
                          template: '请输入确认密码后再点击完成',
                          title: '信息'
                      });
                  }
              }else
              {
                  var myPopup = $ionicPopup.alert({
                      template: '请输入新的密码后再点击完成',
                      title: '信息'
                  });
              }
          }else{
              var myPopup = $ionicPopup.alert({
                  template: '请输入验证码后再点击完成',
                  title: '信息'
              });
          }
      }


      $scope.save=function(){

        $http({
            method: "POST",
            url: Proxy.local() + "/svr/request",
            headers: {
                'Authorization': "Bearer " + $rootScope.access_token
            },
            data: {
                request: 'passwordModify',
                info: {
                    password: $scope.info
                }
            }
        }).then(function(res) {
            var json=res.data;
            if(json.re==1) {
                var myPopup = $ionicPopup.alert({
                    template: '密码修改成功',
                    title: '<strong style="color:red">信息</strong>'
                });

            }
        }).catch(function(err) {
            var str='';
            for(var field in err)
                str+=err[field];
            console.error('err=\r\n' + str);
        })



    }

  });
