/**
 * Created by apple-1 on 2016/10/24.
 */
angular.module('starter')
  .controller('contact_informationController',function($scope,$state,$http,
                                                       $rootScope,$ionicPopup,Proxy){

      //获取个人联系方式
      $http({
          method: "POST",
          url: Proxy.local()+"/svr/request",
          headers: {
              'Authorization': "Bearer " + $rootScope.access_token
          },
          data: {
              request: 'getPersonalContactInfo',
              info:{
                  data:$scope.data
              }
          }
      }).then(function(res) {
          var json=res.data;
          if(json.re==1) {
              $scope.contactInfo=json.data;
          }
      }).catch(function(err) {
          var str='';
          for(var field in err)
            str+=err[field];
          console.error('error=\r\n'+str);
      })

      $scope.validate=function(item,field,pattern) {
          if(pattern!==undefined&&pattern!==null)
          {
              var reg=eval(pattern);
              var re=reg.exec(item[field]);
              if(re!==undefined&&re!==null)
              {
                  item[field+'_error']=false;
              }
              else{
                  item[field+'_error']=true;
              }
          }
      };


    $scope.saveContactInfo=function() {

        var contactInfo=$scope.contactInfo;
        if(contactInfo.mobilePhone_error!=true&&(contactInfo.mobilePhone_error!==undefined||contactInfo.mobilePhone_error!==null)
            &&contactInfo.mobilePhone!=='')
        {
            if(contactInfo.EMAIL_error!=true&&(contactInfo.EMAIL_error==undefined||contactInfo.EMAIL_error!==null)
                &&contactInfo.EMAIL!=='')
            {
                if(contactInfo.perAddress!==undefined&&contactInfo.perAddress!==null&&contactInfo.perAddress!='')
                {
                    $http({
                        method: "POST",
                        url: Proxy.local()+"/svr/request",
                        headers: {
                            'Authorization': "Bearer " + $rootScope.access_token
                        },
                        data: {
                            request: 'saveContactInfo',
                            info:{
                                info:contactInfo
                            }
                        }
                    }).then(function(res) {
                        var json=res.data;
                        if(json.re==1) {

                            var myPopup = $ionicPopup.alert({
                                template: '保存联系方式成功',
                                title: '<strong style="color:red">信息</strong>'
                            });

                        }else {
                            var myPopup = $ionicPopup.alert({
                                template: '保存联系方式错误',
                                title: '<strong style="color:red">错误</strong>'
                            });
                        }
                    })
                }else{
                    var myPopup = $ionicPopup.alert({
                        template: '请填入地址后再点击保存',
                        title: '<strong style="color:red">错误</strong>'
                    });
                }
            }else{
                var myPopup = $ionicPopup.alert({
                    template: '请填入正确的邮箱地址后再点击保存',
                    title: '<strong style="color:red">错误</strong>'
                });
            }
        }else{
            var myPopup = $ionicPopup.alert({
                template: '请填入正确的手机号再点击保存',
                title: '<strong style="color:red">错误</strong>'
            });
        }


    };

    $scope.go_back=function(){
      window.history.back();
    };

    $scope.go_to=function(state){
      $state.go(state);
    };

    $scope.contactions={};
    $scope.contactions=[//应该从服务器取
      {type:'telephone',name:''},
      {type:'email',name:''},
      {type:'address',name:''}
    ];


  })
