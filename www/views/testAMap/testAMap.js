/**
 * Created by dingyiming on 2016/12/8.
 */
/**
 * Created by danding on 16/9/6.
 * 山大默认经纬度为117.144816,36.672171
 * 1.$scope.maintain.maintenance,保存选中的维修厂
 */


angular.module('starter')

    .controller('testAMapController',function($scope,$state,$http,$timeout,$rootScope,
                                              BaiduMapService,$cordovaGeolocation,$ionicModal,
                                              Proxy,$stateParams, $q,$ionicLoading) {


        var init = function(){

            var map = new AMap.Map('container', {
                center:[117.000923,36.675807],
                zoom:11
            });

        }




    })