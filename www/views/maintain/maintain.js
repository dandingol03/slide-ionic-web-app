/**
 * Created by dingyiming on 2016/12/7.
 */
angular.module('starter')
    .controller('maintainController',function($scope,$state,$stateParams,
                                              $ionicModal,$ionicPopup,$rootScope,
                                              $cordovaCapture,$cordovaMedia,$ionicScrollDelegate,
                                                $http, Proxy,$timeout,$interval,$ionicNativeTransitions){


        $scope.goBack=function () {
            $ionicNativeTransitions.stateGo('tabs.dashboard_backup', {}, {}, {
                "type": "slide",
                "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
                "duration": 240, // in milliseconds (ms), default 400
            });
        }

        $scope.tabIndex=0;

        $scope.tabChange=function (i) {
            $scope.tabIndex=i;
        }

        // $ionicPlatform.ready (function () {
        //     $cordovaImagePicker.hasPermission(function (da) {
        //         alert('permission=' + da);
        //     }, function (err) {
        //         alert('err='+err);
        //     });
        // })


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
            {subServiceId:'1',subServiceTypes:'机油,机滤',serviceType:'11',checked:true},
            {subServiceId:'2',subServiceTypes:'检查制动系统,更换刹车片',serviceType:'11',checked:false},
            {subServiceId:'3',subServiceTypes:'雨刷片更换',serviceType:'11',checked:false},
            {subServiceId:'4',subServiceTypes:'轮胎更换',serviceType:'11',checked:false},
            {subServiceId:'5',subServiceTypes:'燃油添加剂',serviceType:'11',checked:false},
            {subServiceId:'6',subServiceTypes:'空气滤清器',serviceType:'11',checked:false},
            {subServiceId:'7',subServiceTypes:'检查火花塞',serviceType:'11',checked:false},
            {subServiceId:'8',subServiceTypes:'检查驱动皮带',serviceType:'11',checked:false},
            {subServiceId:'9',subServiceTypes:'更换空调滤芯',serviceType:'11',checked:false},
            {subServiceId:'10',subServiceTypes:'更换蓄电池,防冻液',serviceType:'11',checked:false}
        ];



        $scope.selectedTabStyle=
            {
                display:'inline-block',color:'#fff',width:'31%',float:'left',height:'100%','border': '1px solid','border-color': '#11c1f3','background-color':'#11c1f3'
            };
        $scope.unSelectedTabStyle=
            {
                display:'inline-block',width:'31%',float:'left',height:'100%','border': '1px solid','border-color': '#11c1f3'
            };

        $scope.textareaFocusClass='card';




        /**
         * $rootScope数据同步
         */
        if($rootScope.dashboard!==undefined&&$rootScope.dashboard!==null)
        {

            $scope.maintain.description=$rootScope.maintain.description;
            if($rootScope.maintain.unit!==undefined&&$rootScope.maintain.unit!==null)
                $scope.maintain.unit=$rootScope.maintain.unit;
            if($rootScope.maintain.dailys!==undefined&&$rootScope.maintain.dailys!==null)
            {
                $scope.dailys=$rootScope.maintain.dailys;

            }
            if($rootScope.maintain.serviceType!==undefined&&$rootScope.maintain.serviceType!==null)
                $scope.maintain.serviceType=$rootScope.maintain.serviceType;

        }else{

        }


        //文本框字数监听
        $scope.descriptionTextChange=function () {
            var text=$scope.maintain.description.text;
            if(text.toString().length>=300)
                $scope.maintain.description.text = $scope.maintain.description.text.toString().substring(0, 300);
        };


        $scope.grid_check=function (index) {
            if($scope.dailys[index].checked!=true)
                $scope.dailys[index].checked=true;
            else
                $scope.dailys[index].checked=false;
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


        //维修页面跳转
        $scope.pickMaintainDaily=function(locateType,index) {

            var checkFlag=false;

            if($scope.dailys!==undefined&&$scope.dailys!==null&&$scope.tabIndex==0)
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

            var threshold=0;
            if($scope.tabIndex==1)
            {
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





            if(checkFlag||$scope.tabIndex!=0)
            {

                $rootScope.maintain.dailys=$scope.dailys;
                console.log('subTabIndex='+$scope.subTabIndex);
                var serviceType=null;
                var maintain=$scope.maintain;
                switch($scope.tabIndex){
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
               // $state.go('map_search',
                 //   {ob:JSON.stringify({locateType:locateType,locateIndex:index,maintain:$scope.maintain})});

                var type=null;
                switch(index)
                {
                    case 0:
                        type='daily';
                        break;
                    case 1:
                        type='breakdown';
                        break;
                    case 2:
                        type='accident';
                        break;
                }
                $state.go('maintainHome',
                    {params:JSON.stringify({type:type,maintain:$scope.maintain})});

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

                //开始录制计时
                $scope.videoSecond=0;
                $scope.videoMinute=0;
                $scope.videoTimer=$interval(function () {
                    $scope.videoSecond++;
                    if($scope.videoSecond<10)
                        $scope.videoSecondStr='0'+$scope.videoSecond;
                    else
                        $scope.videoSecondStr=''+$scope.videoSecond;
                    if($scope.videoSecond==60)
                    {
                        $scope.videoMinute++;
                        if($scope.videoMinute<10)
                            $scope.videoMinuteStr='0'+$scope.videoMinute;
                        else
                            $scope.videoMinuteStr=''+$scope.videoMinute;
                    }
                },1000);

                $cordovaCapture.captureVideo(options).then(function(videoData) {
                    // Success! Video data is here

                    //停止录制计时
                    if($scope.videoTimer!==undefined&&$scope.videoTimer!==null)
                    {
                        $interval.cancel($scope.videoTimer);
                        $scope.videoTimer=null;
                    }
                    $scope.videoSecond=0;
                    $scope.videoMinute=0;

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
                var options = { limit: 1, duration: 30 };
                $cordovaCapture.captureVideo(options).then(function(videoData) {
                    // Success! Video data is here

                    // for(var field in videoData[0])
                    // {
                    //     alert('videoData[0]');
                    //
                    //     alert(field);
                    // }

                    // videoData[0].getFormatData(function (data) {
                    //     alert('MediaFileData.duration'+data.duration);
                    // });


                    $scope.maintain.description.video=videoData[0].fullPath;
                    alert('whole path=' + $scope.maintain.description.video);
                    var basicPath=cordova.file.applicationStorageDirectory;
                    alert('basic path=' + basicPath);

                    var suffixIndex=videoData[0].fullPath.indexOf(basicPath)+basicPath.length;
                    var filename=videoData[0].fullPath.substring(suffixIndex+1,videoData[0].fullPath.length);
                    alert('filename=' + filename);
                    $scope.videoData=videoData[0];

                    function success(result) {
                        // result is the path to the jpeg image on the device
                        $scope.videoThumbnail=result;
                        $scope.$apply();
                        console.log('video thumbnail='+result);
                    }

                    function  error(err) {
                        console.log('create thumbnail encounter error=\r\n'+err);
                    }

                    //TODO:generate a snapshot
                    VideoEditor.createThumbnail(
                        success, // success cb
                        error, // error cb
                        {
                            fileUri:videoData[0].fullPath, // the path to the video on the device
                            outputFileName: 'thumbnail', // the file name for the JPEG image
                            width: 320, // optional, width of the thumbnail
                            height: 480, // optional, height of the thumbnail
                            quality: 40 // optional, quality of the thumbnail (between 1 and 100)
                        }
                    );
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

        $scope.isRecording=false;


        //音幅数组,数组长度7,划分标准为0~0.09=>1,0.1~0.19=>2
        $scope.amplitudeWaves=[1,1,1,1,1,1,10];


        $scope.amplitudeImgMap={
            1:{src:'img/1.png'},
            2:{src:'img/2.png'},
            3:{src:'img/3.png'},
            4:{src:'img/4.png'},
            5:{src:'img/5.png'},
            6:{src:'img/6.png'},
            7:{src:'img/7.png'},
            8:{src:'img/8.png'},
            9:{src:'img/9.png'},
            10:{src:'img/10.png'}
        };


        $scope.audioMinuteStr='00';
        $scope.audioSecondStr='00';

        $scope.startRecord=function(){
            try{

                if(window.cordova)
                {
                    if (ionic.Platform.isIOS()) {
                        CordovaAudio.startRecordAudio(function(data) {
                            alert('data=\r\n'+data);
                        })
                    } else if(ionic.Platform.isAndroid()) {

                        if($scope.isRecording==true)
                        {}else{

                            alert('begin record');
                            //var src = "/danding.mp3";
                            var src=null;
                            if(cordova.file!==undefined&&cordova.file!==null)
                            {
                                src='danding.wav';
                            }else{
                                //src='/storage/emulated/0/danding.mp3';
                                src='danding.wav';
                            }
                            var media = $cordovaMedia.newMedia(src);
                            media.startRecord();

                            //开始计秒的时长
                            if($scope.recordTimer!==undefined&&$scope.recordTimer!==null)
                            {
                                $interval.cancel($scope.recordTimer);
                                $scope.recordTimer=null;
                            }
                            $scope.audioSecond=0;
                            $scope.audioMinute=0;
                            $scope.audioMinuteStr='00';
                            $scope.audioSecondStr='00';
                            $scope.recordTimer=$interval(function () {
                                $scope.audioSecond++;
                                if($scope.audioSecond<10)
                                    $scope.audioSecondStr='0'+$scope.audioSecond;
                                else
                                    $scope.audioSecondStr=''+$scope.audioSecond;
                                if($scope.audioSecond==60)
                                {
                                    $scope.audioMinute++;
                                    if($scope.audioMinute<10)
                                        $scope.audioMinuteStr='0'+$scope.audioMinute;
                                    else
                                        $scope.audioMinuteStr=''+$scope.audioMinute;
                                }
                            },1000);


                            if($scope.amplitudeTimer!==undefined&&$scope.amplitudeTimer!==null)
                            {
                                $interval.cancel($scope.amplitudeTimer);
                                $scope.amplitudeTimer=null;
                            }
                           $scope.amplitudeTimer= $interval(function () {
                               media.getCurrentAmplitudeAudio().then(function (amplitude) {
                                   var amplitudeVal=(parseInt(amplitude*10)%10)+1;
                                   $scope.amplitudeWaves.splice(0,1);
                                   $scope.amplitudeWaves.push(amplitudeVal);
                                   console.log('=====================amplitude  ' + amplitudeVal);
                               });
                            },100);
                            $scope.media_record_start=new Date();
                            $scope.media=media;
                            $scope.isRecording=true;
                        }
                    }else{}
                }
                else{
                    $scope.isRecording=true;
                }
            }catch(e) {
                alert('error=\r\n'+ e.toString());
            }
        }

        $scope.recordFlag='record';


        //暂停录音
        $scope.stopRecord=function(){
            //$scope.mediaRec.stopRecord();
            //for(var field in $scope.mediaRec.media) {
            //  alert('field=' + field);
            //  alert('data=\r\n' + $scope.mediaRec.media[field]);
            //}
            try{

                if(window.cordova)
                {
                    if( ionic.Platform.isIOS()){
                        CordovaAudio.stopRecordAudio(function(success) {
                            $scope.maintain.description.audio=success;
                            alert('url=\r\n' + $scope.maintain.description.audio);
                            $scope.isRecording=false;
                        })
                    }else if(ionic.Platform.isAndroid()){
                        if($scope.isRecording==false) {
                        }else{
                            alert('stop record');
                            $scope.media.stopRecord();

                            if($scope.recordTimer!==undefined&&$scope.recordTimer!==null)
                            {
                                $interval.cancel($scope.recordTimer);
                                $scope.recordTimer=null;
                            }
                            $scope.audioSecond=0;
                            $scope.audioMinute=0;

                            if($scope.amplitudeTimer!==undefined&&$scope.amplitudeTimer!==null)
                            {
                                $interval.cancel($scope.amplitudeTimer);
                                $scope.amplitudeTimer=null;
                            }
                            $scope.media_record_finish=new Date();
                            $timeout(function () {
                                var timeline=($scope.media_record_finish.getTime()-$scope.media_record_start)/1000;
                                alert('time length=' + timeline);
                            });
                            $scope.maintain.description.audio=cordova.file.externalRootDirectory+'danding.wav';
                            $scope.isRecording=false;
                        }
                    }else{}
                }else{
                    $scope.isRecording=false;
                }

            }catch(e)
            {
                alert('error=\r\n'+ e.toString());
            }

        }


        $scope.isRecordingFlag=false;
        $scope.mutexRecord=function () {
            if($scope.isRecordingFlag==false)
            {
                $scope.isRecordingFlag=true;
                $scope.startRecord();
            }else{
                $scope.isRecordingFlag=false;
                $scope.stopRecord();
            }
        }


        $scope.audioPos=0;



        $scope.getADLength=function () {
            $scope.media.getDurationAudio().then(function (data) {
                alert('len='+data);
                $scope.audioLength=data;//ms单位
            });
        }




        $scope.play=function(){
            //$scope.mediaRec.play();
            try{
                $scope.media.media.getCurrentPosition(function (pos) {
                    if(pos>0)
                    {
                        alert('音频仍在播放');
                    }
                    else{
                        if($scope.isRecording==false&&$scope.media!==undefined&&$scope.media!==null)
                        {
                            if( ionic.Platform.isIOS()){
                                CordovaAudio.playingRecorder(function(success) {
                                    alert('success=\r\n'+success);
                                })
                            }else if(ionic.Platform.isAndroid()){
                                $scope.media.play();
                                if($scope.audioLength!==undefined&&$scope.audioLength!==null)
                                {
                                    $scope.audioPos=0;
                                    $interval(function () {
                                        $scope.audioPos++;
                                    },$scope.audioLength/100,100);
                                }

                            }
                        }
                    }
                });

            }catch(e)
            {
                alert('error=\r\n' + e.toString());
            }
        }

        $scope.accident = {};
        $scope.accidant_check=function(type)
        {
            if($scope.accident.type==type)
                $scope.accident.type=null;
            else
                $scope.accident.type=type;
        }

        $scope.scrolldown=function () {
            $ionicScrollDelegate.$getByHandle('maintain').scrollBottom(true);
        }

        $scope.module='text';

        $scope.moduleSelectedStyle={padding: '8px',background: '#00c9ff','border-top-right-radius': '6px',width: '43px'};
        $scope.moduleUnSelectedStyle={padding: '8px',background: '#aaa','border-top-right-radius': '6px',width: '43px'};

        $scope.moduleSelect=function (module) {
            $scope.module=module;
        }

        $scope.moviePlay=function () {
            if(  $scope.maintain.description.video!==undefined&&  $scope.maintain.description.video!==null&&  $scope.maintain.description.video!='')
            {
                var open = cordova.plugins.disusered.open;
                function success() {
                    console.log('Success');
                }

                function error(code) {
                    if (code === 1) {
                        console.log('No file handler found');
                    } else {
                        console.log('Undefined error');
                    }
                }

                var filepath=$scope.maintain.description.video;
                open(filepath, success, error);
            }else{
                var myPopup = $ionicPopup.alert({
                    template: '您还未录制视频，不能进行播放',
                    title: '<strong style="color:red">错误</strong>'
                });
            }
        }

        //维修平铺新界面
        $scope.notFirstRowStyle={height: '120px',width:'100%',position: 'relative','border':'0px'};



    })
