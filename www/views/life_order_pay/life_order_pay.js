/**
 * Created by dingyiming on 2016/12/26.
 */
angular.module('starter')
    .controller('lifeOrderPayController',function($scope,$rootScope,$state,$http,
                                                    $location,$ionicModal,$ionicActionSheet,
                                                    $cordovaCamera,$cordovaImagePicker,$stateParams,
                                                    $ionicSlideBoxDelegate,$ionicPopup,Proxy,$cordovaFileTransfer){


        $scope.info=$stateParams.info;

        if(Object.prototype.toString.call($scope.info)=='[object String]')
            $scope.info=JSON.parse($scope.info);

        $scope.planIds = $scope.info.planIds;
        $scope.insurerId = $scope.info.insurerId;
        $scope.orderId = $scope.info.orderId;

        $scope.insurer = {};

        $scope.go_back=function(){
            $rootScope.dashboard.tabIndex=1;
            window.history.back();
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


        $scope.upload=function(){

            if($scope.insurer.creditCard1_img!==undefined&&$scope.insurer.creditCard1_img!==null)
            {
                if($scope.insurer.creditCard1_img!==undefined&&$scope.insurer.creditCard1_img!==null)
                {

                    var personId=null;
                    var orderId = null;

                    personId = $scope.insurerId;
                    orderId = $scope.orderId;

                    alert('orderId ='+orderId);

                    var suffix='';
                    var imageType='creditCard';
                    if($scope.insurer.creditCard1_img.indexOf('.jpg')!=-1)
                        suffix='jpg';
                    else if($scope.insurer.creditCard1_img.indexOf('.png')!=-1)
                        suffix='png';
                    else{}

                    var server=Proxy.local()+'/svr/request?request=uploadPhoto' +
                        '&imageType='+imageType+'&suffix='+suffix+
                        '&filename='+'creditCard1_img'+'&orderId='+orderId;

                    alert('server ='+server);

                    var options = {
                        fileKey:'file',
                        headers: {
                            'Authorization': "Bearer " + $rootScope.access_token
                        }
                    };

                    var creditCardAttachId1=null;
                    var creditCardAttachId2=null;

                            $cordovaFileTransfer.upload(server, $scope.insurer.creditCard1_img, options)
                                .then(function(res) {
                                    alert('upload creditCard1_img success');
                                    for(var field in res) {
                                        alert('field=' + field + '\r\n' + res[field]);
                                    }
                                    var su=null
                                    if($scope.insurer.creditCard1_img.indexOf('.jpg')!=-1)
                                        su='jpg';
                                    else if($scope.insurer.creditCard1_img.indexOf('.png')!=-1)
                                        su='png';
                                    alert('suffix=' + su);
                                    return $http({
                                        method: "POST",
                                        url: Proxy.local()+"/svr/request",
                                        headers: {
                                            'Authorization': "Bearer " + $rootScope.access_token,
                                        },
                                        data:
                                            {
                                                request:'createPhotoAttachment',
                                                info:{
                                                    imageType:'creditCard',
                                                    filename:'creditCardAttachId1',
                                                    suffix:su,
                                                    docType:'I5' ,
                                                    personId:personId,
                                                    orderId:orderId
                                                }
                                            }
                                    });
                                })
                                .then(function(res) {
                                    var json=res.data;
                                    if(json.re==1) {
                                        creditCardAttachId1=json.data;
                                        alert('creditCardAttachId1=' + creditCardAttachId1);
                                        var su=null;
                                        if($scope.insurer.creditCard2_img.indexOf('.jpg')!=-1)
                                            su='jpg';
                                        else if($scope.insurer.creditCard2_img.indexOf('.png')!=-1)
                                            su='png';
                                        server=Proxy.local()+'/svr/request?request=uploadPhoto' +
                                            '&imageType='+imageType+'&suffix='+su+'&filename='+'creditCardAttachId2'+'&orderId='+orderId;
                                        return  $cordovaFileTransfer.upload(server, $scope.insurer.creditCard2_img, options)
                                            .then(function(res) {
                                                alert('upload creditCard2_img success');
                                                for(var field in res) {
                                                    alert('field=' + field + '\r\n' + res[field]);
                                                }
                                                return $http({
                                                    method: "POST",
                                                    url: Proxy.local()+"/svr/request",
                                                    headers: {
                                                        'Authorization': "Bearer " + $rootScope.access_token,
                                                    },
                                                    data:
                                                        {
                                                            request:'createPhotoAttachment',
                                                            info:{
                                                                imageType:'creditCard',
                                                                filename:'creditCardAttachId2',
                                                                suffix:su,
                                                                docType:'I5' ,
                                                                personId:personId,
                                                                orderId:orderId
                                                            }
                                                        }
                                                });
                                            }) .then(function(res) {
                                                var json=res.data;
                                                if(json.re==1){
                                                    creditCardAttachId2=json.data;
                                                    return $http({
                                                        method: "POST",
                                                        url: Proxy.local()+"/svr/request",
                                                        headers: {
                                                            'Authorization': "Bearer " + $rootScope.access_token,
                                                        },
                                                        data:
                                                            {
                                                                request:'updateLifeOrderBankAttachId',
                                                                info:{
                                                                    bankAttachId1:creditCardAttachId1,
                                                                    bankAttachId2:creditCardAttachId2,
                                                                    planIds:$scope.planIds,
                                                                    orderId:$scope.orderId
                                                                }
                                                            }
                                                    });
                                                }
                                            }).then(function(res) {
                                                var json=res.data;
                                                if(json.re==1){
                                                    alert('上传银行卡成功!');
                                                    $state.go('tabs.my');
                                                }
                                            })
                                    }
                                })
                }
                else{
                    var myPopup = $ionicPopup.alert({
                        template: '请拍入银行卡反面再点击关联',
                        title: '<strong style="color:red">错误</strong>'
                    });
                }
            }
            else{
                var myPopup = $ionicPopup.alert({
                    template: '请拍入银行卡正面再点击关联',
                    title: '<strong style="color:red">错误</strong>'
                });
            }

        }




    });