/**
 * Created by apple-2 on 16/8/23.
 */
angular.module('starter')
    .controller('personalPortraitController',function($scope,$state,$http,$rootScope,
                                                      Proxy, $ionicModal,$ionicNativeTransitions,
                                                      $ionicActionSheet,$cordovaCamera,$cordovaImagePicker,
                                                      $stateParams,$ionicLoading,$cordovaFileTransfer,
                                                      $ionicPopup){

        $scope.go_back=function(){
            $ionicNativeTransitions.stateGo('tabs.my', {}, {}, {
                "type": "slide",
                "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
                "duration": 240, // in milliseconds (ms), default 400
            });
        };

        $scope.portrait={
        }


        if($stateParams.params!==undefined&&$stateParams.params!==null)
        {
            var params=$stateParams.params;
            if(params!==undefined&&params!==null&&params!='')
            {
                if(Object.prototype.toString.call(params)=='[object String]')
                    params=JSON.parse(params);
                //同步个人头像路径
                if(params.portrait!==undefined&&params.portrait!==null)
                {
                    $scope.portrait.path=params.portrait;
                }
            }
        }


        //1.附件,通过图库
        $scope.pickImage=function(item,field){
            var options = {
                maximumImagesCount: 1,
                width: 800,
                height: 800,
                quality: 80
            };

            $cordovaImagePicker.getPictures(options)
                .then(function (results) {
                    item[field]=results[0];
                    alert('img url=' + results[0]);
                }, function (error) {
                    alert("error="+error);
                    // error getting photos
                });
        };

        //2.附件,通过照片
        $scope.takePhoto=function(item,field){
            var options = {
                quality: 100,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: false,
                encodingType: Camera.EncodingType.PNG,
                targetWidth: 300,
                targetHeight: 300,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: true,
                correctOrientation:true
            };

            $cordovaCamera.getPicture(options).then(function(imageURI) {
                item[field] = imageURI;
                alert('image url=' + item[field]);
            }, function(err) {
                // error
            });
        };


        $scope.addAttachment=function(item,field)
        {
            $ionicActionSheet.show({
                buttons: [
                    {text:'图库'},
                    {text:'拍照'}
                ],
                cancelText: '关闭',
                cancel: function() {
                    return true;
                },
                buttonClicked: function(index) {

                    switch (index){
                        case 0:
                            $scope.pickImage(item,field);
                            break;
                        case 1:
                            $scope.takePhoto(item,field);
                            break;
                        default:
                            break;
                    }
                    return true;
                }
            });
        }

        $scope.doingPortraitSave=false;
        //保存头像
        $scope.savePortrait=function () {

            if($scope.doingPortraitSave==false)
            {
                if($scope.portrait.path!==undefined&&$scope.portrait.path!==null)
                {
                    $ionicLoading.show({
                        template:'<p class="item-icon-left">Loading...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
                    });

                    var server = Proxy.local() + '/svr/request?request=uploadPortrait';
                    var options = {
                        fileKey: 'file',
                        headers: {
                            'Authorization': "Bearer " + $rootScope.access_token
                        }
                    };

                    $cordovaFileTransfer.upload(server, $scope.portrait.path, options).then(function () {
                        $ionicLoading.hide();
                        $scope.doingPortraitSave=false;
                        var sucPopup = $ionicPopup.alert({
                            template: '头像保存成功',
                            title: '信息'
                        });

                    }).catch(function (err) {
                        var str='';
                        for(var field in err)
                            str+=err[field];
                        console.error('err=\r\n'+str);
                        $scope.doingPortraitSave=false;
                        var errPopup = $ionicPopup.alert({
                            template: '头像保存失败',
                            title: '错误'
                        });
                    })

                }else{
                    var errPopup = $ionicPopup.alert({
                        template: '请先更换头像再选择保存',
                        title: '错误'
                    });
                }
            }


        }


    });
