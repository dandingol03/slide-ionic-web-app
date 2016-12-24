/**
 * Created by danding on 16/9/6.
 * 山大默认经纬度为117.144816,36.672171
 * 1.$scope.maintain.maintenance,保存选中的维修厂
 */
angular.module('starter')

    .controller('selectCandidateServicePersonController',function($scope,$state,$http,$timeout,$rootScope,
                                                  Proxy,$stateParams,$ionicLoading) {


        $scope.go_back=function () {
            window.history.back();
        }

        $scope.Mutex=function (item,field,set) {
            if(item[field]==true)
            {
                item[field]=false;
            }else{
                item[field]=true;
                set.map(function (single, i) {
                    single[field]=false;
                });
            }
        }


        if($stateParams.params!==undefined&&$stateParams.params!==null)
        {
            var params=$stateParams.params;
            if(Object.prototype.toString.call(params)=='[object String]')
                params = JSON.parse(params);
            if(params.orderId!==undefined&&params.orderId!==null)
            {
                $scope.orderId=params.orderId;
            }
        }

        //获取服务订单以及侯选人
        $scope.getServiceOrderAndCandidate=function () {
            $ionicLoading.show({
                template: '<p class="item-icon-left">拉取服务订单数据...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
            });
            $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data: {
                    request: 'getServiceOrderAndCandidate',
                    info:{
                        orderId:$scope.orderId
                    }
                }
            }).then(function (res) {
                var json=res.data;
                if(json.re==1) {
                    $scope.order=json.data;
                    if($scope.order.orderState!=1) {
                        $scope.order.servicePersons.map(function (servicePerson, i) {
                            if(servicePerson.servicePersonId==$scope.order.servicePersonId)
                                servicePerson.checked=true;
                        });
                    }
                }
                $ionicLoading.hide();
            }).catch(function (err) {
                var str='';
                for(var field in err)
                    str+=err[field];
                console.error('err=\r\n'+str);
                $ionicLoading.hide();
            })

        }
        if($scope.orderId!==undefined&&$scope.orderId!==null)
        {
            $scope.getServiceOrderAndCandidate();
        }

        $scope.confirm=function () {

            var servicePerson=null;
            $scope.order.servicePersons.map(function (person, i) {
                if(person.checked==true)
                    servicePerson=person;
            });

            if(servicePerson!=null)
            {
                $ionicLoading.show({
                    template: '<p class="item-icon-left">提交...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
                });
                $http({
                    method: "POST",
                    url: Proxy.local() + "/svr/request",
                    headers: {
                        'Authorization': "Bearer " + $rootScope.access_token
                    },
                    data: {
                        request: 'confirmServiceOrderCandidate',
                        info:{
                            orderId:$scope.orderId,
                            servicePersonId:servicePerson.servicePersonId
                        }
                    }
                }).then(function (res) {
                    var json=res.data;
                    if(json.re==1) {

                    }
                    $ionicLoading.hide();
                }).catch(function (err) {
                    var str='';
                    for(var field in err)
                        str+=err[field];
                    console.error('err=\r\n'+str);
                    $ionicLoading.hide();
                })
            }else{
                var alertPopup = $ionicPopup.alert({
                    title: '错误',
                    template: '请选择服务人员后再点击确认'
                });
            }

        }


    })
