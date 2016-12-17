/**
 * Created by yiming on 16/11/16.
 */
angular.module('starter')
    .controller('gaodeServiceSelectController',function($scope,$state,$http,
                                               $rootScope,$cordovaFileTransfer,Proxy,
                                               $ionicModal,$ionicPopup,$ionicLoading,
                                                        $cordovaToast){


        $scope.go_back=function () {
            window.history.back();
        }

        $scope.navigate=function (service) {
            $state.go('map_district_result',{params:JSON.stringify({service:service})});
        }

        $scope.services=[
            {name:'审车',state:'administrator'},
            {name:'审证',state:'paper_validate'},
            {name:'接送机',state:'airport'},
            {name:'接送站',state:'park_car'}
            ];
        $scope.servicesStyle=[
            {height: '60px',width: '60px','margin-left': '10px','margin-bottom': '10px',background: '#ff7c13','border-radius': '60px'},
            {height: '60px',width: '60px','margin-left': '10px','margin-bottom': '10px',background: '#328bff','border-radius': '60px'},
            {height: '60px',width: '60px','margin-left': '10px','margin-bottom': '10px',background: 'rgb(64, 210, 116)','border-radius': '60px'},
            {height: '60px',width: '60px','margin-left': '10px','margin-bottom': '10px',background: '#e171ff','border-radius': '60px'}
            ];

        $scope.history=[];
        $scope.root={};

        $scope.search=function () {
            if($scope.root.query!==undefined&&$scope.root.query!==null&&$scope.root.query!='')
            {
                var reg=/\d|\w/;
                if(reg.exec($scope.root.query)!=null)
                {
                    if(window.cordova)
                    {
                        $cordovaToast
                            .show('所查询的内容不能包含数字或字母', 'short', 'center')
                            .then(function(success) {
                            }, function (error) {
                            });
                    }else{
                        var myPopup = $ionicPopup.alert({
                            template: '信息',
                            title: '所查询的内容不能包含数字或字母'
                        });
                    }
                    return ;
                }else{
                }

                //TODO:search whole places and maintaines



            }else{
                if(window.cordova)
                {
                    $cordovaToast
                        .show('查询内容不能为空', 'short', 'center')
                        .then(function(success) {
                        }, function (error) {
                        });
                }else{
                    var myPopup = $ionicPopup.alert({
                        template: '信息',
                        title: '查询内容不能为空'
                    });
                }
            }
        }



    })
