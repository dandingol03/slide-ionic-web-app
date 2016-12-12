/**
 * Created by dingyiming on 2016/12/12.
 */
angular.module('starter')
    .controller('chosenProductController',function($scope,$state,$stateParams,$ionicActionSheet,
                                          $rootScope,$ionicPopup,$http, Proxy){


        $scope.tabIndex=0;

        $scope.go_back=function(){
            window.history.back();
        }

        $scope.tab_change=function(i)
        {
            $scope.tabIndex=i;
        }

        $scope.selectedTabStyle=
            {
                display:'inline-block',color:'#fff',width:'20%',float:'left',height:'100%','border': '1px solid','border-color': 'rgb(55, 144, 139)','background-color':'rgb(55, 144, 139)'
            };
        $scope.unSelectedTabStyle=
            {
                display:'inline-block',width:'20%',float:'left',height:'100%','border': '1px solid','border-color': 'rgb(68, 78, 78)'
            };








    })