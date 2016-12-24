/**
 * Created by apple-2 on 16/8/23.
 */
angular.module('starter')
  .controller('myController',function($scope,$state,$http,$rootScope,
                                Proxy,$ionicSideMenuDelegate,$ionicHistory,
                                      $cordovaPreferences){

    $scope.go_back=function(){
      window.history.back();
    };

    $scope.toggleLeft=function () {
        $ionicSideMenuDelegate.toggleLeft();
    }

    $scope.go_to=function(state){
      $state.go(state);
    };

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
                        })
                        .error(function(error) {
                            console.error("Error: " + error);
                        })
                })
                .error(function(error) {
                    console.error("Error: " + error);
                })
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


    $scope.gotoNotificationPanel=function () {
        $state.go('notification');
    }

    $scope.infos=[];

    $scope.userInfo=$rootScope.userInfo;

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
             var ob=json.data;
             var infos=ob.infos;
             $scope.score=ob.score;
             if(Object.prototype.toString.call(infos)!='[object Array]')
                 infos=JSON.parse(infos);
             $scope.infos=infos;
         }
      });

  });
