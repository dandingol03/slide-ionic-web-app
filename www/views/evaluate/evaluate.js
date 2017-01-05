/**
 * Created by dingyiming on 2016/12/7.
 */
angular.module('starter')

    .controller('evaluateController',function($scope,$state,$ionicLoading,
                                              $http,$ionicPopup,$rootScope,
                                              $ionicActionSheet,Proxy,$stateParams)
    {

        $scope.goBack=function () {
            window.history.back();
        }



        $scope.serviceTypeMap={11:'维修-日常保养',12:'维修-故障维修',13:'维修-事故维修',
            21:'车驾管-审车',22:'车驾管-审证',23:'车驾管-接送机',24:'车驾管-取送车'};

        $scope.subServiceTypeMap={1:'机油,机滤',2:'检查制动系统,更换刹车片',3:'雨刷片更换',
            4:'轮胎更换',5:'燃油添加剂',6:'空气滤清器',7:'检查火花塞',8:'检查驱动皮带',9:'更换空调滤芯',10:'更换蓄电池,防冻液'};




        if($stateParams.order!==undefined&&$stateParams.order!==null)
        {
            var order=$stateParams.order;
            if(Object.prototype.toString.call(order)=='[object String]')
                order=JSON.parse(order);
            order.serviceName=$scope.serviceTypeMap[order.serviceType];
            $scope.order=order;
        }


        $scope.stars=[
            {index:0,checked:false},
            {index:1,checked:false},
            {index:2,checked:false},
            {index:3,checked:false},
            {index:4,checked:false}
            ];

        $scope.option = '';
        $scope.evaluate = 0;

        $scope.starsCount = null;


        $scope.starSetter=function (item,val) {

            for(var i=0;i<=item.index;i++) {
                $scope.stars[i].checked=true;
            }
            for(var i=item.index+1;i<=4;i++) {
                $scope.stars[i].checked=false;
            }
            $scope.starCount=item.index+1;

        }



        $scope.submit = function(){

            if($scope.starCount==undefined||$scope.starCount==null)
            {
                var myPopup = $ionicPopup.alert({
                    template: '请在评价一栏进行打分',
                    title: '信息'
                });
            }

            $scope.evaluate =  $scope.starCount;

            $http({
                method: "post",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data: {
                    request: 'updateServiceOrder',
                    info: {
                        order:{
                            orderId:$scope.order.orderId,
                            evaluate: $scope.evaluate,
                            proposal:$scope.proposal,
                            evaluateTime:new Date()
                        }
                    }
                }
            }).then(function (res) {
                var json=res.data;
                if(json.re==1) {
                    $rootScope.flags.serviceOrders.clear=true;
                    $rootScope.flags.serviceOrders.onFresh=true;
                    var myPopup = $ionicPopup.alert({
                        template: '订单评价成功',
                        title: '信息'
                    });
                }
            }).catch(function (err) {
                var str='';
                for(var field in err)
                    str+=err[field];
                console.error('err=\r\n'+str);
            })


        }


    })