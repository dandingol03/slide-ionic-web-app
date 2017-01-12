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

        /*** 引导页模态框 ***/
        $ionicModal.fromTemplateUrl('views/modal/help_modal.html',{
            scope:  $scope,
            animation: 'animated '+'bounceInUp',
            hideDelay:920
        }).then(function(modal) {
            $scope.help_modal = modal;
        });

        $scope.openHelpModal= function(){
            try{
                $scope.help_modal.show();
            }catch(e){
                alert('error=\r\n'+ e.toString());
            }
        };

        $scope.closeHelpModal= function() {
            $scope.help_modal.hide();
        };
        /*** 绑定新车模态框 ***/





    });
