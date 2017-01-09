/**
 * Created by danding on 16/9/6.
 */
angular.module('starter')

    .controller('wsChatController',function($scope,$state,$ionicLoading,$http,
                                           $ionicPopup,$timeout,$rootScope,Proxy,
                                           $WebSocket){


        /********** ws *************/


        $scope.ws={
        };

        $scope.doSend=function(){
            $WebSocket.send({
                action:'msg',
                msgid:$WebSocket.getMsgId(),
                timems:new Date(),
                msg:$scope.ws.text,
                to:{
                    groupid:'presale'
                }
            });
        }

    });
