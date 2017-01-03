/**
 * Created by apple-2 on 16/8/23.
 */
angular.module('starter')
  .controller('integrationController',function($scope,$state,$http,$timeout
                                               ,$rootScope,$ionicLoading,$ionicPopup,$ionicModal){

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

      $scope.selectedTabStyle=
          {
              display:'inline-block',color:'#fff',width:'49%',float:'left',height:'100%','border': '1px solid','border-color': '#11c1f3','background-color':'#11c1f3'
          };
      $scope.unSelectedTabStyle=
          {
              display:'inline-block',width:'49%',float:'left',height:'100%','border': '1px solid','border-color': '#11c1f3'
          };

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
                $scope.scoreBalance=json.data;
              }
              $ionicLoading.hide();
          }).catch(function (err) {
              $ionicLoading.hide();
              console.log('server fetch error');
          });

      }

      $scope.fetchPersonalScore();


      $scope.fetchPayInfoHistory=function () {

          $scope.pays={0:[],1:[]};

          $http({
              method: "POST",
              url: "/proxy/node_server/svr/request",
              headers: {
                  'Authorization': "Bearer " + $rootScope.access_token
              },
              data: {
                  request:'fetchInsuranceFeePayInfoHistory'
              }
          }).then(function (res) {
              var json=res.data;
              if(json.re==1) {
                json.data.map(function (pay) {
                    if(pay.feeType!=3)
                        $scope.pays[0].push(pay);
                    else
                        $scope.pays[1].push(pay);
                })

              }else{
                  $timeout(function () {
                      var myPopup = $ionicPopup.alert({
                          template: json.data,
                          title: '错误'
                      });
                  }, 400);
              }
          }).catch(function (err) {
              var str='';
              for(var field in err)
                  str+=err[field];
              console.error('err=\r\n'+str);
          })
      }
      $scope.fetchPayInfoHistory();

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

  });
