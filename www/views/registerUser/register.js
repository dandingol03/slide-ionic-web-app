/**
 * Created by yiming on 16/10/27.
 */
/**
 * Created by danding on 16/9/6.
 */
angular.module('starter')

    .controller('registerController',function($scope,$state,$http,$ionicPopup,
                                              $timeout,$rootScope,$cordovaFile,$cordovaFileTransfer,
                                              $ionicActionSheet,$cordovaCamera,Proxy,$cordovaPreferences,
                                              $ionicLoading
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


        $scope.registerDoing=false;

        $scope.register=function(){

            if($scope.registerDoing==false)
            {

                if($scope.code==$scope.info.code){

                    $scope.registerDoing=true;

                    $ionicLoading.show({
                        template:'<p class="item-icon-left">注册业务进行中...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
                    });

                    var url=null;
                    if($scope.info.username!==undefined&&$scope.info.username!==null&&$scope.info.username!=='')
                    {
                        url=Proxy.local()+'/register?'+'username='+$scope.info.username+
                            '&&password='+$scope.info.password+'&&mobilePhone='+$scope.info.mobilePhone;
                    }else{
                        url=Proxy.local()+'/register?'+'username='+$scope.info.mobilePhone+
                            '&&password='+$scope.info.password+'&&mobilePhone='+$scope.info.mobilePhone;
                    }

                    if($scope.info.mail!==undefined&&$scope.info.mail!==null&&$scope.info.mail!='')
                    {
                        url+='&&EMAIL='+$scope.info.mail;
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

                            confirmPopup.then(function(res) {
                                if(res) {

                                    $timeout(function () {
                                        $scope.doLogin();
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
                        $scope.registerDoing=false;
                        $ionicLoading.hide();
                    }).catch(function (err) {
                        var str='';
                        for(var field in err)
                            str+=err[field];
                        console.error('err=\r\n'+str);
                        $scope.registerDoing=false;
                        $ionicLoading.hide();
                    })
                }
                else{
                    alert('手机验证码输入错误');
                }
            }else{}
        }



        $scope.doLogin=function(){
            if($rootScope.registrationId==undefined||$rootScope.registrationId==null||$rootScope.registrationId=='')
            {

                if(window.plugins!==undefined&&window.plugins!==null) {
                    try {

                        window.plugins.jPushPlugin.getRegistrationID(function(data) {
                            alert('registrationId=\r\n'+data);
                            $rootScope.registrationId=data;
                            $scope.login();
                        });
                    } catch (e) {
                        alert(e);
                    }
                }
                else{
                    $scope.login();
                }
            }else{
                $scope.login();
            }
        }


        //登录
        $scope.login = function() {



            $ionicLoading.show({
                template:'<p class="item-icon-left">Loading...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
            });


            $http({
                method: "POST",
                data: "grant_type=password&password=" + $scope.info.password + "&username=" + $scope.info.username,
                url: Proxy.local() + '/login',
                headers: {
                    'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(function (res) {

                $ionicLoading.hide();

                var json = res.data;
                var access_token = json.access_token;

                if(window.plugins!==undefined&&window.plugins!==null) {
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


                if (access_token !== undefined && access_token !== null) {
                    $rootScope.access_token = access_token;
                    console.log('registrationId=\r\n' + $rootScope.registrationId);


                    //获取个人信息
                    $http({
                        method: "POST",
                        url: Proxy.local() + "/svr/request",
                        headers: {
                            'Authorization': "Bearer " + $rootScope.access_token
                        },
                        data: {
                            request: 'getPersonInfoByPersonId'
                        }
                    }).then(function(res) {
                        var json=res.data;
                        if(json.re==1) {
                            $rootScope.userInfo=json.data;
                            //手机环境
                            if (window.cordova !== undefined && window.cordova !== null) {
                                $http({
                                    method: "POST",
                                    url: Proxy.local() + "/svr/request",
                                    headers: {
                                        'Authorization': "Bearer " + $rootScope.access_token
                                    },
                                    data: {
                                        request: 'activatePersonOnline',
                                        info: {
                                            registrationId: $rootScope.registrationId !== undefined && $rootScope.registrationId !== null ? $rootScope.registrationId : ''
                                        }
                                    }
                                }).then(function (res) {
                                    var json = res.data;
                                    if (json.re == 1 || json.result == 'ok') {
                                        $state.go('tabs.dashboard_backup');
                                    }
                                }).catch(function (err) {
                                    var error = '';
                                    for (var field in err) {
                                        error += err[field] + '\r\n';
                                    }
                                    alert('error=' + error);
                                });
                            } else {
                                $state.go('tabs.dashboard_backup');
                            }
                        }
                    })
                }
                else
                    console.log('cannot get access_token');
            }).catch(function(err) {
                var msg=err.data;
                if(msg.error=='invalid_grant')
                {
                    if(msg.error_description=='User credentials are invalid')
                    {

                        $http({
                            method: "POST",
                            url: Proxy.local() + "/validateUser?username="+$scope.info.username+'&'+'password='+$scope.info.password,
                            headers: {
                                'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        }).then(function(res) {
                            var json=res.data;
                            if(json.re==2)
                            {
                                $ionicPopup.alert({
                                    title: '错误',
                                    template: '密码无法匹配用户名'
                                });
                            }else if(json.re==-1)
                            {
                                $ionicPopup.alert({
                                    title: '错误',
                                    template: '用户名不存在'
                                });
                            }else{}
                        });


                    }
                }
                $ionicLoading.hide();

            })
        }


    });
