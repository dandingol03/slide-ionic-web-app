/**
 * Created by dingyiming on 2016/12/8.
 */
/**
 * Created by danding on 16/9/6.
 * 山大默认经纬度为117.144816,36.672171
 * 1.$scope.maintain.maintenance,保存选中的维修厂
 */


angular.module('starter')

    .controller('testAMapController',function($scope,$state,$http,$timeout,$rootScope,
                                              BaiduMapService,$cordovaGeolocation,$ionicModal,
                                              Proxy,$stateParams, $q,$ionicLoading) {

        if($stateParams.ob!==undefined&&$stateParams.ob!==null&&$stateParams.ob!=='')
        {
            $scope.ob=$stateParams.ob;
            if(Object.prototype.toString.call($scope.ob)=='[object String]')
                $scope.ob = JSON.parse($scope.ob);
            if($scope.ob.carInfo!==undefined&&$scope.ob.carInfo!==null)
                $scope.carInfo=$scope.ob.carInfo;
            if($scope.ob.maintain!==undefined&&$scope.ob.maintain!==null)
                $scope.maintain=$scope.ob.maintain;
            //返回的界面索引
            if($scope.ob.locateIndex!==undefined&&$scope.ob.locateIndex!==null)
                $scope.locateIndex=$scope.ob.locateIndex;
        }

        $scope.root={};

        $scope.Mutex = function (item, field, cluster) {
            if (item[field]) {
                item[field] = false;
            }
            else {
                item[field] = true;
                cluster.map(function (cell, i) {
                    if (cell != item)
                        cell[field] = false;
                })
            }
        };

        $scope.Toggle = function (item, field) {
            if (item[field] == true)
                item[field] = false;
            else
                item[field] = true;
        };

        $scope.Set = function (item, field, value) {
            item[field] = value;
        }


        $scope.go_back = function () {
            $rootScope.dashboard.tabIndex=2;
            $rootScope.dashboard.subTabIndex=$scope.locateIndex;
            window.history.back();
        }


        $scope.clear_search=function () {
            $scope.query=null;
        }


        $scope.confirm=function (item) {
            $scope.closeContentInfoPanel();
            $state.go('map_daily_confirm', {contentInfo: JSON.stringify({unit: item,carInfo:$scope.carInfo,maintain:$scope.maintain})});
        }

        $scope.selectTime=true;

        $scope.contentInfo=null;

        /*** 绑定信息窗口模态框 ***/
        $ionicModal.fromTemplateUrl('views/modal/popupContentInfoPanel.html',{
            scope:  $scope,
            animation: 'animated '+'bounceInUp',
            hideDelay:920
        }).then(function(modal) {
            $scope.contentInfoPanel = modal;
        });

        $scope.openContentInfoPanel= function(){
            try{
                $scope.contentInfoPanel.show();
            }catch(e){
                alert('error=\r\n'+ e.toString());
            }
        };

        $scope.closeContentInfoPanel= function() {
            $scope.contentInfoPanel.hide();
        };
        /*** 绑定信息窗口模态框 ***/



        $scope.init_map=function (BMap) {

            var deferred=$q.defer();
            var cb=function () {
                // 创建地图实例
                var map = new AMap.Map("map_search", {
                    resizeEnable: true,
                    zoom:11,
                    center: [117.144816,36.672171]
                });

            return deferred.promise;
        }
















    })