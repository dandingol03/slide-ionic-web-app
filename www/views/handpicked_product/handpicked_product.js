/**
 * Created by dingyiming on 2016/12/12.
 */
angular.module('starter')
    .controller('handpickedProductController',function($scope,$state,$stateParams,
                                          $ionicPopup,$http,Proxy,$ionicLoading,
                                                       $rootScope){


        $scope.tabIndex=0;

        $scope.go_back=function(){
            window.history.back();
        }

        $scope.tab_change=function(i)
        {
            $scope.tabIndex=i;
        }

        $scope.selectedTabStyle=
            {
                display:'inline-block',color:'#fff',width:'20%',float:'left',height:'100%','border': '1px solid','border-color': 'rgb(55, 144, 139)','background-color':'rgb(55, 144, 139)'
            };
        $scope.unSelectedTabStyle=
            {
                display:'inline-block',width:'20%',float:'left',height:'100%','border': '1px solid','border-color': 'rgb(68, 78, 78)'
            };

        $scope.srcArr=['/img/lifeBetter.jpg','/img/waterDrop.jpg'];


        //拉取寿险产品
        $scope.fetchProducts=function () {

            $ionicLoading.show({
                template: '<p class="item-icon-left">拉取寿险产品...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
            });

            $http({
                method: "POST",
                url: Proxy.local() + '/svr/request',
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data: {
                    request: 'fetchLifeProduct'
                }
            }).then(function (res) {
                var json=res.data;
                if(json.re==1) {
                    $scope.products=json.data;
                }
                $ionicLoading.hide();
            }).catch(function (err) {
                var str='';
                for(var field in err)
                    str+=err[field];
                console.error('err=\r\n'+str);
            })

        }

        $scope.fetchProducts();


    })