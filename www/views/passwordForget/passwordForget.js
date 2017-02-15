/**
 * Created by apple-2 on 16/8/23.
 */
angular.module('starter')
    .controller('passwordForgetController',function($scope,$state,$http,
                                                    $ionicPopup,Proxy){

        $scope.info={
        };

        $scope.go_back=function(){
            //window.history.back();
            $ionicNativeTransitions.stateGo('login', {}, {}, {
                "type": "slide",
                "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
                "duration": 240, // in milliseconds (ms), default 400
            });
        };

        $scope.getCode=function () {
            $http({
                method:"GET",
                url:Proxy.local()+'/securityCode?'+"phoneNum=" + $scope.info.phone,
                headers: {
                    'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
                    'Content-Type': 'application/x-www-form-urlencoded'
                }

            }).then(function(res) {
                var json=res.data;
                if(json.re==1){
                    $scope.code=json.data;
                    alert($scope.code);
                }
                else{
                    console.error('error=\r\n'+json.data);
                }
            })
        }


        $scope.apply=function () {

            if ($scope.code == $scope.info.code) {

                $http({
                    method: "POST",
                    url: Proxy.local() + '/passwordForget?'+'phone='+$scope.info.phone,
                    headers: {
                        'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).then(function (res) {
                    var json = res.data;
                    if(json.re==1)
                    {
                        var pwd=json.data;
                        var confirmPopup = $ionicPopup.confirm({
                            title: '',
                            template: '您的密码已通过短信发送到手机，请注意查收',
                            cancelText:'返回',
                            okText:'查看密码'
                        });
                        confirmPopup.then(function(res) {
                            if(res) {
                                //进入查看密码分支
                                var alertPopup = $ionicPopup.alert({
                                    title: '查看密码',
                                    template: '您的密码是:   '+pwd
                                });
                                alertPopup.then(function(res) {
                                    $state.go('login');
                                });
                            }else
                            {
                                $state.go('login');
                            }
                        })
                    }
                    else if(json.re==-1) {
                        alert(json.data);
                    }else{}
                }).catch(function (err) {
                    console.error('err=\r\n' + err);
                });
            } else {
                $scope.showAlert = function () {
                    var alertPopup = $ionicPopup.alert({
                        title: '',
                        template: '校验码输入错误'
                    });
                }
            }
        }



    });
