/**
 * Created by yiming on 16/11/16.
 */
angular.module('starter')
    .controller('carManageController',function($scope,$state,$http,
                                               $rootScope,$cordovaFileTransfer,Proxy,
                                               $ionicModal,$ionicPopup,$ionicLoading){


        $scope.go_back=function () {
            window.history.back();
        }

        $scope.go_to=function (url) {
            $state.go(url);
        }

        $scope.goDetail=function (car) {
            $state.go('car_info_detail',{carInfo:JSON.stringify(car)})
        }

        $scope.carInfo={

        };

        $scope.clear_search=function () {
            $scope.tempCarNum=null;
        }


        $scope.confirmCarInfo=function () {
            var carInfo=null;
            $scope.relativeCars.map(function(car,i) {
                if(car.checked==true&&car.idle==true)
                {
                    carInfo=car;
                }
            });
            if(carInfo!==null)
            {

                if($rootScope.carInfo!==undefined&&$rootScope.carInfo!==null)
                    $state.go('car_insurance',{carInfo:JSON.stringify($rootScope.carInfo)});
                else{
                    var confirmPopup = $ionicPopup.alert({
                        title: '信息',
                        template: '请先选择车辆!'
                    });

                }
            }
            else{
                $ionicPopup.alert({
                    title: '错误',
                    template: '请选择车辆后再确定选择'
                });
            }
        }

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
        $scope.car={};

        //查询已绑定车辆,并显示车牌信息
        $scope.fetchRelativeCars = function(){

            $ionicLoading.show({
                template:'<p class="item-icon-left">正在拉取您所绑定的车辆...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
            });


            $http({
                method: "POST",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data:
                    {
                        request:'fetchInsuranceCarInfoByCustomerId',
                        info:{carNum:$scope.car.carNum}
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
                        title: '您没有已绑定的车辆',
                        template: '您尚未绑定车辆，请点击"确定"创建新车。'
                    });
                    confirmPopup.then(function(res) {
                        if(res) {
                            $scope.openBindCarModal();
                        } else {
                            alert('放弃降无法使用车险报价，车驾管等服务，确认取消吗?');
                        }
                    });
                }else{}
                $ionicLoading.hide();
            }).catch(function(err) {
                var str='';
                for(var field in err)
                    str+=err[field];
                console.error('error=\r\n' + str);
                $ionicLoading.hide();
            });
        }

        //$scope.fetchRelativeCars();
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

        //车辆选择城市
        $scope.city=null;

        $scope.city_select=function (city) {
            $scope.city=city;
        }

        /*** bind append_carNumPrefix_modal***/

        $scope.plainStyle={width: '30%',display: 'inline-block',
            'text-align': 'center',background: '#fff',padding: '10px','border-radius': '5px'};
        $scope.selectedStyle={width: '30%',display: 'inline-block',color:'#fff',
            'text-align': 'center',background: 'rgba(0, 235, 255, 0.74)',padding: '10px','border-radius': '5px','font-size':'1.2em','font-weight':'bolder'};

        $ionicModal.fromTemplateUrl('views/modal/append_carNumPrefix_modal.html',{
            scope:  $scope,
            animation: 'animated '+' bounceInUp',
            hideDelay:920
        }).then(function(modal) {
            $scope.append_carNumPrefix_modal = modal;
        });

        $scope.open_append_carNumPrefixModal= function(){
            $scope.append_carNumPrefix_modal.show();
        };

        $scope.close_append_carNumPrefixModal= function() {
            $scope.append_carNumPrefix_modal.hide();
        };

        /*** bind append_carNumPrefix_modal ***/

        $scope.selectCarNumPrefixByCity=function () {
            $scope.open_append_carNumPrefixModal();
        }

        $scope.getCarNumPrefixByCity=function (city) {
            var carNum=null;
            switch (city) {
                case '济南':
                    carNum='鲁A';
                    break;
                case '青岛':
                    carNum='鲁B';
                    break;
                case '淄博':
                    carNum='鲁C';
                    break;
                case '枣庄':
                    carNum='鲁D';
                    break;
                case '东营':
                    carNum='鲁E';
                    break;
                case '烟台':
                    carNum='鲁F';
                    break;
                case '潍坊':
                    carNum='鲁G';
                    break;
                case '济宁':
                    carNum='鲁H';
                    break;
                case '泰安':
                    carNum='鲁J';
                    break;
                case '威海':
                    carNum='鲁K';
                    break;
                case '日照':
                    carNum='鲁L';
                    break;
                case '滨州':
                    carNum='鲁M';
                    break;
                case '德州':
                    carNum='鲁N';
                    break;
                case '聊城':
                    carNum='鲁P';
                    break;
                case '临沂':
                    carNum='鲁Q';
                    break;
                case '菏泽':
                    carNum='鲁R';
                    break;
                case '莱芜':
                    carNum='鲁S';
                    break;
                default:
                    break;
            }
            return carNum;
        }

        $scope.city_confirm=function () {

            $scope.city_confirmed=$scope.city;
            $scope.carInfo.carNum=$scope.getCarNumPrefixByCity($scope.city);
            $scope.close_append_carNumPrefixModal();

        }


        $scope.$on('$destroy', function() {
            $scope.append_carNumPrefix_modal.remove();
        });

        $scope.changeCarNum=function () {
            $scope.carInfo.carNum=$scope.carInfo.carNum.toString().toUpperCase();
        }


        $scope.bindNewCar = function(){

            var carNum=$scope.carInfo.carNum;
            if(carNum!==undefined&&carNum!==null&&carNum!='')

            {
                if(carNum.toString().length!=7)
                {
                    $ionicPopup.alert({
                        title: '错误',
                        template: '车牌号输入错误\r\n请输入6位的车牌号'
                    });
                }else{

                    var carNumPrefix=carNum.substring(0,2);
                    var  prefix=$scope.getCarNumPrefixByCity ($scope.city_confirmed);
                    if(carNumPrefix!=prefix)
                    {
                        $ionicPopup.alert({
                            title: '错误',
                            template: '您输入的车牌号前缀不符合您选择的城市'
                        });
                        return ;
                    }

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
                                        $state.go('update_car_info',{carNumInfo:JSON.stringify({city:$scope.city_confirmed,carNum:$scope.carInfo.carNum})});
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
                                        $state.go('update_car_info');
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
                                        $state.go('update_car_info',{carNumInfo:JSON.stringify({city:$scope.city_confirmed,carNum:$scope.carInfo.carNum})});
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
                    });
                }

            }else{
                $ionicPopup.alert({
                    title: '错误',
                    template: '请填入车牌号再进行绑定'
                });
            }


        }




    })
