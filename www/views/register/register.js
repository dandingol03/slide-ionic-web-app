/**
 * Created by yiming on 16/10/27.
 */
/**
 * Created by danding on 16/9/6.
 */
angular.module('starter')

  .controller('registerController',function($scope,$state,$ionicLoading,$http,$ionicPopup,$timeout,$rootScope
    ,$cordovaFile,$cordovaFileTransfer,$ionicActionSheet,$cordovaCamera,Proxy
    ){


    $scope.userInfo={};
    $scope.code=0;


      $scope.go_back=function(){
          window.history.back();
      }

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



    $scope.getCode=function () {

        //TODO:校验手机号长度
        var reg=/\d{11}/;
        var mobilePhone=$scope.userInfo.mobile;
        if(reg.exec(mobilePhone)!==null)
        {
            $http({
                method:"GET",
                url:Proxy.local()+'/securityCode?'+"phoneNum=" + $scope.userInfo.mobile,
                headers: {
                    'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
                    'Content-Type': 'application/x-www-form-urlencoded'
                }

            }).then(function(res) {
                var json=res.data;
                if(json.re==1){
                    $scope.code=json.data;
                    alert('验证码='+$scope.code);
                }
                else{
                    alert('error=\r\n'+json.data);
                }
            })
        }else{
            var myPopup = $ionicPopup.alert({
                template: '请输入11位的数字作为手机号\r\n再点击获取验证码',
                title: '<strong style="color:red">错误</strong>'
            });
        }
    }


    $scope.register=function(){
      if($scope.code==$scope.userInfo.code){
        $http({
          method:"POST",
          url:Proxy.local()+'/register?'+'username='+$scope.userInfo.username+'&&password='+$scope.userInfo.password+'&&mobilePhone='+$scope.userInfo.mobile,
          headers: {
            'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
            'Content-Type': 'application/x-www-form-urlencoded'
          }

        }).then(function(res) {
          var json = res.data;
          if(json.re==1){
              var alertPopup = $ionicPopup.alert({
                  title: '信息',
                  template: '用户信息注册成功'
              });
              alertPopup.then(function(res) {
                  $state.go('login');
              });
              $timeout(function() {
                  var state=alertPopup.$$state;
                  if(state==0)
                  {
                      alertPopup.close();
                      $state.go('login');
                  }
              }, 3000);

          }
          else{
            if(json.re==2){
              alert('该手机号已存在');
            }else{
              alert('注册失败');
            }

          }
        })
      }
      else{
        alert('手机验证码输入错误');
      }

    }





  });
