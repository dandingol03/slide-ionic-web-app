/**
 * Created by yiming on 16/10/27.
 */
/**
 * Created by danding on 16/9/6.
 */
angular.module('starter')

    .controller('registerController',function($scope,$state,$ionicLoading,$http,$ionicPopup,$timeout,$rootScope
        ,$cordovaFile,$cordovaFileTransfer,$ionicActionSheet,$cordovaCamera,Proxy,$cordovaPreferences
    ){


        $scope.info={};
        $scope.code=0;


        $scope.go_back=function(){
            window.history.back();
        }

        $scope.validate=function(item,field,pattern) {
            if(pattern!==undefined&&pattern!==null)
            {
                var reg=eval(pattern);
                var re=reg.exec(item[field]);
                if(re!==undefined&&re!==null)
                {
                    item[field+'_error']=false;
                }
                else{
                    item[field+'_error']=true;
                }
            }
        };



        $scope.getCode=function () {


            //TODO:校验手机号长度
            var reg=/\d{11}/;
            var mobilePhone=$scope.info.mobilePhone;
            if(reg.exec(mobilePhone)!==null)
            {

                $http({
                    method:"GET",
                    url:Proxy.local()+'/verifyMobilePhoneRedundancy?'+"mobilePhone=" + $scope.info.mobilePhone,
                    headers: {
                        'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).then(function (res) {
                    var json=res.data;
                    if(json.data==true)
                    {
                        var myPopup = $ionicPopup.alert({
                            template: '您输入的手机号已被使用,请重新填入手机号再注册',
                            title: '<strong style="color:red">信息</strong>'
                        });
                    }else{
                        $http({
                            method:"GET",
                            url:Proxy.local()+'/securityCode?'+"phoneNum=" + $scope.info.mobilePhone,
                            headers: {
                                'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }

                        }).then(function(res) {
                            var json=res.data;
                            if(json.re==1){
                                $scope.code=json.data;
                                alert('验证码='+$scope.code);
                            }
                            else{
                                alert('error=\r\n'+json.data);
                            }
                        })
                    }
                });


            }else{
                var myPopup = $ionicPopup.alert({
                    template: '请输入11位的数字作为手机号\r\n再点击获取验证码',
                    title: '<strong style="color:red">错误</strong>'
                });
            }
        }


        $scope.register=function(){
            if($scope.code==$scope.info.code){

                var url=null;
                if($scope.info.username!==undefined&&$scope.info.username!==null&&$scope.info.username!=='')
                {
                    url=Proxy.local()+'/register?'+'username='+$scope.info.username+
                        '&&password='+$scope.info.password+'&&mobilePhone='+$scope.info.mobilePhone;
                }else{
                    url=Proxy.local()+'/register?'+'username='+$scope.info.mobilePhone+
                        '&&password='+$scope.info.password+'&&mobilePhone='+$scope.info.mobilePhone;
                }


                $http({
                    method:"POST",
                    url:url,
                    headers: {
                        'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }

                }).then(function(res) {
                    var json = res.data;
                    if(json.re==1){
                        var confirmPopup = $ionicPopup.confirm({
                            title: '注册信息',
                            template: '注册成功！是否要直接登录？'
                        });
                        confirmPopup.then(function(res) {
                            if(res) {

                                if(window.plugins!==undefined&&window.plugins!==null)
                                {
                                    $cordovaPreferences.store('username', $scope.info.username)
                                        .success(function(value) {
                                        })
                                        .error(function(error) {
                                            alert("Error: " + error);
                                        });
                                    $cordovaPreferences.store('password', $scope.info.password)
                                        .success(function(value) {
                                        })
                                        .error(function(error) {
                                            alert("Error: " + error);
                                        });

                                }
                                $timeout(function () {
                                    $state.go('login');
                                },600)
                            }
                            else {

                            }
                        });

                    }
                    else{
                        if(json.re==2){
                            alert(json.data);
                        }else{
                            alert('注册失败');
                        }

                    }
                })
            }
            else{
                alert('手机验证码输入错误');
            }

        }





    });
