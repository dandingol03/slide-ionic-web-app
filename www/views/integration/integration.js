/**
 * Created by apple-2 on 16/8/23.
 */
angular.module('starter')
  .controller('integrationController',function($scope,$state,$http
                                               ,$rootScope){

    $scope.go_back=function(){
      window.history.back();
    };

    $scope.go_to=function(state){
      $state.go(state);
    };

    //个人信息同步
      $scope.userInfo=$rootScope.userInfo;

    $scope.score_tab=0;

    //返回积分项
    $http({
        method: "POST",
        url: "/proxy/node_server/svr/request",
        headers: {
            'Authorization': "Bearer " + $rootScope.access_token
        },
        data: {
            request:'getScore'
        }
    }).then(function(res) {
        if(res.data!==undefined&&res.data!==null)
        {
            var json=res.data;
            var data=json.data;
            $scope.scoreTotal=data.scoreTotal;
            if(data.carOrder!==undefined&&data.carOrder!==null)
                $scope.carOrders=data.carOrder;
            else
                $scope.carOrders=[];
            if(data.lifeOrder!==undefined&&data.lifeOrder!==null)
            {
                $scope.lifeOrders=data.lifeOrder;
            }
            else
                $scope.lifeOrders=[];
            if(data.serviceOrder!==undefined&&data.serviceOrder!==null)
                $scope.serviceOrders=data.serviceOrder;
        }
        else{}
        return true;
    }).then(function(res) {
        $scope.score_tabs=[$scope.score_total,{}];
    }).catch(function (err) {
        console.log('server fetch error');
    });





    $scope.change_scoreTab=function(i){
      $scope.score_tab=i;
    }

  });
