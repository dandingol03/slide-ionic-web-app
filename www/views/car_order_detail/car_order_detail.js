angular.module('starter')

  .controller('carOrderDetailController',function($scope,$state,$http, $location,
                                                  $rootScope,$stateParams,$ionicModal,
                                                  $cordovaFileTransfer,Proxy,$ionicLoading){

      //车险订单  0.报价中;1.已生成;2.待支付
      $scope.order=$stateParams.order;

      if(Object.prototype.toString.call($scope.order)=='[object String]')
        $scope.order=JSON.parse($scope.order);

      $scope.goto=function(url){
          $location.path(url);
      };

      $scope.go_back=function(){
          if($scope.order.orderState==5)
              $rootScope.car_orders_tabIndex=2;
          window.history.back();
      }


      //同步图片,这里暂且不做图片管理
      $scope.syncOrderScreenShoot=function () {

          //如果已经下载该截图
          if($rootScope.flags.screenShoots[$scope.order.orderId]!==undefined&&$rootScope.flags.screenShoots[$scope.order.orderId]!==null)
          {
              $scope.screenShoot=$rootScope.flags.screenShoots[$scope.order.orderId];

          }else{

              //浏览器环境跳过
              if(!window.cordova)
                  return ;

              $ionicLoading.show({
                  template:'<p class="item-icon-left">拉取车险订单数据...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
              });



              //首先获取attachment
              var attachId=$scope.order.insuranceCompanyAttachId;
              $http({
                  method: "POST",
                  url: Proxy.local() + "/svr/request",
                  headers: {
                      'Authorization': "Bearer " + $rootScope.access_token
                  },
                  data: {
                      request: 'getBaseAttachmentUrl',
                      info:{
                          attachId:attachId
                      }
                  }
              }).then(function (res) {
                  var json=res.data;

                  if(json.re==1) {

                      var filePath=json.data;
                      var reg=/.*\.(.*)$/;
                      var suffix=null;
                      if(reg.exec(filePath)!==null&&reg.exec(filePath)[1]!==null)
                        suffix=reg.exec(filePath)[1];

                      var url = Proxy.local() + '/svr/request?request=downloadOrderScreenShoot&filePath='+filePath+
                            'suffix='+suffix;
                      var fileSystem = null;
                      if (ionic.Platform.isIOS()) {
                          $scope.target = 'cdvfile://localhost/persistent/' +$scope.order.orderId+'_screenShoot'+suffix;
                      } else if (ionic.Platform.isAndroid()) {
                          fileSystem = cordova.file.externalApplicationStorageDirectory;
                          $scope.target = fileSystem +$scope.order.orderId+'_screenShoot.'+suffix;
                      }

                      var trustHosts = true;
                      var options = {
                          fileKey: 'file',
                          headers: {
                              'Authorization': "Bearer " + $rootScope.access_token
                          }
                      };
                      $cordovaFileTransfer.download(url, $scope.target, options, trustHosts)
                          .then(function (res) {
                              var json = res.response;
                              if (Object.prototype.toString.call(json) == '[object String]')
                                  json = JSON.parse(json);
                              if($scope.portrait!==undefined&&$scope.portrait!==null)
                                  $scope.portrait.path=$scope.target;
                              else
                                  $scope.portrait={
                                      path:$scope.target
                                  }

                              $rootScope.flags.screenShoots[$scope.order.orderId]=$scope.target;
                              $scope.screenShoot=$scope.target;
                              $ionicLoading.hide();
                          }, function (err) {
                              // Error
                              $ionicLoading.hide();
                              $ionicPopup.alert({
                                  title: '失败',
                                  template: '同步报价图例失败'
                              });

                          }, function (progress) {
                              $timeout(function () {
                                  $scope.downloadProgress = (progress.loaded / progress.total) * 100;
                              });
                          });
                  }else{
                      $ionicLoading.hide();
                      alert(json.data);
                  }

              }).catch(function (err) {
                  $ionicLoading.hide();
                  alert(err);
              })
          }

      }



      $scope.syncOrderScreenShoot();



      /*** 图例模态框 ***/
      $ionicModal.fromTemplateUrl('views/modal/order_screenShot_modal.html',{
          scope:  $scope,
          animation: 'animated '+'bounceInUp',
          hideDelay:920
      }).then(function(modal) {
          $scope.order_screenshoot_modal = modal;
      });

      $scope.openOrderScreenShootModal= function(){
          try{
              $scope.order_screenshoot_modal.show();
          }catch(e){
              alert('error=\r\n'+ e.toString());
          }
      };

      $scope.closeOrderScreenShootModal= function() {
          $scope.order_screenshoot_modal.hide();
      };

      $scope.$on('$destroy', function () {
          $scope.order_screenshoot_modal.remove();
      });
      /*** 图例模态框 ***/


  });
