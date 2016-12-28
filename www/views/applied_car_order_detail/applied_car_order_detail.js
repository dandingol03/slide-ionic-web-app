/**
 * Created by danding on 16/11/17.
 */
angular.module('starter')

    .controller('appliedCarOrderDetailController',function($scope,$state,$http, $location,
                                                           $rootScope,$stateParams,Proxy,
                                                           $ionicLoading){

        //车险订单  0.报价中;1.已生成;2.待支付

        $scope.orderId=$stateParams.orderId;

        if(Object.prototype.toString.call($scope.order)=='[object String]')
            $scope.orderId = parseInt($scope.orderId);


        $scope.getOrder=function () {
            $ionicLoading.show({
                template:'<p class="item-icon-left">拉取车险订单数据...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
            });
            //获取该订单的所有选中公司和产品
            $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data: {
                    request: 'getApplyedCarOrderByOrderId',
                    info: {
                        orderId: $scope.orderId
                    }
                }
            }).then(function (res) {
                var json = res.data;
                if (json.re == 1) {
                    $scope.order = json.data;
                }
                $ionicLoading.hide();
            }).catch(function (err) {
                var str='';
                for(var field in err)
                    str+=err[field];
                console.error('err=r\r\n' + str);
                $ionicLoading.hide();
            });

        }
        $scope.getOrder();





        $scope.goto=function(url){
            $location.path(url);
        };

        $scope.go_back=function(){
            $rootScope.car_orders_tabIndex=2;
            window.history.back();
        }




        //同步全局的车险订单取消标志

        if($rootScope.carOrdermodify&&$rootScope.carOrderModify.flag==true)
            $scope.haveModifyOrder=true;
        else
            $scope.haveModifyOrder=false;

        if($scope.haveModifyOrder==false)
        {
            $scope.modifyOrder = function(){

                $scope.haveModifyOrder=true;
                $http({
                    method: "POST",
                    url: Proxy.local() + "/svr/request",
                    headers: {
                        'Authorization': "Bearer " + $rootScope.access_token
                    },
                    data: {
                        request: 'updateCarOrderState',
                        info: {
                            orderId: $scope.orderId,
                            orderState:0
                        }
                    }
                }).then(function(res) {
                    if(res.data.re==1){
                        $rootScope.carOrderModify={orderId:$scope.orderId,carId:$scope.order.carId,flag:true};
                        $state.go('car_insurance');
                    }
                })

            }
        }



    });
