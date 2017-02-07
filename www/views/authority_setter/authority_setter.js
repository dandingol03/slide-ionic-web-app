/**
 * Created by apple-2 on 16/8/23.
 */
angular.module('starter')
    .controller('authoritySetterController',function($scope,$state,$http,$rootScope,
                                        Proxy,$ionicPlatform){
        $scope.listStyle={};

        $scope.height=$rootScope.screen.height;
        $scope.st={width:'100%',height:$scope.height-230+'px'};




        $scope.constants=[
            'android.permission.WRITE_EXTERNAL_STORAGE',
            'android.permission.RECORD_AUDIO',
            'android.permission.READ_EXTERNAL_STORAGE'
        ];

        //TODO:check this config validate
        if(window.cordova) {
            $ionicPlatform.ready(function () {
                //android platform
                if(ionic.Platform.isAndroid())
                {
                    //TODO:改为查看权限
                    window.Media.checkPermissions(function(permissions)
                    {
                        var arr=permissions;
                        if(Object.prototype.toString.call(arr)=='[object String]')
                            arr=JSON.parse(arr);
                        $scope.$apply(function () {
                            $scope.permissions=arr;
                        })
                    });
                }
            });
        }

        $scope.permissionChange=function (item,i) {
            if(item.val==true)
            {
                var permission=$scope.constants[i];
                window.Media.requestPermission(permission,function (re) {
                    if(re==true||re=='true')
                    {}
                    else{
                        $scope.$apply(function () {
                            item.val=false;
                        })
                    }
                })
            }
        }

        $scope.go_to=function(state){
            $state.go(state);
        };


    });
