/**
 * Created by danding on 16/9/6.
 *
 *
 */
angular.module('starter')

    .controller('customerPlaceSelectController',function($scope,$state,$http,$timeout,$rootScope,
                                                            BaiduMapService,$cordovaGeolocation,$ionicModal,
                                                            Proxy,$stateParams,$ionicLoading,
                                                            $ionicPopup) {

        $scope.goBack = function () {
            window.history.back();
        }

        $scope.screenHeight=window.screen.height;
        $scope.contentHeight=$scope.screenHeight-140;

        $scope.resultsStyle={width:'100%',height:$scope.contentHeight+'px'};

        $scope.customerPlace={
        };

        $scope.results=[];

        //基于百度地图api的接口搜索
        $scope.search=function () {

            if($rootScope.MAP_maintain!==undefined&&$rootScope.MAP_maintain!==null)
            {
                $ionicLoading.show({
                    template: '<p class="item-icon-left">拉取搜索结果...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
                });



                var BMap=null;
                if($scope.BMap!==undefined&&$scope.BMap!==null)
                    BMap=$scope.BMap;
                else
                    BMap=window.BMap;
                var map=$rootScope.MAP_maintain;
                var options = {
                    onSearchComplete: function(results){
                        // 判断状态是否正确
                        if (local.getStatus() == BMAP_STATUS_SUCCESS){
                            $ionicLoading.hide();
                            var s = [];
                            $scope.results=[];
                            if(results.getCurrentNumPois()!==undefined&&results.getCurrentNumPois()!==null&&results.getCurrentNumPois()>0)
                            {
                                for (var i = 0; i < results.getCurrentNumPois(); i ++){
                                    var poi=results.getPoi(i);
                                    $scope.results.push({title:poi.title,address:poi.address,point:poi.point});
                                }
                            }else{
                            }
                        }else{
                            $ionicLoading.hide();
                        }
                    }
                };

                var local = new BMap.LocalSearch(map, options);
                local.search($scope.customerPlace.address);
            }else{}
        }





        //创建新的用户地址
        $scope.createNewCustomerPlace=function () {
            var destiny=$scope.destiny;
            var address=$scope.customerPlace.address;
            $http({
                method: "POST",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data:
                    {
                        request:'createNewCustomerPlace',
                        info:{
                            address:address,
                            longitude:destiny.lng,
                            latitude:destiny.lat
                        }

                    }
            }).then(function(res) {
                var json=res.data;
                if(json.re==1) {
                    var myPopup = $ionicPopup.alert({
                        template: '',
                        title: '<strong>用户地址已创建完成</strong>',
                        subTitle: '',
                        scope: $scope
                    });


                    $timeout(function(){
                        var popup=myPopup;
                        if(popup.$$state.status==0)
                        {
                            myPopup.close();
                            $scope.go_back();
                        }
                    },2000);
                }
            })
        }

        $scope.Select=function (item) {
            if(item!==undefined&&item!==null)
            {
                $rootScope.customerPlace=item;
                window.history.back();
            }
        }

        BaiduMapService.getBMap().then(function (res) {

            var BMap = res;
            $scope.BMap=BMap;
            //地图初始化

        });

        $scope.go_back = function () {
            window.history.back();
        }

    })



