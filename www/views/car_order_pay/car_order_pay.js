/**
 * Created by yiming on 16/10/15.
 */
angular.module('starter')

/**
 * 本页面不开启缓存
 */
    .controller('carOrderPayController',function($scope,$state,$http,
                                                    $location,$rootScope,$stateParams,
                                                    Proxy,$ionicModal,$ionicPopup){


        $scope.info=$stateParams.info;
        if($scope.info!==undefined&&$scope.info!==null)
        {
            if(Object.prototype.toString.call($scope.info)=='[object String]')
            {
                $scope.info = JSON.parse($scope.info);
                $scope.order=$scope.info.order;
                $scope.price=$scope.info.price;
            }
        }

        $scope.mail={
        };

        $scope.go_back=function(){
            window.history.back();
        }

        $scope.Mutex=function(item,field,cluster) {
            if(item[field])
            {
                item[field]=false;
            }
            else{
                item[field]=true;
                cluster.map(function(cell,i) {
                    if(cell.address!=item.address)
                        cell[field]=false;
                })
            }
        };

        /*** show create_new_mailAddress modal ***/
        $ionicModal.fromTemplateUrl('views/modal/create_new_mailAddress.html',{
            scope:  $scope,
            animation: 'slide-in-bottom'
        }).then(function(modal) {
            $scope.new_mailAddress_modal = modal;
        });

        $scope.openMailAddressModal= function(){
            try{
                $scope.new_mailAddress_modal.show();
            }catch(e){
                alert('error=\r\n'+ e.toString());
            }

        };

        $scope.closeMailAddressModal= function() {
            $scope.new_mailAddress_modal.hide();
        };
        /*** show create_new_mailAddress modal ***/


        //获取用户的收件地址
        $http({
            method: "post",
            url: Proxy.local()+"/svr/request",
            headers: {
                'Authorization': "Bearer " + $rootScope.access_token,
            },
            data:
                {
                    request:'getCustomerMailAddresses'
                }
        }).then(function(res) {
            var json=res.data;
            if(json.re==1) {
                $scope.addresses=[];
                json.data.map(function(add,i) {
                   if(i==0)
                   {
                       add.checked=true;
                   }
                   $scope.addresses.push(add);
                });

            }
        }).catch(function(err) {
            console.error('error=\r\n' + err.toString());
        })

        $scope.createMailAddress=function () {
            $http({
                method: "post",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data: {
                        request:'createMailAddress',
                        info:{
                            address:$scope.mail.address,
                            postcode:$scope.mail.postcode
                        }
                    }
            }).then(function (res) {
                var json=res.data;
                if(json.re==1) {
                }
            }).catch(function (err) {
                console.error('error=\r\n' + err.toString());
            })
        }



        //提交车险方案
        $scope.apply=function() {
            var selected_price = $scope.price;
            var order = $scope.order;

            //TODO:绑定投保人
            $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data: {
                    request: 'applyCarOrderPrice',
                    info: {
                        price: selected_price
                    }
                }


            }).then(function (res) {
                var json = res.data;
                if (json.re == 1) {
                    alert("dicount="+selected_price.discount);
                    return $http({
                        method: "POST",
                        url: Proxy.local() + "/svr/request",
                        headers: {
                            'Authorization': "Bearer " + $rootScope.access_token
                        },
                        data: {
                            request: 'updateInsuranceCarOrder',
                            info: {
                                orderId:$scope.order.orderId,
                                fields:{
                                    insurerId:31,
                                    companyId:selected_price.companyId,
                                    discount:selected_price.discount,
                                    benefit:selected_price.benefit,
                                    insuranceFeeTotal:selected_price.insuranceFeeTotal,
                                    contractFee:selected_price.contractFee,
                                    commission:selected_price.commission,
                                    score:selected_price.score,
                                    exchangeMoney:selected_price.exchangeMoney,
                                    orderDate:new Date()
                                }
                            }
                        }
                    });

                }
            }).then(function(res) {
                var json=res.data;
                if(json.re==1) {
                    var alertPopup = $ionicPopup.alert({
                        title: '提示',
                        template: '订单已支付完成'
                    });
                    alertPopup.then(function(res) {
                        $state.go('tabs.dashboard');
                    });
                }
            }).catch(function (err) {
                var str = '';
                for (var field in err)
                    str += err[field];
                console.error('erro=\r\n' + str);
            });

        }


    });

