/**
 * Created by dingyiming on 2016/12/7.
 */
angular.module('starter')
    .controller('modifyController',function($scope,$state,$stateParams,$ionicActionSheet,
                                            $rootScope,$ionicPopup,$http,Proxy,$ionicModal){

        $scope.go_back=function(){
            window.history.back();
        }


        $scope.serviceTypeMap={
            11:'维修-日常保养',
            12:'维修-故障维修',
            13:'维修-事故维修',
            21:'车驾管-审车',
            22:'车驾管-审证',
            23:'车驾管-接送机',
            24:'车驾管-取送车',
            31:'鈑喷'};

        $scope.maintain={
            tabs:['日常保养','故障维修','事故维修'],
            tab:'日常保养',
            items:{},
            tabIndex:'',
            serviceType:'',
            insuranceder:{}
        };

        $scope.dailys = [
            {subServiceId:'1',subServiceTypes:'机油,机滤',serviceType:'11'},
            {subServiceId:'2',subServiceTypes:'检查制动系统,更换刹车片',serviceType:'11'},
            {subServiceId:'3',subServiceTypes:'雨刷片更换',serviceType:'11'},
            {subServiceId:'4',subServiceTypes:'轮胎更换',serviceType:'11'},
            {subServiceId:'5',subServiceTypes:'燃油添加剂',serviceType:'11'},
            {subServiceId:'6',subServiceTypes:'空气滤清器',serviceType:'11'},
            {subServiceId:'7',subServiceTypes:'检查火花塞',serviceType:'11'},
            {subServiceId:'8',subServiceTypes:'检查驱动皮带',serviceType:'11'},
            {subServiceId:'9',subServiceTypes:'更换空调滤芯',serviceType:'11'},
            {subServiceId:'10',subServiceTypes:'更换蓄电池,防冻液',serviceType:'11'}
        ];

        /**
         * 路由参数初始化
         */
        if($stateParams.params!==undefined&&$stateParams.params!==null&&$stateParams.params!=='')
        {
            var params=JSON.parse($stateParams.params);
            if(params.maintenance!==undefined&&params.maintenance!==null)
                $scope.maintain.maintenance=params.maintenance;
            if(params.tabIndex!==undefined&&params.tabIndex!==null)
                $scope.tabIndex=params.tabIndex;
            if(params.subTabIndex!==undefined&&params.subTabIndex!==null)
                $scope.subTabIndex=params.subTabIndex;
            if(params.type=='carValidate')
            {
                console.log('...');
            }else if(params.type=='paperValidate') {
                console.log('...');
            }
            if(params.location!==undefined&&params.location!==null)
            {
                $location.hash(params.location);
                $anchorScroll();
            }
        }else{
            $scope.subTabIndex=0;
        }


        //维修服务
        $scope.subTab_change=function(i) {
            $scope.subTabIndex=i;

            if($scope.tabIndex==2)
            {
                switch (i) {
                    case 0:
                        $scope.maintain.serviceType=11;
                        break;
                    case 1:
                        $scope.maintain.serviceType=12;
                        break;
                    case 2:
                        $scope.maintain.serviceType=13;
                        break;
                    default :
                        break;
                }
            }
            if($scope.tabIndex==3)
            {
                switch (i) {
                    case 0:
                        $scope.carManage.serviceType=21;
                        break;
                    case 1:
                        $scope.carManage.serviceType=22;
                        break;
                    case 2:
                        $scope.carManage.serviceType=23;
                        break;
                    case 3:
                        $scope.carManage.serviceType=24;
                        break;
                    default :
                        break;
                }
            }

        };


        $scope.miles=0;

        $scope.getMaintainPlan=function(miles){

            var reg=/\D/;
            if(miles==undefined||miles==null||reg.exec(miles)!=null)
            {
                var myPopup = $ionicPopup.alert({
                    template: '您输入的公里数格式有误',
                    title: '<strong style="color:red">错误</strong>'
                });
            }else{
                if(miles<5000||miles>200000){
                    var myPopup = $ionicPopup.alert({
                        template: '请输入5000至200000公里范围内的里程',
                        title: '<strong style="color:red">错误</strong>'
                    });

                }else{
                    var miles= parseInt(miles/5000)*5000;

                    $http({
                        method: "POST",
                        url: Proxy.local()+'/svr/request',
                        headers: {
                            'Authorization': "Bearer " + $rootScope.access_token,
                        },
                        data:
                            {
                                request:'getMaintainPlan',
                                info:{
                                    miles:miles
                                }
                            }
                    }).then(function(res) {
                        var json = res.data;
                        if(json.re==1){
                            $scope.routineName=json.data;
                            $scope.open_maintainPlanModal();
                        }

                    })
                }
            }

        }

        /***  查看保养计划模态框***/
        $ionicModal.fromTemplateUrl('views/modal/maintain_plan_modal.html',{
            scope:  $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.maintain_plan_modal = modal;
        });

        $scope.open_maintainPlanModal= function(){
            $scope.maintain_plan_modal.show();
        };


        $scope.close_maintainPlanModal= function() {
            $scope.maintain_plan_modal.hide();
        };
        /*** 查看保养计划模态框 ***/




        $scope.daily_check=function(item){
            if(item.checked==true)
                item.checked=false;
            else
                item.checked=true;
        }


        $scope.grid_selected_style={padding: '16px',background:'#222',color:'#fff',border:'1px solid','border-right': '0px','border-bottom':'0px'};
        $scope.grid_style={padding: '16px',border:'1px solid','border-right': '0px','border-bottom':'0px'};


        $scope.grid_check=function (index) {
            if($scope.dailys[index].checked!=true)
                $scope.dailys[index].checked=true;
            else
                $scope.dailys[index].checked=false;
        }

        $scope.accident = {};
        $scope.accidant_check=function(type)
        {
            if($scope.accident.type==type)
                $scope.accident.type=null;
            else
                $scope.accident.type=type;
        }

        //维修页面跳转
        $scope.pickMaintainDaily=function(locateType,index) {

            var checkFlag=false;

            if($scope.dailys!==undefined&&$scope.dailys!==null)
            {
                for(var i=0;i<$scope.dailys.length;i++)
                {
                    var daily=$scope.dailys[i];
                    if(daily.checked==true)
                    {
                        checkFlag=true;
                        break;
                    }
                }
            }

            if($scope.subTabIndex==1)
            {
                var threshold=0;
                if($scope.maintain.description.text!==undefined&&$scope.maintain.description.text!==null&&$scope.maintain.description.text!='')
                    threshold++;
                if($scope.maintain.description.audio!==undefined&&$scope.maintain.description.audio!==null)
                    threshold++;
                if($scope.maintain.description.video!==undefined&&$scope.maintain.description.video!==null)
                    threshold++;
                if(threshold==0)
                {
                    $ionicPopup.alert({
                        title: '错误',
                        template: '请填入故障维修信息后再选择维修厂'
                    });
                    return;
                }
            }

            if(checkFlag||$scope.subTabIndex!=0)
            {

                $rootScope.maintain.dailys=$scope.dailys;
                console.log('subTabIndex='+$scope.subTabIndex);
                var serviceType=null;
                var maintain=$scope.maintain;
                switch($scope.subTabIndex){
                    case 0:
                        serviceType='11';
                        var subServiceTypes=[];
                        $scope.dailys.map(function (daily, i) {
                            if (daily.checked == true)
                                subServiceTypes.push(daily.subServiceId);
                        });
                        maintain.serviceType=serviceType;
                        maintain.subServiceTypes=subServiceTypes;
                        maintain.serviceName=$scope.serviceTypeMap[maintain.serviceType];
                        break;
                    case 1:
                        serviceType='12';
                        maintain.serviceType=serviceType;
                        maintain.description=$scope.maintain.description;
                        maintain.serviceName=$scope.serviceTypeMap[maintain.serviceType];
                        break;
                    case 2:
                        serviceType='13';
                        maintain.serviceType=serviceType;
                        maintain.subServiceTypes=$scope.accident.type;
                        console.log('subServiceTypes='+$scope.accident.type);
                        maintain.serviceName=$scope.serviceTypeMap[maintain.serviceType];
                        break;
                    default:
                        break;
                }

                //updated by danding
                $state.go('map_search',
                    {ob:JSON.stringify({carInfo:$scope.carInfo,
                        locateType:locateType,locateIndex:index,maintain:$scope.maintain})});


            }else{
                $ionicPopup.alert({
                    title: '信息',
                    template: '请从服务项目列表中选择一项或几项后再进行维修厂的选择'
                });
            }
        };


        $scope.startCapture=function(){

            if (ionic.Platform.isIOS()) {
                var options = { limit: 3, duration: 15 };
                $cordovaCapture.captureVideo(options).then(function(videoData) {
                    // Success! Video data is here

                    $scope.maintain.description.video=videoData[0].fullPath;
                    alert('whole path=' + $scope.maintain.description.video);
                    var basicPath=cordova.file.applicationStorageDirectory;
                    alert('basic path=' + basicPath);

                    var suffixIndex=videoData[0].fullPath.indexOf(basicPath)+basicPath.length;
                    var filename=videoData[0].fullPath.substring(suffixIndex+1,videoData[0].fullPath.length);
                    alert('filename=' + filename);
                    $scope.videoData=videoData[0];
                }, function(err) {
                    // An error occurred. Show a message to the user
                    var str='';
                    for(var field in err)
                        str+=err[field];
                    console.error('error=\r\n' + str);
                });
            }else if(ionic.Platform.isAndroid()){
                var options = { limit: 1, duration: 15 };
                $cordovaCapture.captureVideo(options).then(function(videoData) {
                    // Success! Video data is here

                    $scope.maintain.description.video=videoData[0].fullPath;
                    alert('whole path=' + $scope.maintain.description.video);
                    var basicPath=cordova.file.applicationStorageDirectory;
                    alert('basic path=' + basicPath);

                    var suffixIndex=videoData[0].fullPath.indexOf(basicPath)+basicPath.length;
                    var filename=videoData[0].fullPath.substring(suffixIndex+1,videoData[0].fullPath.length);
                    alert('filename=' + filename);
                    $scope.videoData=videoData[0];
                }, function(err) {
                    // An error occurred. Show a message to the user
                    var str='';
                    for(var field in err)
                        str+=err[field];
                    console.error('error=\r\n' + str);
                });
            }


        }

        //开始录音
        $scope.startRecord=function(){
            try{

                if (ionic.Platform.isIOS()) {
                    CordovaAudio.startRecordAudio(function(data) {
                        alert('data=\r\n'+data);
                    })
                } else if(ionic.Platform.isAndroid()) {
                    var src = "danding.mp3";
                    var media = $cordovaMedia.newMedia(src);
                    media.startRecord();
                    $scope.media=media;
                }
            }catch(e) {
                alert('error=\r\n'+ e.toString());
            }
        }

        //暂停录音
        $scope.stopRecord=function(){
            //$scope.mediaRec.stopRecord();
            //for(var field in $scope.mediaRec.media) {
            //  alert('field=' + field);
            //  alert('data=\r\n' + $scope.mediaRec.media[field]);
            //}
            try{
                if( ionic.Platform.isIOS()){
                    CordovaAudio.stopRecordAudio(function(success) {
                        $scope.maintain.description.audio=success;
                        alert('url=\r\n' + $scope.maintain.description.audio);

                    })
                }else if(ionic.Platform.isAndroid()){

                    $scope.media.stopRecord();
                    $scope.maintain.description.audio=cordova.file.externalRootDirectory+'danding.mp3';
                }

            }catch(e)
            {
                alert('error=\r\n'+ e.toString());
            }

        }


        $scope.play=function(){
            //$scope.mediaRec.play();
            try{

                if( ionic.Platform.isIOS()){
                    CordovaAudio.playingRecorder(function(success) {
                        alert('success=\r\n'+success);
                    })
                }else if(ionic.Platform.isAndroid()){
                    $scope.media.play();
                }
            }catch(e)
            {
                alert('error=\r\n' + e.toString());
            }
        }




    })