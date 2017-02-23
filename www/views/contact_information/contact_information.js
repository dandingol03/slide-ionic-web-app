/**
 * Created by apple-1 on 2016/10/24.
 */
angular.module('starter')
  .controller('contact_informationController',function($scope,$state,$http,$ionicModal,
                                                       $rootScope,$ionicPopup,Proxy){

      $scope.tmp={
          ob:{}
      };



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

      $scope.popInput=function (item,field,template,pattern) {

          $scope.openPopInputModal();
          return ;

          var popInput = $ionicPopup.show({
              template: '<input type="text" ng-model="tmp.'+field+'">',
              title: template,
              scope: $scope,
              buttons: [
                  { text: '取消' },
                  {
                      text: '<b>保存</b>',
                      type: 'button-positive',
                      onTap: function(e) {
                          if (!$scope['tmp'][field]) {
                              //don't allow the user to close unless he enters wifi password
                              e.preventDefault();
                          } else {
                              if(pattern!==undefined&&pattern!==null)
                              {
                                      var reg=eval(pattern);
                                      var re=reg.exec($scope['tmp'][field]);
                                      if(re!==undefined&&re!==null)
                                      {
                                          item[field]=$scope['tmp'][field];
                                      }
                                      else{
                                          alert('格式错误');
                                          e.preventDefault();
                                      }

                              }
                          }
                      }
                  }
              ]
          });
      }

      $scope.validate=function(item,field,pattern) {
          if(pattern!==undefined&&pattern!==null)
          {
              if(item[field]!==undefined&&item[field]!==null&&item[field]!='')
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
              }else{
                  item[field+'_error']=undefined;
              }
          }
      };


    $scope.saveContactInfo=function() {

        var contactInfo=$scope.contactInfo;
        if(contactInfo.mobilePhone_error!=true&&(contactInfo.mobilePhone_error==undefined||contactInfo.mobilePhone_error==null))
        {
            if(contactInfo.EMAIL_error!=true&&(contactInfo.EMAIL_error==undefined||contactInfo.EMAIL_error==null))
            {

                if(contactInfo.perIdCard_error!=true&&(contactInfo.perIdCard_error==undefined||contactInfo.perIdCard_error==null))
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
                                    template: '保存个人资料成功',
                                    title: '<strong style="color:red">信息</strong>'
                                });

                            }else {
                                var myPopup = $ionicPopup.alert({
                                    template: '保存个人资料错误',
                                    title: '<strong style="color:red">错误</strong>'
                                });
                            }
                        })

                }else{
                    var myPopup = $ionicPopup.alert({
                        template: '请填入正确的身份证后再点击保存',
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
