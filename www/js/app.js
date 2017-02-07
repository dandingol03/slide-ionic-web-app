// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js


function isEmpty(value) {
    return angular.isUndefined(value) || value === '' || value === null || value !== value;
}


angular.module('starter', ['ionic', 'ngCordova','ngBaiduMap','ionic-datepicker',
                            'LocalStorageModule','ionic-native-transitions','toaster'])

    .config(function(baiduMapApiProvider) {
        baiduMapApiProvider.version('2.0').accessKey('hxMVpPXqcpdNGMrLTGLxN3mBBKd6YiT6');
    })


    .run(function($ionicPlatform,$rootScope,$interval,
                  $cordovaToast,$ionicHistory,$location,
                  $ionicPopup,Proxy,$http,$state,$ionicNativeTransitions,
                  $timeout,toaster,$cordovaFileTransfer,$cordovaMedia,$cordovaPreferences,$q) {



      $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)

        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          cordova.plugins.Keyboard.disableScroll(false);
            ionic.Platform.isFullScreen = true
        }
        if (window.StatusBar) {
          // org.apache.cordova.statusbar required
          StatusBar.styleDefault();
        }

        $rootScope.life_insurance={

        };

        $rootScope.waitConfirm={};

        $rootScope.property=null;

        $rootScope.carManage={
          carValidate:{},
          paperValidate:{},
          airportTransfer:{},
          parkCar:{}
        };

        $rootScope.dashboard={
        };

        $rootScope.maintain={
          description:{}
        }

        $rootScope.flags={
            carOrders:{
                onFresh:true,
                data:{
                },
                clear:false
            },
            lifeOrders:{
                onFresh:true
            },
            serviceOrders:{
                onFresh:true,
                clear:false
            },
            carManage:{
                onFresh:true,
                data:{

                }
            }
        }

        $rootScope.msg=[];

        $rootScope.getAccessToken=function () {
            var deferred=$q.defer();
            if($rootScope.access_token!==undefined&&$rootScope.access_token!==null)
            {
                deferred.resolve({re: 1, data: $rootScope.access_token});
            }else {
                $cordovaPreferences.fetch('username')
                    .success(function (value) {
                        var user={};
                        if (value !== undefined && value !== null && value != '')
                            user.username = value;
                        $cordovaPreferences.fetch('password')
                            .success(function (value) {
                                if (value !== undefined && value !== null && value != '')
                                    user.password = value;
                                if (user.username !== undefined && user.username !== null && user.username != ''
                                    && user.password !== undefined && user.password !== null && user.password != '') {
                                    $http({
                                        method: "POST",
                                        data: "grant_type=password&password=" + user.password + "&username=" + user.username,
                                        url: Proxy.local() + '/login',
                                        headers: {
                                            'Authorization': "Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW",
                                            'Content-Type': 'application/x-www-form-urlencoded'
                                        }
                                    }).then(function (res) {
                                        var json = res.data;
                                        var access_token = json.access_token;
                                        $rootScope.access_token = access_token;
                                        deferred.resolve({re: 1, data: access_token});
                                    });
                                }else{
                                    deferred.resolve({re: 2, data: '请登录app后查看推送通知'});
                                }
                            });
                    });

            }
            return deferred.promise;
        }


        $rootScope.getOrderInfo=function (orderId) {
            var deferred=$q.defer();

            $http({
                method: "post",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data:
                    {
                        request:'getCarServiceOrderByOrderId',
                        info:{
                            orderId:orderId
                        }
                    }
            }).then(function (res) {
                var json=res.data;
                deferred.resolve(json);
            });

            return deferred.promise;
        }

        var onTagsWithAlias = function(event) {
          try {
            console.log("onTagsWithAlias");
            var result = "result code:" + event.resultCode + " ";
            result += "tags:" + event.tags + " ";
            result += "alias:" + event.alias + " ";
           // alert('result=\r\n' + result);
          } catch(exception) {
            console.log(exception);
          }
        }


        //通知的回调
        $rootScope.onReceiveNotification = function(event) {
            try{

                var extras=null;
                if(device.platform == "Android") {

                    extras=event.extras;

                } else {
                    alert('ios');
                    console.log('platform doesn\'t support');
                    return ;
                }

                if(Object.prototype.toString.call(extras)=='[object String]')
                    extras=JSON.parse(extras);

                console.log('=====================notification=================');
                for(var field in extras)
                    console.log(field + ':' + extras[field]);

                alert('type='+extras.type);
                switch (extras.type) {
                    case 'from-service':
                        //TODO:加入语音提醒
                        try{
                            var orderId=extras.orderId;
                            var servicePersonId=extras.servicePersonId;
                            var content='工号为'+servicePersonId+'的服务人员发出接单请求';
                            var user={};
                            var date=new Date(extras.date);

                            console.log('orderId='+orderId);
                            console.log('content=' + content);


                            $rootScope.getAccessToken().then(function (json) {
                                if(json.re==1) {
                                    $http({
                                        method: "post",
                                        url: Proxy.local() + "/svr/request",
                                        headers: {
                                            'Authorization': "Bearer " + $rootScope.access_token,
                                        },
                                        data: {
                                            request: 'createNotification',
                                            info:{
                                                ownerId:orderId,
                                                content:content,
                                                notyTime:date,
                                                side:'customer',
                                                subType:null,
                                                type:'service'

                                            }
                                        }
                                    }).then(function (res) {
                                        var json = res.data;
                                        if (json.re == 1) {
                                          //  alert('json re==1');
                                            var url = Proxy.local() + '/svr/request?request=generateTTSSpeech' + '&text=' +
                                                content+'&ttsToken='+$rootScope.ttsToken;
                                            var fileSystem=cordova.file.externalApplicationStorageDirectory;
                                            var target=fileSystem+'temp.mp3';
                                            var trustHosts = true;
                                            var options = {
                                                fileKey: 'file',
                                                headers: {
                                                    'Authorization': "Bearer " + $rootScope.access_token
                                                }
                                            };
                                          //  alert('begin download audio');
                                            $cordovaFileTransfer.download(url, target, options, trustHosts)
                                                .then(function (res) {

                                                    var order=null;
                                                    $rootScope.getOrderInfo(orderId).then(function (json) {
                                                        if(json.re==1) {
                                                            order=json.data;

                                                            toaster.pop({
                                                                type:'black',
                                                                title:"信息",
                                                                body:content,
                                                                timeout:0,
                                                                showCloseButton: true,
                                                                onHideCallback: function () {
                                                                    //TODO:validate accessToken

                                                                    if($rootScope.access_token!==undefined&&$rootScope.access_token!==null)
                                                                    {
                                                                        //服务人员接单
                                                                        if(order!==undefined&&order!==null)
                                                                            $state.go('service_order_detail',{order:JSON.stringify(order)});
                                                                        else
                                                                            $state.go('service_order_detail',{});
                                                                    }else{

                                                                        $rootScope.getAccessToken().then(function (json) {
                                                                            if(json.re==1) {
                                                                                //服务人员接单
                                                                                if(order!==undefined&&order!==null)
                                                                                    $state.go('service_order_detail',{order:JSON.stringify(order)});
                                                                                else
                                                                                    $state.go('service_order_detail',{});
                                                                            }
                                                                        });

                                                                    }

                                                                }
                                                            });
                                                        }
                                                    });

                                                    //TODO:播放录音
                                                    var filepath=fileSystem+'temp.mp3';
                                                    filepath = filepath.replace('file://','');
                                                    var media = $cordovaMedia.newMedia(filepath);

                                                    if(ionic.Platform.isIOS()) {
                                                    }else if(ionic.Platform.isAndroid()) {
                                                        media.play();
                                                    }else{}
                                                    console.log('tts speach generate success');
                                                }, function (err) {
                                                    console.log('err=========================');
                                                    var str='';
                                                    for(var field in err)
                                                        str+=field+':'+'\r\n'+err[field];
                                                    console.log('error=' + str);
                                                }, function (progress) {

                                                });

                                        }
                                    }).catch(function (err) {
                                        var str='';
                                        for(var field in err)
                                            str+=err[field];
                                    //    alert('err=\r\n'+str);
                                    });
                                }else{
                                    var myPopup = $ionicPopup.alert({
                                        template: json.data,
                                        title: '错误'
                                    });
                                }
                            });



                        }catch(e)
                        {
                            alert('err=' + e.toString());
                        }
                        break;

                    case 'from-background':

                        //车险报价或者寿险报价
                        var orderState=parseInt(extras.orderState);

                        var user={};
                        switch (orderState) {
                            case 3:
                                //报价完成
                                var orderId=extras.orderId;
                                var orderNum=extras.orderNum;
                                var orderType=parseInt(extras.orderType);
                                var date=extras.date;
                                var msg=null;
                                var content='订单号为'+orderNum+'的车险订单已报价完成';
                              //  alert('orderId=' + orderId);
                              //  alert('orderNum=' + orderNum);
                              //  alert('orderType=' + orderType);
                              //  alert('date='+date);
                                if(orderType==1)
                                {
                                    msg='订单号为'+orderNum+'的车险订单已报价完成\r\n'+'是否现在进入车险订单页面查看';
                                    $rootScope.flags.carOrders.onFresh=true;
                                }
                                else if(orderType==2)
                                {
                                    msg='订单号为'+orderNum+'的寿险订单已报价完成\r\n'+'是否现在进入寿险订单页面查看';
                                    $rootScope.flags.lifeOrders.onFresh=true;
                                }

                                //TODO:生成语音文件
                                $rootScope.getAccessToken().then(function (json) {
                                    if(json.re==1) {
                                        $http({
                                            method: "post",
                                            url: Proxy.local() + "/svr/request",
                                            headers: {
                                                'Authorization': "Bearer " + $rootScope.access_token,
                                            },
                                            data: {
                                                request: 'createNotification',
                                                info:{
                                                    ownerId:orderId,
                                                    content:content,
                                                    notyTime:new Date(date),
                                                    side:'customer',
                                                    subType:null,
                                                    type: orderType==1?'car':'life'

                                                }
                                            }
                                        }).then(function (res) {
                                            var json=res.data;
                                            if(json.re==1) {



                                             //   alert('ttsToken='+$rootScope.ttsToken);
                                                var url = Proxy.local() + '/svr/request?request=generateTTSSpeech' + '&text=' +
                                                    msg+'&ttsToken='+$rootScope.ttsToken;
                                                var fileSystem=cordova.file.externalApplicationStorageDirectory;
                                                var target=fileSystem+'temp.mp3';
                                                var trustHosts = true;
                                                var options = {
                                                    fileKey: 'file',
                                                    headers: {
                                                        'Authorization': "Bearer " + $rootScope.access_token
                                                    }
                                                };

                                                $cordovaFileTransfer.download(url, target, options, trustHosts)
                                                    .then(function (res) {

                                                        var cmd=null;
                                                        switch(orderType)
                                                        {
                                                            case 1:
                                                                cmd='fetchCarOrderByOrderId';
                                                                break;
                                                            case 2:
                                                                cmd='fetchLifeOrderByOrderId';
                                                                break;
                                                            default:
                                                                break;
                                                        }

                                                        $http({
                                                            method: "POST",
                                                            url: Proxy.local() + '/'+cmd,
                                                            headers: {
                                                                'Content-Type': 'application/json'
                                                            },
                                                            data: {
                                                                info: {
                                                                    orderId:orderId
                                                                }
                                                            }
                                                        }).then(function (res) {
                                                            var json=res.data;
                                                            if(json.re==1) {
                                                                var order=json.data;
                                                                //TODO:popup a custom message
                                                                toaster.pop({
                                                                    type:'black',
                                                                    title:"信息",
                                                                    body:msg,
                                                                    timeout:0,
                                                                    showCloseButton: true,
                                                                    onHideCallback: function () {
                                                                        if($rootScope.access_token!==undefined&&$rootScope.access_token!==null)
                                                                        {
                                                                            if(orderType==1)
                                                                                $state.go('car_order_prices',{order:JSON.stringify(order)});
                                                                            else
                                                                            {
                                                                                $rootScope.lifeInsuranceOrder=order;
                                                                                $state.go('life_plan',{order:JSON.stringify(order)});
                                                                            }
                                                                        }
                                                                        else{
                                                                            $rootScope.getAccessToken().then(function (json) {
                                                                                if(json.re==1)
                                                                                {
                                                                                    if(orderType==1)
                                                                                        $state.go('car_order_prices',{order:JSON.stringify(order)});
                                                                                    else
                                                                                    {
                                                                                        $rootScope.lifeInsuranceOrder=order;
                                                                                        $state.go('life_plan',{order:JSON.stringify(order)});
                                                                                    }
                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                });

                                                            }
                                                        });


                                                        //TODO:播放录音
                                                        var filepath=fileSystem+'temp.mp3';
                                                        filepath = filepath.replace('file://','');
                                                        var media = $cordovaMedia.newMedia(filepath);

                                                        if(ionic.Platform.isIOS()) {
                                                        }else if(ionic.Platform.isAndroid()) {
                                                        //    alert('play media');
                                                            media.play();
                                                        }else{}
                                                        console.log('tts speach generate success');
                                                    }, function (err) {
                                                        console.log('err=========================');
                                                        var str='';
                                                        for(var field in err)
                                                            str+=field+':'+'\r\n'+err[field];
                                                        console.log('error=' + str);
                                                    }, function (progress) {

                                                    });

                                            }
                                        })
                                    }else{
                                        var myPopup = $ionicPopup.alert({
                                            template: json.data,
                                            title: '错误'
                                        });
                                    }
                                });


                                break;
                        }


                        break;
                    default:

                        break;
                }

            }catch(e)
            {
                alert(e);
            }
        };


        $rootScope.waitConfirms=[
          {
            orderNum:'S0001',candidates:[
            {unitName:'汽修厂1',mobile:'18253161616'},
            {unitName:'汽修厂2',mobile:'18253161717'},
            {unitName:'汽修厂3',mobile:'18253161818'}
          ]}
        ];

        //notification初始化
        $rootScope.notifications={0:[],1:[],2:[]};

        $rootScope.car_orders_tabIndex=1;

        //获取自定义消息的回调
        $rootScope.onReceiveMessage = function(event) {
          try{
              console.log('message receiving......');
              var message=null;
              if(device.platform == "Android") {
                message = event.message;
              } else {
                message = event.content;
              }

              if(Object.prototype.toString.call(message)!='[object Object]')
              {
                message = JSON.parse(message);

              }else{}


            if(message.type!=undefined&&message.type!=null){
             //   alert('type='+message.type);
              switch(message.type){

                  case 'from-background':

                      var orderState=message.orderState;
                      switch (orderState) {
                          case 3:
                              //报价完成
                              var orderId=message.orderId;
                              var orderNum=message.orderNum;
                              var orderType=message.orderType;
                              var date=message.date;
                              var msg=null;
                              if(orderType==1)
                              {
                                  msg='订单号为'+orderNum+'的车险订单已报价完成\r\n'+'是否现在进入车险订单页面查看';
                                  $rootScope.flags.carOrders.onFresh=true;
                              }
                              else if(orderType==2)
                              {
                                  msg='订单号为'+orderNum+'的寿险订单已报价完成\r\n'+'是否现在进入寿险订单页面查看';
                                  $rootScope.flags.lifeOrders.onFresh=true;
                              }


                              $http({
                                  method: "POST",
                                  url: Proxy.local() + "/svr/request",
                                  headers: {
                                      'Authorization': "Bearer " + $rootScope.access_token
                                  },
                                  data: {
                                      request: 'createNotification',
                                      info: {
                                          type: orderType==1?'car':'life',
                                          ownerId: orderId,
                                          content: content,
                                          notyTime: new Date(),
                                          side: 'customer',
                                          subType:orderType
                                      }
                                  }
                              }).then(function (res) {
                                  var json = res.data;
                                  if (json.re == 1) {

                                      //TODO:popup a custom message
                                      toaster.pop({
                                          type:'black',
                                          title:"信息",
                                          body:msg,
                                          timeout:0,
                                          showCloseButton: true,
                                          onHideCallback: function () {
                                              $state.go('notification');
                                          }
                                      });

                                  }
                              }).catch(function (err) {
                                  var str='';
                                  for(var field in err)
                                      str+=err[field];
                                  console.error('err=\r\n'+str);
                              })


                              break;
                          default:

                              var tem='';
                              var mobilePhone=null;
                              //仅限于服务订单
                              if(message.mobilePhone!==undefined&&message.mobilePhone!==null)
                                  mobilePhone=message.mobilePhone;
                              else
                                  mobilePhone='';
                              tem='<div>'+message.unitName+ mobilePhone+'</div>'


                              var confirmPopup = $ionicPopup.confirm({
                                  title: '您的订单'+message.order.orderNum,
                                  template:'已经指派工作人员接单'+ tem
                              });

                              confirmPopup.then(function(res) {
                                  if(res) {
                                      console.log('You are sure');
                                      $state.go('service_orders');
                                  } else {
                                      console.log('You are not sure');
                                  }

                              });
                              break;
                      }


                      break;

              }
            }

          }catch(e){
        //    alert('exception=\r\n' + e.toString());
          }
        }


        var onGetRegistradionID = function(data) {
          try {
         //   alert("JPushPlugin:registrationID is " + data);
            if(data!==undefined&&data!==null)
              $rootScope.registrationId=data;
          } catch(exception) {
            alert(exception);
          }
        }

        $rootScope.onGetRegistradionID = function(data) {

          try {
              console.log("JPushPlugin:registrationID is " + data);
          } catch(exception) {
            alert(exception);
          }
        }

        try{
            if(window.cordova)
            {
                if(device.platform == "Android") {}
                else{
                    window.plugins.jPushPlugin.startJPushSDK();
                }
            }

          window.plugins.jPushPlugin.setDebugMode(true);
          window.plugins.jPushPlugin.init();
          window.plugins.jPushPlugin.getRegistrationID(onGetRegistradionID);
          document.addEventListener("jpush.receiveMessage",$rootScope.onReceiveMessage, false);
          document.addEventListener("jpush.receiveNotification", $rootScope.onReceiveNotification, false);
          window.plugins.jPushPlugin.getUserNotificationSettings(function(result) {
            if(result == 0) {
              // 系统设置中已关闭应用推送。
              alert('system has canceled notification');
            } else if(result > 0) {
              // 系统设置中打开了应用推送。
              alert('system has opened notification');
            }
          });
        }catch(e)
        {
          console.error('error=\r\n'+e);
        }


        //try{
        //  window.plugins.jPushPlugin.init();
        //  document.addEventListener("jpush.receiveNotification", onReceiveNotification, false);
        //  window.plugins.jPushPlugin.getRegistrationID($scope.onGetRegistradionID);
        //  document.addEventListener("jpush.receiveMessage", $rootScope.onReceiveMessage, false);
        //  window.plugins.jPushPlugin.setDebugMode(true);
        //}catch(e)
        //{
        //  alert('error=\r\n' + e.toString());
        //}

        // window.plugins.jPushPlugin.setTags(['game']);
        //document.addEventListener("jpush.setTagsWithAlias", onTagsWithAlias, false);

      });

      //双击退出
      $ionicPlatform.registerBackButtonAction(function (e) {
          var history=$ionicHistory.viewHistory();
        //判断处于哪个页面时双击退出

        if ($location.path() == '/login'||history.currentView.stateName=='tabs.dashboard_backup'||history.currentView.stateName=='login') {
          if ($rootScope.backButtonPressedOnceToExit) {
            ionic.Platform.exitApp();
          } else {
            $rootScope.backButtonPressedOnceToExit = true;
            //TODO:delete record in info-person-online
            //TODO:delete record in


            $cordovaToast.showShortTop('再按一次退出系统');
            setTimeout(function () {
              $rootScope.backButtonPressedOnceToExit = false;
            }, 2000);
          }
        }
        else if ($ionicHistory.backView()) {
            //遵从叶子结点的历史记录回退
            switch(history.currentView.stateName)
            {
                case 'car_manage':
                    $ionicNativeTransitions.stateGo('tabs.dashboard_backup', {}, {}, {
                        "type": "slide",
                        "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
                        "duration": 240, // in milliseconds (ms), default 400
                    });
                    break;
                case 'service_orders':
                    $ionicNativeTransitions.stateGo('tabs.my', {}, {}, {
                        "type": "slide",
                        "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
                        "duration": 240, // in milliseconds (ms), default 400
                    });
                    break;
                default:
                    $ionicHistory.goBack();
            }
        } else {
            switch(history.currentView.stateName)
            {
                case 'service_orders':
                    $ionicNativeTransitions.stateGo('tabs.my', {}, {}, {
                        "type": "slide",
                        "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
                        "duration": 240, // in milliseconds (ms), default 400
                    });
                    break;
                default:
                    $rootScope.backButtonPressedOnceToExit = true;
                    $cordovaToast.showShortTop('已无法回退，请点击底部标签页进行切换');
                    setTimeout(function () {
                        $rootScope.backButtonPressedOnceToExit = false;
                    }, 2000);
                    break;
            }
        }
        e.preventDefault();
        return false;
      }, 101);

    })

    .config(function (ionicDatePickerProvider) {
      var datePickerObj = {
        inputDate: new Date(),
        setLabel: 'Set',
        todayLabel: 'Today',
        closeLabel: 'Close',
        mondayFirst: false,
        weeksList: ["S", "M", "T", "W", "T", "F", "S"],
        monthsList: ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
        templateType: 'popup',
        from: new Date(2012, 8, 1),
        to: new Date(2018, 8, 1),
        showTodayButton: true,
        dateFormat: 'dd MMMM yyyy',
        closeOnSelect: false,
      };
      ionicDatePickerProvider.configDatePicker(datePickerObj);
    })

    .config(function($ionicNativeTransitionsProvider){
        $ionicNativeTransitionsProvider.setDefaultOptions({
            duration: 200, // in milliseconds (ms), default 400,
            slowdownfactor: 4, // overlap views (higher number is more) or no overlap (1), default 4
            iosdelay: -1, // ms to wait for the iOS webview to update before animation kicks in, default -1
            androiddelay: -1, // same as above but for Android, default -1
            winphonedelay: -1, // same as above but for Windows Phone, default -1,
            fixedPixelsTop: 0, // the number of pixels of your fixed header, default 0 (iOS and Android)
            fixedPixelsBottom: 0, // the number of pixels of your fixed footer (f.i. a tab bar), default 0 (iOS and Android)
            triggerTransitionEvent: '$ionicView.afterEnter', // internal ionic-native-transitions option
            backInOppositeDirection: true // Takes over default back transition and state back transition to use the opposite direction transition to go back
        });
    })

    .config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {

      // Ionic uses AngularUI Router which uses the concept of states
      // Learn more here: https://github.com/angular-ui/ui-router
      // Set up the various states which the app can be in.
      // Each state's controller can be found in controllers.js

        $ionicConfigProvider.views.transition('no');


      $ionicConfigProvider.platform.ios.tabs.style('standard');
      $ionicConfigProvider.platform.ios.tabs.position('bottom');
      $ionicConfigProvider.platform.android.tabs.style('standard');
      $ionicConfigProvider.platform.android.tabs.position('standard');

      $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
      $ionicConfigProvider.platform.android.navBar.alignTitle('left');

      $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
      $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');

      $ionicConfigProvider.platform.ios.views.transition('ios');
      $ionicConfigProvider.platform.android.views.transition('android');


      $stateProvider

      // setup an abstract state for the tabs directive
          .state('tabs',{
            url:'/tabs',
            abstract:true,
            templateUrl:'views/tabs/tabs.html'
          })

          .state('tabs.dashboard',{
            cache:false,
            url:'/dashboard/:params',
            views:{
              'dashboard-tab':{
                controller:'dashboardController',
                templateUrl:'views/dashboard/dashboard.html'
              }
            }
          })

          .state('tabs.my',{
              cache:false,
              url:'/my',
              views:{
                  'my-tab':{
                      controller:'myController',
                      templateUrl:'views/my/my.html'
                  }
              }
          })

          .state('tabs.handpicked_product',{
              url:'/handpicked_product',
              views:{
                  'handpicked_product-tab':{
                      controller:'handpickedProductController',
                      templateUrl:'views/handpicked_product/handpicked_product.html'
                  }
              }
          })

          .state('tabs.chatter', {
            url: '/chatter',
            views: {
              'chatter-tab': {
                controller: 'chatterController',
                templateUrl: 'views/chatter/chatter.html'
              }
            }
          })



          .state('login',{
              cache:false,
              url:'/login:params',
              controller: 'loginController',
              templateUrl:'views/login/login.html'
          })

          .state('dashboard',{
              url:'/dashboard',
              controller: 'dashboardController',
              templateUrl:'views/dashboard/dashboard.html'
          })


          .state('register',{
            url:'/register',
            controller: 'registerController',
            templateUrl:'views/registerUser/register.html'
          })

          .state('car_insurance',{
            url:'/car_insurance/:carInfo',
            controller:'carInsuranceController',
            templateUrl:'views/car_insurance/car_insurance.html'
          })


          .state('car_insurance_new',{
              url:'/car_insurance_new',
              controller:'carInsuranceNewController',
              templateUrl:'views/car_insurance_new/car_insurance_new.html'
          })

          .state('orderCluster',{
            url:'/orderCluster',
            controller:'orderClusterController',
            templateUrl:'views/orderCluster/orderCluster.html'
          })


          .state('lifePlanDetail',{
            url:'/life_plan_detail/:plan',
            controller:'lifePlanDetailController',
            templateUrl:'views/life_plan_detail/life_plan_detail.html'
          })

          /**
           * 个人信息=>['修改密码','退出登录']
           */
          .state('myInfo',{
            url:'/myInfo',
            controller:'myInfoController',
            templateUrl:'views/myInfo/myInfo.html'
          })

          .state('passwordModify',{
            url:'/passwordModify',
            controller:'passwordModifyController',
            templateUrl:'views/passwordModify/passwordModify.html'
          })

          .state('passwordForget',{
              url:'/passwordForget',
              controller:'passwordForgetController',
              templateUrl:'views/passwordForget/passwordForget.html'
          })

          .state('car_orders',{
              cache:false,
              url:'/car_orders/:selected',
              controller:'carOrdersController',
              templateUrl:'views/car_orders/car_orders.html'
          })

          .state('service_orders',{
              cache:false,
              url:'/service_orders',
              controller:'serviceOrdersController',
              templateUrl:'views/service_orders/service_orders.html'
          })

          .state('service_order_detail',{
            url:'/service_order_detail/:order',
            controller:'serviceOrderDetailController',
            templateUrl:'views/service_order_detail/service_order_detail.html'
          })

          .state('life_insurance_orders',{
            cache: false,
            url:'/life_insurance_orders/:tabIndex',
            controller:'lifeInsuranceOrdersController',
            templateUrl:'views/life_insurance_orders/life_insurance_orders.html'
          })

          .state('life_plan',{
            cache:false,
            url:'/life_plan/:order',
            controller:'lifePlanController',
            templateUrl:'views/life_plan/life_plan.html'
          })


          .state('integration', {
            url: '/integration',
            controller: 'integrationController',
            templateUrl: 'views/integration/integration.html'
          })

          .state('contact_information', {
            url: '/contact_information',
            controller: 'contact_informationController',
            templateUrl: 'views/contact_information/contact_information.html'
          })

          .state('uploadPhoto', {
            url: '/uploadPhoto',
            controller: 'uploadPhotoController',
            templateUrl: 'views/uploadPhoto/uploadPhoto.html'
          })

          .state('advise_gift',{
            url:'/advise_gift',
            controller:'adviseGiftController',
            templateUrl:'views/advise_gift/advise_gift.html'
          })

          .state('car_manage',{
              cache: false,
              url:'/car_manage:params',
              nativeTransitionsAndroid:{
                  "type": "slide",
                  "direction": "left"
              },
              controller:'carManageController',
              templateUrl:'views/car_manage/car_manage.html'
          })

          .state('bindNewCar',{
            url:'/bindNewCar',
            controller:'bindNewCarController',
            templateUrl:'views/bindNewCar/bindNewCar.html'
          })

          .state('car_order_detail',{
            url:'/car_order_detail/:order',
            controller:'carOrderDetailController',
            templateUrl:'views/car_order_detail/car_order_detail.html'

          })

          .state('life_insurance_product_list',{
            url:'/life_insurance_product_list',
            controller:'lifeInsuranceProductList',
            templateUrl:'views/life_insurance_product_list/life_insurance_product_list.html'
          })

          .state('locate_maintain_nearby',{
            url:'/locate_maintain_nearby/:locate',
            controller:'locateMaintainNearbyController',
            templateUrl:'views/locate_maintain_nearby/locate_maintain_nearby.html'
          })
          .state('locate_airportTransfer_nearby',{
            url:'/locate_airportTransfer_nearby/:locateType',
            controller:'locateAirportTransferNearbyController',
            templateUrl:'views/locate_airportTransfer_nearby/locate_airportTransfer_nearby.html'
          })

          .state('locate_airport_nearby',{
            url:'/locate_airport_nearby/:locateType',
            controller:'locateAirportNearbyController',
            templateUrl:'views/locate_airport_nearby/locate_airport_nearby.html'
          })

          .state('locate_parkCar_nearby',{
            url:'/locate_parkCar_nearby/:locate',
            controller:'locateParkCarNearbyController',
            templateUrl:'views/locate_parkCar_nearby/locate_parkCar_nearby.html'
          })

          .state('locate_paperValidate_nearby',{
            url:'/locate_paperValidate_nearby/:locate',
            controller:'locatePaperValidateNearbyController',
            templateUrl:'views/locate_paperValidate_nearby/locate_paperValidate_nearby.html'
          })

          .state('transclude',{
            url:'/transclude',
            controller:'transcludeController',
            templateUrl:'views/transclude/transclude.html'
          })

          .state('car_order_prices',{
            url:'/car_order_prices/:order',
            controller:'carOrderPricesController',
            templateUrl:'views/car_order_prices/car_order_prices.html'
          })

          .state('service_candidate',{
            url:'/service_candidate',
            controller:'serviceCandidateController',
            templateUrl:'views/service_candidate/service_candidate.html'
          })

          .state('update_car_info',{
            url:'/update_car_info/:carNumInfo',
            controller:'updateCarInfoController',
            templateUrl:'views/update_car_info/update_car_info.html'
          })

          .state('locate_maintain_daily',{
            cache:false,
            url:'/locate_maintain_daily/:locate',
            controller:'locateMaintainDailyController',
            templateUrl:'views/locate_maintain_daily/locate_maintain_daily.html'
          })

          .state('append_car_insuranceder',{
            url:'/append_car_insuranceder/:info',
            controller:'appendCarInsurancederController',
            templateUrl:'views/append_car_insuranceder/append_car_insuranceder.html'
          })


          .state('map_lead_page',{
              url:'/map_lead_page',
              controller:'mapLeadPageController',
              templateUrl:'views/map_lead_page/map_lead_page.html'
            })

          .state('append_life_insurer',{
            url:'/append_life_insurer/:info',
            controller:'appendLifeInsurerController',
            templateUrl:'views/append_life_insurer/append_life_insurer.html'
          })

          .state('append_life_insuranceder',{
            url:'/append_life_insuranceder/:info',
            controller:'appendLifeInsurancederController',
            templateUrl:'views/append_life_insuranceder/append_life_insuranceder.html'
          })

          .state('append_life_benefiter',{
            url:'/append_life_benefiter/:info',
            controller:'appendLifeBenefiterController',
            templateUrl:'views/append_life_benefiter/append_life_benefiter.html'
          })

          .state('car_order_pay',{
              url:'/car_order_pay/:info',
              controller:'carOrderPayController',
              templateUrl:'views/car_order_pay/car_order_pay.html'
          })

          .state('my_menus',{
              url:'/my_menus',
              abstract:true,
              templateUrl:'views/my_menus/my_menus.html',
              controller:'myMenusController'
          })

          .state('my_menus.search', {
              url: '/search',
              views: {
                  'menuContent': {
                      templateUrl: 'views/search/search.html'
                  }
              }
          })

          .state('my_menus.browse', {
              url: '/browse',
              views: {
                  'menuContent': {
                      templateUrl: 'views/browse/browse.html'
                  }
              }
          })

          .state('car_price_detail',{
              url:'/car_price_detail/:info',
              controller:'carPriceDetailController',
              templateUrl:'views/car_price_detail/car_price_detail.html'
          })

          .state('create_new_customerPlace',{
              url:'/create_new_customerPlace',
              controller:'createNewCustomerPlaceController',
              templateUrl:'views/create_new_customerPlace/create_new_customerPlace.html'
          })

          .state('applied_car_order_detail',{
                url:'/applied_car_order_detail/:orderId',
                controller:'appliedCarOrderDetailController',
                templateUrl:'views/applied_car_order_detail/applied_car_order_detail.html'
          })


          .state('my_page',{
                url:'/my_page',
                controller:'myPageController',
                templateUrl:'views/my_page/my_page.html'
          })


          .state('tabs.dashboard_backup',{
              cache:false,
              url:'/dashboard_backup/:params',
              views:{
                  'dashboard-backup-tab':{
                      controller:'dashboardBackUpController',
                      templateUrl:'views/dashboard_backup/dashboard_backup.html'
                  }
              }
          })

          .state('applied_life_order_detail',{
              url:'/applied_life_order_detail:orderId',
              controller:'appliedLifeOrderDetailController',
              templateUrl:'views/applied_life_order_detail/applied_life_order_detail.html'
          })

          .state('car_info_detail',{
              url:'/car_info_detail:carInfo',
              controller:'carInfoDetailController',
              templateUrl:'views/car_info_detail/car_info_detail.html'
          })

          .state('notification',{
              url:'/notification',
              controller:'notificationController',
              templateUrl:'views/notification/notification.html'
          })

          .state('map_search',{
              url:'/map_search:ob',
              controller:'mapSearchController',
              templateUrl:'views/map_search/map_search.html'
          })

          .state('map_daily_confirm',{
              url:'/map_daily_confirm/:contentInfo',
              controller:'mapDailyConfirmController',
              templateUrl:'views/map_daily_confirm/map_daily_confirm.html'
          })

          .state('map_administrate_search',{
            url:'/map_administrate_search:ob',
            controller:'mapAdministrateSearchController',
            templateUrl:'views/map_administrate_search/map_administrate_search.html'
          })

          .state('map_administrate_confirm',{
              cache:false,
              url:'/map_administrate_confirm/:contentInfo',
              controller:'mapAdministrateConfirmController',
              templateUrl:'views/map_administrate_confirm/map_administrate_confirm.html'
          })

          .state('map_paperValidate_search',{
              url:'/map_paperValidate_search:ob',
              controller:'mapPaperValidateSearchController',
              templateUrl:'views/map_paperValidate_search/map_paperValidate_search.html'
          })

          .state('map_paperValidate_confirm',{
              cache:false,
              url:'/map_paperValidate_confirm/:contentInfo',
              controller:'mapPaperValidateConfirmController',
              templateUrl:'views/map_paperValidate_confirm/map_paperValidate_confirm.html'
          })

          .state('map_airport_search',{
              url:'/map_airport_search:ob',
              controller:'mapAirportSearchController',
              templateUrl:'views/map_airport_search/map_airport_search.html'
          })

          .state('map_airport_confirm',{
              cache:false,
              url:'/map_airport_confirm/:contentInfo',
              controller:'mapAirportConfirmController',
              templateUrl:'views/map_airport_confirm/map_airport_confirm.html'
          })

          .state('map_parkCar_search',{
              url:'/map_parkCar_search:ob',
              controller:'mapParkCarSearchController',
              templateUrl:'views/map_parkCar_search/map_parkCar_search.html'
          })

          .state('map_parkCar_confirm',{
              cache:false,
              url:'/map_parkCar_confirm/:contentInfo',
              controller:'mapParkCarConfirmController',
              templateUrl:'views/map_parkCar_confirm/map_parkCar_confirm.html'
          })

          .state('car',{
              cache:false,
              url:'/car',
              controller:'carController',
              templateUrl:'views/car/car.html'
          })

          .state('life',{
              cache:false,
              url:'/life',
              controller:'lifeController',
              templateUrl:'views/life/life.html'
          })

          .state('maintain',{
              url:'/maintain',
              controller:'maintainController',
              templateUrl:'views/maintain/maintain.html'
          })

          .state('carDrivingManage',{
              url:'/carDrivingManage',
              controller:'carDrivingManageController',
              templateUrl:'views/carDrivingManage/carDrivingManage.html'
          })

          .state('evaluate',{
              url:'/evaluate:order',
              controller:'evaluateController',
              templateUrl:'views/evaluate/evaluate.html'
          })


          .state('gaoDeHome',{
              url:'/gaoDeHome',
              controller:'gaoDeHomeController',
              templateUrl:'views/gaoDeHome/gaoDeHome.html'
          })


          .state('gaode_service_select',{
              url:'/gaode_service_select',
              controller:'gaodeServiceSelectController',
              templateUrl:'views/gaode_service_select/gaode_service_select.html'
          })

          .state('map_district_result',{
              url:'/map_district_result:params',
              controller:'mapDistrictResultController',
              templateUrl:'views/map_district_result/map_district_result.html'
          })


          .state('map_administrator_show',{
              url:'/map_administrator_show:params',
              controller:'mapAdministrateShowController',
              templateUrl:'views/map_administrator_show/map_administrator_show.html'
          })


          .state('angular_baidu_map',{
              url:'/angular_baidu_map:params',
              controller:'abmController',
              templateUrl:'views/angular_baidu_map/angular_baidu_map.html'
          })

          .state('select_candidate_servicePerson',{
              url:'/select_candidate_servicePerson:params',
              controller:'selectCandidateServicePersonController',
              templateUrl:'views/select_candidate_servicePerson/select_candidate_servicePerson.html'
          })

          .state('customer_place_select',{
              url:'/customer_place_select',
              controller:'customerPlaceSelectController',
              templateUrl:'views/customer_place_select/customer_place_select.html'
          })

          .state('life_order_pay',{
              url:'/life_order_pay:info',
              controller:'lifeOrderPayController',
              templateUrl:'views/life_order_pay/life_order_pay.html'
          })

          .state('help',{
              url:'/help',
              controller:'helpController',
              templateUrl:'views/help/help.html'
          })

          .state('maintainHome',{
              url:'/maintainHome:params',
              controller:'maintainHomeController',
              templateUrl:'views/maintainHome/maintainHome.html'
          })

          .state('config_app',{
              url:'/config_app:params',
              controller:'configAppController',
              templateUrl:'views/config_app/config_app.html'
          })

          .state('personal_portrait',{
              url:'/personal_portrait:params',
              controller:'personalPortraitController',
              templateUrl:'views/personal_portrait/personal_portrait.html'
          })

          .state('authority_setter',{
              url:'/authority_setter',
              controller:'authoritySetterController',
              templateUrl:'views/authority_setter/authority_setter.html'
          })

        // if none of the above states are matched, use this as the fallback
        //TODO:make auhtority grant modal to be start-up page
        $urlRouterProvider.otherwise('/login');

    })

    .factory('BaiduMapService', function($q, baiduMapApi) {

      return {
        getBMap:function(){
          var deferred=$q.defer();
          baiduMapApi.then(function(BMap) {
            deferred.resolve(BMap);
          });
          return deferred.promise;
        }
      };
    })


    .factory('BMapService', ['$document', '$q', '$rootScope',
        function($document, $q, $rootScope) {
            var map = $q.defer();

            var scriptTag = $document[0].createElement('script');
            scriptTag.type = 'text/javascript';
            scriptTag.async = true;
            window.BMapLoaded=function () {
                map.resolve(window.BMap);
            }
            scriptTag.src = 'http://api.map.baidu.com/api?v=2.0&ak=hxMVpPXqcpdNGMrLTGLxN3mBBKd6YiT6&callback=BMapLoaded';
            var s = $document[0].getElementsByTagName('body')[0];
            s.appendChild(scriptTag);

            return {
                getBMap: function() { return map.promise; }
            };
        }])


    .factory('Proxy', function() {
      var ob={
        local:function(){
          if(window.cordova!==undefined&&window.cordova!==null)
            return 'http://192.168.1.114:3000';
          else
            return "/proxy/node_server";

        },
        remote:function(){
          if(window.cordova!==undefined&&window.cordova!==null)
            return 'http://202.194.14.106:3000';
          else
            return '/proxy/remote';
        }
      }
      return ob;
    })


    .factory('ModalService', function ($ionicModal) {
      var initModal = function ($scope,item) {
        $ionicModal.fromTemplateUrl('views/modal/append_benefiter_modal.html',{
          scope:$scope,
          animation:'slide-in-up'
        }).then(function (modal) {
          item.modal = modal;
        });
      }
      return {
        initModal : initModal
      }
    })

    .directive('textTransform', function() {
        var transformConfig = {
            uppercase: function(input){
                return input.toUpperCase();
            },
            capitalize: function(input){
                return input.replace(
                    /([a-zA-Z])([a-zA-Z]*)/gi,
                    function(matched, $1, $2){
                        return $1.toUpperCase() + $2;
                    });
            },
            lowercase: function(input){
                return input.toLowerCase();
            }
        };
        return {
            require: 'ngModel',
            link: function(scope, element, iAttrs, modelCtrl) {
                var transform = transformConfig[iAttrs.textTransform];
                if(transform){
                    modelCtrl.$parsers.push(function(input) {
                        return transform(input || "");
                    });

                    element.css("text-transform", iAttrs.textTransform);
                }
            }
        };
    })

    .directive('ngMax', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attr, ctrl) {
            scope.$watch(attr.ngMax, function () {
                ctrl.$setViewValue(ctrl.$viewValue);
            });
            var maxValidator = function (value) {
                var max = scope.$eval(attr.ngMax) || Infinity;
                if (!isEmpty(value) && value > max) {
                    ctrl.$setValidity('ngMax', false);
                    return undefined;
                } else {
                    ctrl.$setValidity('ngMax', true);
                    return value;
                }
            };
            ctrl.$parsers.push(maxValidator);
            ctrl.$formatters.push(maxValidator);
        }};
    })

    .directive('contenteditable', function() {//自定义ngModel的属性可以用在div等其他元素中
        return {
            restrict: 'A', // 作为属性使用
            require: '?ngModel', // 此指令所代替的函数
            link: function(scope, element, attrs, ngModel) {
                if (!ngModel) {
                    return;
                } // do nothing if no ng-model
                // Specify how UI should be updated
                ngModel.$render = function() {
                    element.html(ngModel.$viewValue || '');
                };
                // Listen for change events to enable binding
                element.on('blur keyup change', function() {
                    scope.$apply(readViewText);
                });
                // No need to initialize, AngularJS will initialize the text based on ng-model attribute
                // Write data to the model
                function readViewText() {
                    var html = element.html();
                    // When we clear the content editable the browser leaves a <br> behind
                    // If strip-br attribute is provided then we strip this out
                    if (attrs.stripBr && html === '<br>') {
                        html = '';
                    }
                    ngModel.$setViewValue(html);
                }
            }
        };
    })

    .factory('$WebSocket',function($rootScope,$ionicPopup){
          var self=this;

          self.cbs=[];

          self.tmpMsg=null;

          self.msgId=1;

          self.getMsgId=function()
          {
            return self.msgId++;
          }

          self.connect=function(cb){
            self.ws = new window.WebSocket('ws://139.129.96.231:3010');
            self.ws.onopen=self.onopen;
            self.ws.onmessage=self.onmessage;
          }
          self.onopen=function(message) {
            console.log('websocket connection is established');
            self.cbs.map(function(item,i) {
              item(message);
            });
          }
          self.onerr=function(err) {
            console.log('connect error');
          }
          self.onclose=function(event) {
            console.log('websocket shutdown from server' + event.code);
          }
          self.onmessage=function(event) {
              var json=event.data;
              if(Object.prototype.toString.call(json)=='[object String]')
                  json=JSON.parse(json);
              switch (json.type) {
                  case 'ack':
                      if(json.result=='ok')
                      {
                          if(self.tmpMsg!==undefined&&self.tmpMsg!==null)
                          {
                              $rootScope.msg.push(Object.assign({type:'fromMe'},self.tmpMsg));
                              $rootScope.$emit('MSG_NEW');
                          }
                      }else if(json.result=='error')
                      {
                          if(json.reason=='no waiter online')
                          {
                              var myPopup = $ionicPopup.alert({
                                  template: '现在没有可进行咨询的工作人员',
                                  title: '错误'
                              });
                          }
                      }else{}
                      break;
                  case 'notify':
                      console.log('msg come from '+json.from);
                      console.log('msg ='+json.msg);
                      $rootScope.msg.push(Object.assign({type:'fromThem'},json.msg));
                      $rootScope.$emit('MSG_NEW');
                      break;
                  default:
                      break;
              }
          }
          self.login=function (username,password,accessToken) {
              var info= {
                  action:'login',
                  msgid: self.getMsgId(),
                  timems:new Date().getTime(),
                  token:accessToken,
                  username:username,
                  password:password
              };
              if(Object.prototype.toString.call(info)!='[object String')
                  info=JSON.stringify(info);
              self.ws.send(info);
          }
          self.send=function(msg) {
            var info=msg;
            self.tmpMsg=msg;
            if(Object.prototype.toString.call(info)!='[object String')
              info=JSON.stringify(info);
            self.ws.send(info);
          }
          self.registeCallback=function(cb) {
            var flag=false;
            self.cbs.map(function(item,i) {
              if(item==cb)
                flag=true;
            })
            if(!flag)
              self.cbs.push(cb);
          };
          self.unregisteCallback=function(cb) {
            self.cbs.map(function(item,i) {
              if(item==cb)
                self.cbs.slice(i, 1);
            })
          };
          return self;
        })




