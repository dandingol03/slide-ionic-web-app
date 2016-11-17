/**
 * Created by danding on 16/11/17.
 */
angular.module('starter')

    .controller('appliedCarOrderDetailController',function($scope,$state,$http, $location,
                                                           $rootScope,$stateParams,Proxy){

        //车险订单  0.报价中;1.已生成;2.待支付

        $scope.orderId=$stateParams.orderId;

        if(Object.prototype.toString.call($scope.order)=='[object String]')
            $scope.orderId = parseInt($scope.orderId);


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
        }).catch(function (err) {
            var str='';
            for(var field in err)
                str+=err[field];
            console.error('err=r\r\n' + str);
        });




        // $scope.order=
        //     {
        //         carId:$scope.carId,
        //         items: [
        //             {productName:'第三者责任险',insuranceType:'国内',productId:1},
        //             {productName:'车辆损失险',insuranceType:'进口',productId:4}
        //         ],
        //         insuranceFeeTotal:'40000$',
        //         orderDate:'2015-09-21'
        //     };
        //
        // if(Object.prototype.toString.call($scope.order)=='[object String]')
        //     $scope.order = JSON.parse($scope.order);

        $scope.goto=function(url){
            $location.path(url);
        };

        $scope.go_back=function(){
            $rootScope.car_orders_tabIndex=2;
            window.history.back();
        }




    });
