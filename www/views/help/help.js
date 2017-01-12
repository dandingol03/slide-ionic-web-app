/**
 * Created by dingyiming on 2017/1/12.
 */
/**
 * Created by apple-2 on 16/8/23.
 */
angular.module('starter')
    .controller('helpController',function($scope,$state,$http,$rootScope,
                                        Proxy,$ionicSideMenuDelegate,$ionicHistory,
                                        $cordovaPreferences,$ionicModal){

        $scope.go_back=function(){
            window.history.back();
        };

        $scope.go_to=function(state){
            $state.go(state);
        };



    });
