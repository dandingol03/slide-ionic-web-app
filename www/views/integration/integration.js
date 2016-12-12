/**
 * Created by apple-2 on 16/8/23.
 */
angular.module('starter')
  .controller('integrationController',function($scope,$state,$http
                                               ,$rootScope,$ionicLoading,$ionicPopup){

    $scope.go_back=function(){
      window.history.back();
    };

    $scope.go_to=function(state){
      $state.go(state);
    };

      //个人信息同步
      $scope.userInfo=$rootScope.userInfo;

      $scope.score_tab=0;

      $scope.feeAccounts={0:[],1:[]};

      $scope.fetchPersonalScore=function () {
          $ionicLoading.show({
              template:'<p class="item-icon-left">Loading...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
          });

          $http({
              method: "POST",
              url: "/proxy/node_server/svr/request",
              headers: {
                  'Authorization': "Bearer " + $rootScope.access_token
              },
              data: {
                  request:'fetchScoreBalance'
              }
          }).then(function (res) {
              var json=res.data;
              if(json.re==1) {
                  json.data.map(function (item,i) {
                      if(item.feeType==3)
                      {
                          $scope.feeAccounts[1].push(item);
                      }else{
                          $scope.feeAccounts[0].push(item);
                      }
                  });
              }
              $ionicLoading.hide();
          }).catch(function (err) {
              $ionicLoading.hide();
              console.log('server fetch error');
          });

      }

      $scope.fetchPersonalScore();



      //
      // //返回积分项
      // $http({
      //       method: "POST",
      //       url: "/proxy/node_server/svr/request",
      //       headers: {
      //           'Authorization': "Bearer " + $rootScope.access_token
      //       },
      //       data: {
      //           request:'getScore'
      //       }
      // }).then(function(res) {
      //       if(res.data!==undefined&&res.data!==null)
      //       {
      //           var json=res.data;
      //           var data=json.data;
      //           $scope.scoreTotal=data.scoreTotal;
      //           if(data.carOrder!==undefined&&data.carOrder!==null)
      //               $scope.carOrders=data.carOrder;
      //           else
      //               $scope.carOrders=[];
      //           if(data.lifeOrder!==undefined&&data.lifeOrder!==null)
      //           {
      //               $scope.lifeOrders=data.lifeOrder;
      //           }
      //           else
      //               $scope.lifeOrders=[];
      //           if(data.serviceOrder!==undefined&&data.serviceOrder!==null)
      //               $scope.serviceOrders=data.serviceOrder;
      //       }
      //       else{}
      //       return true;
      // }).then(function(res) {
      //       $scope.score_tabs=[$scope.score_total,{}];
      // }).catch(function (err) {
      //       console.log('server fetch error');
      // });
      //
      //



    $scope.change_scoreTab=function(i){
      $scope.score_tab=i;
    }

    $scope.checkIdCard = function(){
        $http({
            method: "POST",
            url: "/proxy/node_server/svr/request",
            headers: {
                'Authorization': "Bearer " + $rootScope.access_token
            },
            data: {
                request:'checkcCustomerIdCard'
            }
        }).then(function(res) {
            var json = res.data;
            if(json.re==1){
                var confirmPopup = $ionicPopup.confirm({
                    title: '我的积分',
                    template: '可以将积分提现，是否现在提取？'
                });
                confirmPopup.then(function(res) {

                })
            }else{
                //上传身份证照片
                alert('请先上传身份证照片！');

            }

        })


    }





  });
