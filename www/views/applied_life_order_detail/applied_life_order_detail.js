/**
 * Created by danding on 16/11/17.
 */
angular.module('starter')

    .controller('appliedLifeOrderDetailController',function($scope,$state,$http, $location,
                                                           $rootScope,$stateParams,Proxy){

        //车险订单  0.报价中;1.已生成;2.待支付

        $scope.orderId=$stateParams.orderId;

        if(Object.prototype.toString.call($scope.order)=='[object String]')
            $scope.orderId = parseInt($scope.orderId);


        //获取该订单的投保人\被保险人等订单申请信息

        $http({
            method: "POST",
            url: Proxy.local() + "/svr/request",
            headers: {
                'Authorization': "Bearer " + $rootScope.access_token
            },
            data: {
                request: 'getAppliedLifeOrderByOrderId',
                info: {
                    orderId: $scope.orderId
                }
            }
        }).then(function (res) {
            var json = res.data;
            if (json.re == 1) {
                $scope.order = json.data;
            }
        }).catch(function (err) {
            var str='';
            for(var field in err)
                str+=err[field];
            console.error('err=r\r\n' + str);
        });






        $scope.goto=function(url){
            $location.path(url);
        };

        $scope.go_back=function(){
            if($scope.order.orderState==1)
                $rootScope.life_orders_tabIndex=0;
            window.history.back();
        }




    });
