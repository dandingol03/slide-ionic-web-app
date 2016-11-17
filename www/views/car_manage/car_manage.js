/**
 * Created by yiming on 16/11/16.
 */
angular.module('starter')
    .controller('carManageController',function($scope,$state,$http,
                                                $rootScope,$cordovaFileTransfer,Proxy,$ionicModal){


        $scope.selectButton1=false;
        $scope.selectButton2=false;
        $scope.bindCarFlag=false
        $scope.goUpdate=function(url){
            $state.go(url);
            if($scope.selectButton1==false){
                $scope.selectButton1=true;
            }else{
                $scope.selectButton1=false;
            }
        }
        $scope.goBind=function(url){
            $state.go(url);
            if($scope.selectButton2==false){
                $scope.selectButton2=true;
            }else{
                $scope.selectButton2=false;
            }
        }
        $scope.changeBindCarFlag = function(){
            if($scope.bindCarFlag==false){
                $scope.bindCarFlag=true;
            }else{
                $scope.bindCarFlag=false;
            }
        }
        $scope.go_back=function () {
            window.history.back();
        }

        /*** 绑定新车模态框 ***/
        $ionicModal.fromTemplateUrl('views/modal/bind_car_modal.html',{
            scope:  $scope,
            animation: 'slide-in-bottom'
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
                }
            }).catch(function(err) {
                var str='';
                for(var field in err)
                    str+=err[field];
                console.error('error=\r\n' + str);
            });

        $scope.Mutex=function(item,field,cluster) {
                item[field]=true;
                cluster.map(function(cell,i) {
                    if(item.carId!=cell.carId)
                        cell[field]=false;
                })
            $scope.relativeCars.map(function(car,i){
                if(car.checked==true){
                    $scope.factoryNum = car.factoryNum;
                    $scope.engineNum = car.engineNum;
                    $scope.frameNum = car.frameNum;
                }
            })

        };


    })
