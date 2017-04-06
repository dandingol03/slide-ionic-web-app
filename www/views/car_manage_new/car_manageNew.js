/**
 * Created by yiming on 16/11/16.
 */
angular.module('starter')
    .controller('carManageController',function($scope,$state,$http,
                                               $rootScope,$cordovaFileTransfer,Proxy,
                                               $ionicModal,$ionicPopup,$ionicLoading,
                                               $timeout,$ionicNativeTransitions,$ionicHistory,
                                               $stateParams,$q,$ionicPlatform){


        $scope.go_back=function () {

            $ionicNativeTransitions.stateGo('tabs.dashboard_backup', {}, {}, {
                "type": "slide",
                "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
                "duration": 400, // in milliseconds (ms), default 400
            });
        }

        $scope.go_to=function (url) {
            $state.go(url);
        }

        if($stateParams.params!==undefined&&$stateParams.params!==null&&$stateParams.params!='')
        {
            var params=$stateParams.params;
            if(Object.prototype.toString.call(params)=='[object String]')
                params = JSON.parse(params);
        }

        $scope.query={
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


        /****监听物理回退,以取消loading****/
        $scope.deferred=null;
        $scope.deregister = $ionicPlatform.registerBackButtonAction(
            function () {
                console.log("close the popup");
                if($scope.doingGetOrders==true&&$scope.deferred!==undefined&&$scope.deferred!==null){
                    $scope.deferred.reject({re: -1});
                    $scope.deferred=null;
                    $scope.doingGetOrders=false;
                    $ionicLoading.hide();
                    //销毁优先级高的函数
                    $scope.deregister();
                }
            }, 505
        );

        $scope.$on('$destroy', $scope.deregister);


        $scope.fetchInsuranceCarInfoByCustomerId=function (carNum) {
            var deferred=$q.defer();
            $scope.deferred=deferred;
            $http({
                method: "POST",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data:
                    {
                        request:'fetchInsuranceCarInfoByCustomerId',
                        info:{
                            carNum:carNum
                        }
                    },
                timeout:9000
            }).then(function (res) {
                var json=res.data;
                deferred.resolve(json);
            })
            return deferred.promise;
        }


        //查询已绑定车辆,并显示车牌信息
        $scope.fetchRelativeCars = function(){

            $scope.doingGetOrders=true;
            $ionicLoading.show({
                template:'<p class="item-icon-left">正在拉取您所绑定的车辆...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
            });

            $scope.fetchInsuranceCarInfoByCustomerId($scope.car.carNum)
                .then(function (json) {
                    $scope.deferred=null;
                    $scope.doingGetOrders=false;

                    if(json.re==1) {
                        $scope.relativeCars=json.data;
                        $rootScope.flags.carOrders.data.relativeCars=$scope.relativeCars;
                        $rootScope.flags.carManage.onFresh=false;
                        $scope.relativeCars.map(function(car,i) {
                            car.checked = false;
                        })
                        if($rootScope.carInfo!==undefined&&$rootScope.carInfo!==null)
                        {
                        }
                    }else if(json.re==2)
                    {
                        //询问用户是否需要创建新车
                        var confirmPopup = $ionicPopup.confirm({
                            title: '信息',
                            template: '数据库未保存该车信息，点击创建新车。'
                        });
                        confirmPopup.then(function(res) {
                            if(res) {
                                $scope.openBindCarModal();
                            } else {
                                alert('放弃降无法使用车险报价，车驾管等服务，确认取消吗?');
                            }
                        });
                    }else if(json.re==3) {
                        //询问用户是否绑定该车
                        var carInfo=json.data;
                        //检测该车是否处于订单状态
                        var isBusied=json.isBusied;
                        if(isBusied==true)
                        {
                            var ownerConfirm = $ionicPopup.confirm({
                                title: '信息',
                                template: '该车处于订单状态,只有车主才能绑定该车'
                            });

                            ownerConfirm.then(function (res) {
                                if(res)
                                {
                                    var ownerIdCard=carInfo.ownerIdCard;
                                    //该车已有车主
                                    if(ownerIdCard!==undefined&&ownerIdCard!==null)
                                    {
                                        if(ownerIdCard== $rootScope.user.personInfo.perIdCard)
                                        {
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
                                                            carNum:$scope.car.carNum
                                                        }
                                                    }
                                            }).then(function (res) {
                                                var json=res.data;
                                                if(json.re==1)
                                                {
                                                    $ionicLoading.hide();
                                                    alert('该车成功绑定');
                                                }else{
                                                    $ionicLoading.hide();
                                                    alert(json.data);
                                                }
                                            })
                                        }else{
                                            var confirmPopup = $ionicPopup.alert({
                                                title: '错误',
                                                template: '您不是车主,无法绑定'
                                            });
                                            $ionicLoading.hide();
                                        }
                                    }else{
                                        //该车目前没有车主
                                        var perIdCardInput = $ionicPopup.show({
                                            template: '<input type="text" ng-model="query.ownerIdCard">',
                                            title: '输入',
                                            subTitle: '请输入车主身份证号',
                                            scope: $scope,
                                            buttons: [
                                                { text: '取消' },
                                                {
                                                    text: '<b>Save</b>',
                                                    type: 'button-positive',
                                                    onTap: function(e) {
                                                        if (!$scope.query.ownerIdCard) {
                                                            //don't allow the user to close unless he enters wifi password
                                                            e.preventDefault();
                                                        } else {
                                                            return $scope.query.ownerIdCard;
                                                        }
                                                    }
                                                }
                                            ]
                                        });

                                        perIdCardInput.then(function(res) {

                                        });

                                    }
                                }else{
                                    $ionicLoading.hide();
                                }
                            })

                        }else{

                            //车辆空闲
                            var confirmPopup = $ionicPopup.confirm({
                                title: '信息',
                                template: '您尚未绑定车辆，点击绑定该车。'
                            });
                            confirmPopup.then(function(res) {
                                if(res) {

                                    $http({
                                        method: "POST",
                                        url: Proxy.local()+"/svr/request",
                                        headers: {
                                            'Authorization': "Bearer " + $rootScope.access_token
                                        },
                                        data:
                                            {
                                                request:'verifyCarOwner',
                                                info:{
                                                    carNum:carInfo.carNum
                                                }
                                            }
                                    }).then(function (res) {
                                        var json=res.data;
                                        if(json.data==true)
                                        {
                                            var confirmPopup = $ionicPopup.alert({
                                                title: '信息',
                                                template: '该车已绑定至你的用户!'
                                            });
                                        }else{
                                            return  $http({
                                                method: "POST",
                                                url: Proxy.local()+"/svr/request",
                                                headers: {
                                                    'Authorization': "Bearer " + $rootScope.access_token
                                                },
                                                data:
                                                    {
                                                        request:'bindNewCar',
                                                        info:{
                                                            carNum:$scope.car.carNum
                                                        }
                                                    }
                                            })
                                        }
                                    }).then(function (res) {
                                        var json=res.data;
                                        if(json.re==1)
                                        {
                                            var confirmPopup = $ionicPopup.alert({
                                                title: '信息',
                                                template: '该车已绑定至你的用户!'
                                            });
                                        }else{
                                            var confirmPopup = $ionicPopup.alert({
                                                title: '错误',
                                                template: json.data
                                            });
                                        }
                                    })

                                } else {
                                    alert('放弃降无法使用车险报价，车驾管等服务，确认取消吗?');
                                }
                            });

                        }

                    }else{}
                    $ionicLoading.hide();
                }).catch(function(err) {
                $scope.doingGetOrders=false;
                if(err.status==-1)
                {
                    var alertPopup = $ionicPopup.alert({
                        title: '错误',
                        template: '请求超时，请点击右上方的刷新按钮刷新数据'
                    });
                }else{
                    var str='';
                    for(var field in err)
                        str+=err[field];
                    console.error('error=\r\n' + str);
                }
                $ionicLoading.hide();
            });
        }

        if($rootScope.flags.carManage.onFresh==true){
            $scope.fetchRelativeCars();
        }else{
            $scope.relativeCars=$rootScope.flags.carOrders.data.relativeCars;
            $scope.relativeCars.map(function (car,i) {
                car.checked=false;
            })
        }

        $scope.Mutex=function(item,field,cluster) {
            // car checked relativeCars

            if(item.idle)
            {
                if(item[field]==false){

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
                    });

                    $state.go('car_insurance',{carInfo:JSON.stringify($rootScope.carInfo)});
                }
                else{
                    item[field]=false;
                }
            }
        };

        //车辆选择城市
        $scope.city=null;

        $scope.city_select=function (city) {
            $scope.city=city;
        }

        /*** bind append_carNumPrefix_modal***/

        $scope.plainStyle={width: '30%',display: 'inline-block',
            'text-align': 'center',background: '#ffffff',padding: '10px','border-radius': '5px'};
        $scope.selectedStyle={width: '30%',display: 'inline-block',color:'#fff',
            'text-align': 'center',background: '#30cecf',padding: '10px','border-radius': '5px','font-size':'1.2em','font-weight':'bolder'};

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
            var selectCompanyNum=null;
            switch (city) {
                case '济南':
                    carNum='鲁A';
                    selectCompanyNum='01'
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


        $scope.flag=false;
        $scope.verifyCarNum=function () {
            var carNum=$scope.carInfo.carNum;

            if(carNum!==undefined&&carNum!==null&&carNum!='')
            {
                if(carNum.toString().length!=7&&carNum.toString().length!=8)
                {
                    $ionicPopup.alert({
                        title: '错误',
                        template: '您输入的车牌号位数不对，请输入6位或者7位的车牌号再点击创建'
                    });
                }else{
                    //TODO:give a tip

                    if(carNum.toString().length==8)
                    {
                        var confirm=$ionicPopup.confirm({
                            title: '信息',
                            template: '您输入的车牌号为7位，是否为新能源车'
                        });
                        confirm.then(function (res) {
                            if(res) {
                                if($scope.flag==false){
                                    $scope.bindNewCar();
                                }
                            }else{
                                $ionicPopup.alert({
                                    title: '错误',
                                    template: '非新能源车的车牌号不能为7位'
                                });
                            }
                        });
                    }else{
                        if($scope.flag==false){
                            $scope.bindNewCar();
                        }
                    }
                }
            }else{
                $ionicPopup.alert({
                    title: '错误',
                    template: '请填入车牌号再进行绑定'
                });
            }

        }

        $scope.bindNewCar = function(){

            $scope.flag=true;
            var carNum=$scope.carInfo.carNum;

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
                        request:'verifyCarOwner',
                        info:{
                            carNum:$scope.carInfo.carNum
                        }
                    }
            }).then(function (res) {
                var json=res.data;

                if(json.data==true) {
                    var confirmPopup = $ionicPopup.alert({
                        title: '信息',
                        template: '该车已绑定至你的用户!'
                    });
                }else{
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
                                $timeout(function () {
                                    var confirmPopup = $ionicPopup.confirm({
                                        title: '绑定车辆',
                                        template: '数据库中未保存此车,是否要创建新车'
                                    });
                                    confirmPopup.then(function(res) {
                                        if(res) {
                                            $scope.closeBindCarModal();
                                            $state.go('update_car_info',{carNumInfo:JSON.stringify({city:$scope.city_confirmed,carNum:$scope.carInfo.carNum})});
                                            $scope.flag=false;
                                        } else {
                                            $scope.closeBindCarModal();
                                            $scope.flag=false;
                                        }
                                    });
                                }, 400);

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
                                        $scope.flag=false;
                                    } else {
                                        $scope.closeBindCarModal();
                                        $scope.flag=false;
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
                                        $scope.flag=false;
                                    } else {
                                        $scope.closeBindCarModal();
                                        $scope.flag=false;
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
                                    $scope.flag=false;
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
            }).catch(function (err) {
                var str='';
                for(var field in err)
                    str+=err[field];
                console.error('err=\r\n'+str);
            });


        }

        $scope.notFirstRowStyle={
            height: '50px',position: 'relative',
            'border-right': '1px solid rgba(88, 73, 58, 0.95)',
            'border-left':'1px solid rgba(88, 73, 58, 0.95)',
            'border-top':'1px solid rgba(88, 73, 58, 0.95)',
            'background':'transparent'
        };
        $scope.firstRowStyle={
            height: '50px',position: 'relative',
            'border-right': '1px solid rgba(88, 73, 58, 0.95)',
            'border-left':'1px solid rgba(88, 73, 58, 0.95)',
            'border-top':'0px',
            'background':'transparent'
        };
        $scope.lastRowStyle={
            height: '50px',position: 'relative',
            'border-right': '1px solid rgba(88, 73, 58, 0.95)',
            'border-left':'1px solid rgba(88, 73, 58, 0.95)',
            'border-top':'1px solid rgba(88, 73, 58, 0.95)',
            'border-bottom':'1px solid rgba(88, 73, 58, 0.95)',
            'background':'transparent'
        };

    })
/**
 * Created by dingyiming on 2017/4/5.
 */
