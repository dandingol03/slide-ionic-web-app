/**
 * Created by danding on 16/9/6.
 */
angular.module('starter')

  .controller('chatterController',function($scope,$http,$rootScope,$ionicLoading,
                                            $WebSocket,$cordovaMedia,$cordovaFileTransfer,
                                            Proxy,$cordovaFile,$q){

      $scope.ws={
      };

      $scope.sendStyle = {color: '#222'};
      $scope.unSendStyle = {color: '#888'};

      $scope.user=  $rootScope.user.personInfo;

      $scope.doSend=function(){

          if($scope.ws.text!==undefined&&$scope.ws.text!==null&&$scope.ws.text!='') {
              $WebSocket.send({
                  action:'msg',
                  msgid:$WebSocket.getMsgId(),
                  timems:new Date().getTime(),
                  msg:{
                      type:'plain',
                      content:$scope.ws.text
                  },
                  to:{
                      userid: 14,
                      groupid:'presale'
                  }
              });
              $scope.ws.text=null;
          }
      }


      $scope.playWav=function (path) {

         if(ionic.Platform.isAndroid()){
             var fileSystem=cordova.file.externalRootDirectory;
             var relativePath = path.replace(fileSystem, '');
             var media = $cordovaMedia.newMedia(relativePath);
             media.play();
          }else{}
      }

      $scope.doSendWav=function (attachId) {

          if($scope.audio.startTime!==undefined&&$scope.audio.startTime!==null&&$scope.audio.endTime!==null&&$scope.audio.endTime!==undefined)
          {

              alert('audio length='+(($scope.audio.endTime-$scope.audio.startTime)/1000).toFixed(2));

              var msg={
                  action:'msg',
                  msgid:$WebSocket.getMsgId(),
                  timems:new Date().getTime(),
                  msg:{
                      type:'audio',
                      content:attachId,
                      audioLength:(($scope.audio.endTime-$scope.audio.startTime)/1000).toFixed(2),
                      path: $scope.audio.path
                  },
                  to:{
                      userid: 14,
                      groupid:'presale'
                  }
              };
              $WebSocket.send(msg);
          }


      }

      //TODO:manage the message from back-end and customer

      $scope.messages=$rootScope.msg;

      $rootScope.$on('MSG_NEW', function() {
          $scope.$apply(function () {
              $scope.messages=$rootScope.msg;
          })
      });

      $scope.mode='plain';

      $scope.speechSwitch=function () {
            if($scope.mode=='plain')
                $scope.mode='audio';
            else
                $scope.mode='plain';
      }

      $scope.audio={
          mode:'stoped'
      };



      //上传聊天录音文件
      $scope.uploadAudioChat=function () {
          var server=Proxy.local()+'/svr/request?' +
              'request=uploadAudioChat';
          var options = {
              fileKey:'file',
              headers: {
                  'Authorization': "Bearer " + $rootScope.access_token
              }
          };

          $cordovaFileTransfer.upload(server, $scope.audio.path, options).then(function(res) {
              var json=res.response;
              if(Object.prototype.toString.call(json)=='[object String]')
                  json=JSON.parse(json);
              if(json.re==1) {
                  $scope.doSendWav(parseInt(json.data));
              }
              else{
                  var alertPopup = $ionicPopup.alert({
                      title: '错误',
                      template: '语音消息发送失败'
                  });
              }
          });
      }


      $scope.getChatAudioFileNum=function () {
          var deferred=$q.defer();
          $cordovaFile.checkDir(cordova.file.externalRootDirectory, "chat")
              .then(function (data) {
                  window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory+'chat',
                      function (fileSystem) {
                          var maxNum=0;
                          var audioExist=false;
                          var reader = fileSystem.createReader();
                          reader.readEntries(
                              function (entries) {

                                  entries.map(function (entry, i) {
                                      var filename=entry.name;
                                      var isFile=entry.isFile;
                                      if(isFile==true)
                                      {
                                          var reg=/(.*)\.wav$/;
                                          var re=reg.exec(filename);
                                          if(re!=null)
                                          {
                                              var num=re[1];
                                              if(parseInt(num)>maxNum)
                                                  maxNum=parseInt(num);
                                          }
                                          audioExist=true;
                                      }
                                  });

                                  if(audioExist==true)
                                      maxNum++;
                                  alert('maxNum=' + maxNum);
                                  deferred.resolve({re: 1, data: maxNum});
                              },
                              function (err) {
                                  console.log(err);
                              }
                          );

                      }, function (err) {
                          console.log(err);
                      }
                  );
              }, function (error) {
                  alert('there is no such dir');
              });

          return deferred.promise;
      }

      //开始录音
      $scope.startRecord=function () {

          $scope.audio.mode = 'recording';

          try{
              if(window.cordova)
              {
                  if (ionic.Platform.isIOS()) {
                      CordovaAudio.startRecordAudio(function(data) {
                          alert('data=\r\n'+data);
                      })
                  } else if(ionic.Platform.isAndroid()) {

                      var fileSystem=null;
                      fileSystem=cordova.file.externalRootDirectory;

                      $cordovaFile.createDir(fileSystem, "chat", true)
                          .then(function (success) {
                              return {re: 1};
                          }).then(function (json) {
                          if(json.re==1) {

                              $scope.getChatAudioFileNum().then(function (json) {
                                  if(json.re==1) {
                                      var fileNum=json.data;
                                      //TODO:检查本地chat路径下的文件，然后命名并赋值到消息中
                                      var src=null;
                                      if(cordova.file!==undefined&&cordova.file!==null)
                                      {
                                          src='chat/'+fileNum+'.wav';
                                      }else{
                                          //src='/storage/emulated/0/danding.mp3';
                                          src='chat/'+fileNum+'.wav';
                                      }
                                      var media = $cordovaMedia.newMedia(src);
                                      media.startRecord();
                                      $scope.audio.startTime=new Date();
                                      $scope.media=media;
                                      $scope.audio.path=cordova.file.externalRootDirectory+'chat/'+fileNum+'.wav';
                                      alert('path=' + $scope.audio.path);
                                  }
                              })

                          }
                      });
                  }else{}
              }
          }catch(e) {
              alert('error=\r\n'+ e.toString());
          }
      }

      //停止录音
      $scope.stopRecord=function () {

          $scope.audio.mode = 'stoped';
          try{

              if(window.cordova)
              {
                  if( ionic.Platform.isIOS()){
                      CordovaAudio.stopRecordAudio(function(success) {
                          $scope.audio.path=success;
                          alert('url=\r\n' + $scope.audio.path);
                          $scope.isRecording=false;
                      })
                  }else if(ionic.Platform.isAndroid()){
                      if($scope.isRecording==false) {
                      }else{
                          $scope.media.stopRecord();
                          $scope.audio.endTime=new Date();
                          $scope.uploadAudioChat();
                      }
                  }else{}
              }
          }catch(e)
          {
              alert('error=\r\n'+ e.toString());
          }
      }

      $scope.mutexRecord=function () {
          if( $scope.audio.mode=='stoped')
          {
              $scope.startRecord();
          }else{
              $scope.stopRecord();
          }
      }


  });
