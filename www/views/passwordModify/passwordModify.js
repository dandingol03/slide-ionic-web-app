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
