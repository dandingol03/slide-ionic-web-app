/**
 * Created by yiming on 16/11/16.
 */
angular.module('starter')
    .controller('carManageController',function($scope,$state,$http,
                                                $rootScope,$cordovaFileTransfer,Proxy,$ionicModal,$ionicPopup){


        $scope.go_back=function () {
            window.history.back();
        }

        $scope.go_to=function (url) {
            $state.go(url);
        }

        $scope.carInfo={

        };

        /*** 绑定新车模态框 ***/
        $ionicModal.fromTemplateUrl('views/modal/bind_car_modal.html',{
            scope:  $scope,
            animation: 'animated '+'bounceInUp',
            hideDelay:920
        }).then(function(modal) {
            $scope.bind_car_modal = modal;
        });

        $scope.openBindCarModal= function(){
            try{
                $scope.bind_car_modal.show();
            }catch(e){
                alert('error=\r\n'+ e.toString());
            }
        };

        $scope.closeBindCarModal= function() {
            $scope.bind_car_modal.hide();
        };
        /*** 绑定新车模态框 ***/


        $scope.relativeCars=[];

        //查询已绑定车辆,并显示车牌信息
        $scope.fetchRelativeCars = function(){
            $http({
                method: "POST",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data:
                {
                    request:'fetchInsuranceCarInfoByCustomerId'
                }
            }).then(function(res) {
                var json=res.data;
                if(json.re==1) {
                    $scope.relativeCars=json.data;
                    if($rootScope.carInfo!==undefined&&$rootScope.carInfo!==null)
                    {
                        $scope.relativeCars.map(function(car,i) {
                            if(car.carId==$rootScope.carInfo.carId)
                                car.checked=true;
                        })
                    }
                }else if(json.re==2)
                {
                    //询问用户是否需要创建新车
                    var confirmPopup = $ionicPopup.confirm({
                        title: '您未有已绑定的车辆',
                        template: '请问是否现在创建新车\r\n您也可以通过点击右上反的\'绑定车辆完成此步骤\''
                    });
                    confirmPopup.then(function(res) {
                        if(res) {
                            $scope.openBindCarModal();
                        } else {}
                    });
                }else{}
            }).catch(function(err) {
                var str='';
                for(var field in err)
                    str+=err[field];
                console.error('error=\r\n' + str);
            });
        }

        $scope.fetchRelativeCars();
        $scope.Mutex=function(item,field,cluster) {

            if(item.idle)
            {
                item[field]=true;
                $rootScope.carInfo=item;
                cluster.map(function(cell,i) {
                    if(item.carId!=cell.carId&&cell.idle==true)
                        cell[field]=false;
                })
                $scope.relativeCars.map(function(car,i){
                    if(car.checked==true){
                        $scope.factoryNum = car.factoryNum;
                        $scope.engineNum = car.engineNum;
                        $scope.frameNum = car.frameNum;
                    }
                })
            }
        };


        $scope.bindNewCar = function(){

            $http({
                method: "POST",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data:
                {
                    request:'bindNewCar',
                    info:{
                        carNum:$scope.carInfo.carNum
                    }
                }
            }).then(function(res) {
                var json=res.data;
                var result = json.re;
                switch (result){
                    case -1:
                        var confirmPopup = $ionicPopup.confirm({
                            title: '绑定车辆',
                            template: '数据库中未保存此车,是否要创建新车'
                        });
                        confirmPopup.then(function(res) {
                            if(res) {
                                $scope.closeBindCarModal();

                                $state.go('update_car_info',{carInfo:JSON.stringify($scope.carInfo)});

                            } else {
                                $scope.closeBindCarModal();
                            }
                        });
                        break;
                    case -2:
                        var confirmPopup = $ionicPopup.confirm({
                            title: '绑定车辆',
                            template: '是否要创建新车'
                        });
                        confirmPopup.then(function(res) {
                            if(res) {
                                $scope.closeBindCarModal();
                                $state.go('update_car_info',{carNum: JSON.stringify({carNum:carNum})});
                            } else {
                                $scope.closeBindCarModal();
                            }
                        });
                        break;
                    case -3:
                        var confirmPopup = $ionicPopup.confirm({
                            title: '绑定车辆',
                            template: '该车还在保险期内,是否要创建新车'
                        });
                        confirmPopup.then(function(res) {
                            if(res) {
                                $scope.closeBindCarModal();
                                $state.go('update_car_info',{carNum: JSON.stringify({carNum:carNum})});
                            } else {
                                $scope.closeBindCarModal();
                            }
                        });
                        break;
                    case 1:
                        var carInfo = res.data;
                        $scope.relativeCars.push(carInfo);
                        var confirmPopup = $ionicPopup.confirm({
                            title: '绑定车辆',
                            template: '绑定成功!'
                        });
                        confirmPopup.then(function(res) {
                            $scope.closeBindCarModal();
                            $scope.fetchRelativeCars();
                            $state.go('car_manage');
                        });
                        break;
                    default:
                        break;
                }


            })
        }


    })
