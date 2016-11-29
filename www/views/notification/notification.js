/**
 * Created by danding on 16/9/6.
 * 山大默认经纬度为117.144816,36.672171
 * 1.$scope.maintain.maintenance,保存选中的维修厂
 */
angular.module('starter')

    .controller('notificationController',function($scope,$state,$http,$timeout,$rootScope,
                                                         $ionicModal, Proxy,$stateParams,
                                                         $ionicActionSheet,$q, $ionicPopup) {


        $scope.go_back=function () {
            window.history.back();
        }

        $scope.notyTypes={0:'车险',1:'寿险',2:'服务'};

        $scope.tabIndex=2;
        $scope.tab_change = function(i){
            $scope.tabIndex=i;
        }
        $scope.selectedTabStyle=
            {
                display:'inline-block',color:'#fff',width:'31%',float:'left',height:'100%','border': '1px solid','border-color': 'rgb(55, 144, 139)','background-color':'rgb(55, 144, 139)'
            };
        $scope.unSelectedTabStyle=
            {
                display:'inline-block',width:'31%',float:'left',height:'100%','border': '1px solid','border-color': 'rgb(68, 78, 78)'
            };

        $scope.notifications=$rootScope.notifications;




    })
