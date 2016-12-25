/**
 * Created by dingyiming on 2016/12/7.
 */
angular.module('starter')
    .controller('lifeController',function($scope,$state,$stateParams,$ionicActionSheet,
                                          $rootScope,$ionicPopup,$http, Proxy){

        $scope.go_back=function(){
            window.history.back();
        }

        //寿险
        $scope.life_insurance=
            {
                insurer:{perTypeCode:'I'},
                insuranceder:{perTypeCode:'I'},
                benefiter:{perTypeCode:'I'},
                intend:{},
                order:{
                    insurer:{perTypeCode:'I'},
                    insuranceder:{perTypeCode:'I'},
                    benefiter:{perTypeCode:'I'}
                }
            };

        //同步寿险信息
        if($rootScope.life_insurance.insurer!==undefined&&$rootScope.life_insurance.insurer!==null){
            $scope.life_insurance.order.insurer=$rootScope.life_insurance.insurer;
        }
        if($rootScope.life_insurance.insuranceder!==undefined&&$rootScope.life_insurance.insuranceder!==null)
        {
            $scope.life_insurance.order.insuranceder=$rootScope.life_insurance.insuranceder;
        }
        if($rootScope.life_insurance.benefiter!==undefined&&$rootScope.life_insurance.benefiter!==null)
        {
            $scope.life_insurance.order.benefiter=$rootScope.life_insurance.benefiter;
        }
        if($rootScope.life_insurance.isLegalBenefiter!==undefined&&$rootScope.life_insurance.isLegalBenefiter!==null)
        {
            $scope.life_insurance.order.isLegalBenefiter=$rootScope.life_insurance.isLegalBenefiter;
        }
        if($rootScope.life_insurance.planInsuranceFee!==undefined&&$rootScope.life_insurance.planInsuranceFee!==null)
        {
            $scope.life_insurance.order.planInsuranceFee=$rootScope.life_insurance.planInsuranceFee;
        }

        //进入寿险选择投保人
        $scope.goFetchLifeInsurer=function(order){
            $rootScope.life_insurance.planInsuranceFee=$scope.life_insurance.order.planInsuranceFee;
            $state.go('append_life_insurer', {info: JSON.stringify({order: order})});
        }

        //进入寿险选择被保险人
        $scope.goFetchLifeInsuranceder=function(order){
            $rootScope.life_insurance.planInsuranceFee=$scope.life_insurance.order.planInsuranceFee;
            $state.go('append_life_insuranceder', {info: JSON.stringify({order: order})});
        }

        //进入寿险选择寿益人
        $scope.goFetchLifeBenefiter=function(order){
            $rootScope.life_insurance.planInsuranceFee=$scope.life_insurance.order.planInsuranceFee;
            $state.go('append_life_benefiter', {info: JSON.stringify({order: order})});
        }

        $scope.lifeInsuranceder_insuranceType_select=function()
        {

            var buttons=[{text:'重疾险'},{text:'医疗险'},{text:'理财险'},{text:'意外险'},{text:'养老险'}];
            $ionicActionSheet.show({
                buttons:buttons,
                titleText: '选择你需要的保障',
                cancelText: 'Cancel',
                buttonClicked: function(index) {
                    $scope.life_insurance.order.insuranceType = buttons[index].text;
                    return true;
                },
                cssClass:'motor_insurance_actionsheet'
            });
        }

        $scope.Toggle=function(type,item,field)
        {
            switch(type)
            {
                case 'boolean':
                    if(item[field]!=true)
                        item[field]=true;
                    else
                        item[field]=false;
                    break;
            }
        }


        //寿险意向保留
        $scope.saveLifeInsuranceIntend = function()
        {
            if($scope.life_insurance.order.insuranceder.personId!=undefined&&$scope.life_insurance.order.insuranceder.personId!=null
                &&$scope.life_insurance.order.insurer.personId!=undefined&&$scope.life_insurance.order.insurer.personId!=null
                &&(($scope.life_insurance.order.benefiter.personId!=undefined&&$scope.life_insurance.order.benefiter.personId!=null)
                ||($scope.life_insurance.order.isLegalBenefiter!=undefined&&$scope.life_insurance.order.isLegalBenefiter!=null))
                &&$scope.life_insurance.order.planInsuranceFee!=undefined&&$scope.life_insurance.order.planInsuranceFee!=null
            )
            {
                //TDOO:校验是否已有寿险订单
                //受益人法定
                $http({
                    method: "POST",
                    url: Proxy.local()+'/svr/request',
                    headers: {
                        'Authorization': "Bearer " + $rootScope.access_token,
                    },
                    data:
                        {
                            request:'validateLifeInsuranceOrderApplyRedundancy',
                            info:{
                                insurancederId:$scope.life_insurance.order.insuranceder.personId,
                                insurerId:$scope.life_insurance.order.insurer.personId,
                                benefiterId:$scope.life_insurance.order.benefiter.personId
                            }
                        }
                }).then(function(res) {
                    var json=res.data;
                    if(json.data==true) {
                        var msg=null;
                        if($scope.life_insurance.order.benefiter.personId!==undefined&&$scope.life_insurance.order.benefiter.personId!==null)
                        {
                            msg='已存在正在申请的相同投保人、被保险人的寿险订单,是否仍要提交';
                        }
                        else{
                            msg='已存在正在申请的相同投保人、被保险人、受益人的寿险订单的寿险订单,是否仍要提交'
                        }
                        var confirmPopup = $ionicPopup.confirm({
                            title: '信息',
                            template: msg
                        });
                        confirmPopup.then(function(res) {
                            if(res){
                                $scope.applyLifeInsuranceIntend();
                            }else {
                            }
                        })
                    }else{
                        $scope.applyLifeInsuranceIntend();
                    }
                })
            }else{
                var confirmPopup = $ionicPopup.confirm({
                    title: '请填写完寿险意向后才选择提交',
                    template: ''
                });

                confirmPopup.then(function(res) {
                    if(res){
                        console.log('You are sure');
                    }else {
                        console.log('You are not sure');
                    }
                })
            }
        }


        $scope.applyLifeInsuranceIntend=function () {
            $http({
                method: "POST",
                url: Proxy.local()+'/svr/request',
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data:
                    {
                        request:'generateLifeInsuranceOrder',
                        info:$scope.life_insurance.order
                    }
            }).then(function(res) {
                var json = res.data;
                if(json.re==1)
                {
                    var orderId=json.data.orderId;
                    if(orderId!==undefined&&orderId!==null)
                    {
                        if($rootScope.lifeInsurance==undefined||$rootScope.lifeInsurance==null)
                            $rootScope.lifeInsurance={};
                        $rootScope.lifeInsurance.orderId=orderId;

                        //TODO:校验
                        if($rootScope.modifiedFlag)
                        {
                            var myConfirm = $ionicPopup.confirm({
                                title: '信息',
                                template: '您有已改动的寿险报价方案,是否取消改动并拉取新的订单数据'
                            });
                            myConfirm.then(function (res) {
                                if(res)
                                {
                                    $rootScope.flags.lifeOrders.onFresh=true;
                                    $state.go('life_insurance_orders',{tabIndex:0});
                                }else{
                                }
                            })
                        }else{
                            var confirmPopup = $ionicPopup.confirm({
                                title: '您的订单',
                                template: '您的寿险意向已提交,请等待工作人员配置方案后在"我的寿险订单"中进行查询'
                            });

                            confirmPopup.then(function(res) {
                                if(res){
                                    $rootScope.flags.lifeOrders.onFresh=true;
                                    $state.go('life_insurance_orders',{tabIndex:0});
                                    $rootScope.flags.lifeOrders.clear=true;
                                }else {
                                    console.log('You are not sure');
                                }
                            });
                        }

                    }
                }

            }).catch(function(err) {
                var str='';
                for(var field in err)
                    str += field + ':' + err[field];
                alert('error=\r\n' + str);
            });
        }


    })