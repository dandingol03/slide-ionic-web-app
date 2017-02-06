/**
 * Created by apple-2 on 16/8/23.
 */
angular.module('starter')
    .controller('authoritySetterController',function($scope,$state,$http,$rootScope,
                                        Proxy,$cordovaMedia,
                                        $ionicLoading){


        $scope.listStyle={};

        $scope.height=$rootScope.screen.height;
        $scope.st={width:'100%',height:$scope.height-230+'px'};

        $scope.config={
            fileWrite:false,
            fileRead:false
        };

        //TODO:check this config validate
        if(window.cordova)
        {
            window.Media.checkAuthorities(function (results) {
                alert(results);
            });

        }

        $scope.go_to=function(state){
            $state.go(state);
        };


    });
