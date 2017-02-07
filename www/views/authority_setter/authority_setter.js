/**
 * Created by apple-2 on 16/8/23.
 */
angular.module('starter')
    .controller('authoritySetterController',function($scope,$state,$http,$rootScope,
                                        Proxy,$ionicLoading){


        $scope.listStyle={};

        $scope.height=$rootScope.screen.height;
        $scope.st={width:'100%',height:$scope.height-230+'px'};



        //TODO:check this config validate
        if(window.cordova)
        {
            var permissions=[];
            window.Media.requestPermissions(function (permissions) {
                permissions.map(function (permission,i) {
                    if(permission=='true'||permission==true)
                        permissions.push(true);
                    else
                        permission.push(false);
                });
                $scope.permissions=permissions;
            });

        }

        $scope.go_to=function(state){
            $state.go(state);
        };


    });
