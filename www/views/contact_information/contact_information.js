/**
 * Created by apple-1 on 2016/10/24.
 */
angular.module('starter')
  .controller('contact_informationController',function($scope,$state,$http,
                                                       $rootScope,$ionicPopup,Proxy){

      //获取个人联系方式
      $http({
          method: "POST",
          url: Proxy.local()+"/svr/request",
          headers: {
              'Authorization': "Bearer " + $rootScope.access_token
          },
          data: {
              request: 'getPersonalContactInfo',
              info:{
                  data:$scope.data
              }
          }
      }).then(function(res) {
          var json=res.data;
          if(json.re==1) {
              $scope.contactInfo=json.data;
          }
      }).catch(function(err) {
          var str='';
          for(var field in err)
            str+=err[field];
          console.error('error=\r\n'+str);
      })

    $scope.saveContactInfo=function() {
        var contactInfo=$scope.contactInfo;
        $http({
            method: "POST",
            url: Proxy.local()+"/svr/request",
            headers: {
                'Authorization': "Bearer " + $rootScope.access_token
            },
            data: {
                request: 'saveContactInfo',
                info:{
                    contactInfo:contactInfo
                }
            }
        }).then(function(res) {
            var json=res.data;
            if(json.re==1) {
                var myPopup = $ionicPopup.show({
                    template: '信息',
                    title: '<strong>保存联系方式成功</strong>',
                    scope: $scope
                });

            }
        })
    };

    $scope.go_back=function(){
      window.history.back();
    };

    $scope.go_to=function(state){
      $state.go(state);
    };

    $scope.contactions={};
    $scope.contactions=[//应该从服务器取
      {type:'telephone',name:''},
      {type:'email',name:''},
      {type:'address',name:''}
    ];


  })
