/**
 * Created by apple-2 on 16/8/23.
 */
angular.module('starter')
  .controller('myController',function($scope,$state,$http,$rootScope,
                                Proxy){

    $scope.go_back=function(){
      window.history.back();
    };

    $scope.go_to=function(state){
      $state.go(state);
    };

    $scope.infos=[];

    $scope.user={
      phone:17865135730
    };

    //获取个人信息的抽屉面板

      $http({
          method: "post",
          url: Proxy.local()+"/svr/request",
          headers: {
              'Authorization': "Bearer " + $rootScope.access_token,
          },
          data:
              {
                  request:'getMyPageInfo'
              }
      }).then(function(res) {
         var json=res.data;
         if(json.re==1) {
             var infos=json.data;
             if(Object.prototype.toString.call(infos)!='[object Array]')
                 infos=JSON.parse(infos);
             $scope.infos=infos;
         }
      });

  });
