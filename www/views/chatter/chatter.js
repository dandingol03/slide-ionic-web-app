/**
 * Created by danding on 16/9/6.
 */
angular.module('starter')

  .controller('chatterController',function($scope,$http,$rootScope,$ionicLoading,$WebSocket){

      $scope.ws={
      };

      $scope.doSend=function(){
          $WebSocket.send({
              action:'msg',
              msgid:$WebSocket.getMsgId(),
              timems:new Date().getTime(),
              msg:$scope.ws.text,
              to:{
                  userid: 14,
                  groupid:'presale'
              }
          });
      }

      //TODO:manage the message from back-end and customer

      $scope.message='there is not so much pain';

      $scope.message1 = 'yeah,maybe u should look at it ';

      $scope.report = {
          id: 1,
          type: 'daily'
      };

  });
