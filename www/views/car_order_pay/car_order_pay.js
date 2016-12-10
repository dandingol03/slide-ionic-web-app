/**
 * Created by yiming on 16/10/15.
 */
angular.module('starter')

/**
 * 本页面不开启缓存
 */
    .controller('carOrderPayController',function($scope,$state,$http,
                                                    $location,$rootScope,$stateParams,
                                                    Proxy,$ionicModal,$ionicPopup,
                                                $q,$ionicActionSheet,$cordovaImagePicker,$cordovaCamera,
                                                 $cordovaFileTransfer){

        $scope.carInfo={};

        $scope.info=$stateParams.info;
        if($scope.info!==undefined&&$scope.info!==null)
        {
            if(Object.prototype.toString.call($scope.info)=='[object String]')
            {
                $scope.info = JSON.parse($scope.info);
                $scope.order=$scope.info.order;
                $scope.price=$scope.info.price;
            }
        }

        $scope.mail={
        };

        $scope.go_back=function(){
            window.history.back();
        }

        $scope.Mutex=function(item,field,cluster) {
            if(item[field])
            {
                item[field]=false;
            }
            else{
                item[field]=true;
                cluster.map(function(cell,i) {
                    if(cell.address!=item.address)
                        cell[field]=false;
                })
            }
        };



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
                    $scope.attachmentSheild=false;
                }, function (error) {
                    alert("error="+error);
                    $scope.attachmentSheild=false;
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
                $scope.attachmentSheild=false;
            }, function(err) {
                $scope.attachmentSheild=false;
                // error
            });
        };



        //添加附件
        $scope.addAttachment=function(item,field)
        {
            //add attachment flag
            if($scope.attachmentSheild!=true)
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
            }else{}

        }




        /*** show create_new_mailAddress modal ***/
        $ionicModal.fromTemplateUrl('views/modal/create_new_mailAddress.html',{
            scope:  $scope,
            animation: 'slide-in-bottom'
        }).then(function(modal) {
            $scope.new_mailAddress_modal = modal;
        });

        $scope.openMailAddressModal= function(){
            try{
                $scope.new_mailAddress_modal.show();
            }catch(e){
                alert('error=\r\n'+ e.toString());
            }

        };

        $scope.closeMailAddressModal= function() {
            $scope.new_mailAddress_modal.hide();
        };
        /*** show create_new_mailAddress modal ***/


        //获取用户的收件地址
        $http({
            method: "post",
            url: Proxy.local()+"/svr/request",
            headers: {
                'Authorization': "Bearer " + $rootScope.access_token,
            },
            data:
                {
                    request:'getCustomerMailAddresses'
                }
        }).then(function(res) {
            var json=res.data;
            if(json.re==1) {
                $scope.addresses=[];
                json.data.map(function(add,i) {
                   if(i==0)
                   {
                       add.checked=true;
                   }
                   $scope.addresses.push(add);
                });

            }
        }).catch(function(err) {
            console.error('error=\r\n' + err.toString());
        })

        $scope.createMailAddress=function () {
            $http({
                method: "post",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token,
                },
                data: {
                        request:'createMailAddress',
                        info:{
                            address:$scope.mail.address,
                            postcode:$scope.mail.postcode,
                            perName:$scope.mail.perName,
                            phone:$scope.mail.phone
                        }
                    }
            }).then(function (res) {
                var json=res.data;
                if(json.re==1) {
                }
            }).catch(function (err) {
                console.error('error=\r\n' + err.toString());
            })
        }


        $scope.checkCarNeedValidateWhetherOrNot=function () {

            var order=$scope.order;
            var carId=order.carId;
            $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data: {
                    request: 'getCarValidateState',
                    info: {
                        carId:carId
                    }
                }
            }).then(function(res) {
                var json=res.data;
                if(json.re==1) {
                    //不需要验车
                    $scope.applyCarOrderPrice();
                }else if(json.re==2)
                {
                    //TODO:verify carAttachId
                    $http({
                        method: "POST",
                        url: Proxy.local() + "/svr/request",
                        headers: {
                            'Authorization': "Bearer " + $rootScope.access_token
                        },
                        data: {
                            request: 'verifyCarAttachComplete',
                            info: {
                                carId: carId
                            }
                        }
                    }).then(function (res) {
                        var json=res.data;
                        if(json.re==1) {
                            if(json.data==true)
                                $scope.applyCarOrderPrice();
                            else
                            {
                                var confirmPopup = $ionicPopup.confirm({
                                    title:'信息',
                                    template:  '提交订单需要上传验车照片，是否现在上传'
                                });
                                confirmPopup.then(function (res) {
                                    if(res) {
                                        $scope.open_uploadCarAttachModal();
                                    }
                                })
                            }
                        }else{
                            $ionicPopup.alert({
                                title: '信息',
                                template: json.data
                            });
                        }
                    });

                }else{
                    throw new Error('unknow data of json ');
                }
            }).catch(function(err) {
                console.error('err=\r\n' + err.toString());
            })
        }


        /*** bind upload_carAttach_modal***/
        $ionicModal.fromTemplateUrl('views/modal/upload_carAttach_modal.html',{
            scope:  $scope,
            animation: 'animated '+' bounceInUp',
            hideDelay:920
        }).then(function(modal) {
            $scope.upload_carAttach_modal = modal;
        });

        $scope.open_uploadCarAttachModal= function(){
            $scope.upload_carAttach_modal.show();
        };

        $scope.close_uploadCarAttachModal= function() {
            $scope.upload_carAttach_modal.hide();
        };

        /*** bind upload_carAttach_modal ***/

        $scope.uploadCarAttachConfirm=function(){
            if($scope.carInfo.carAttachId1_img!==undefined&&$scope.carInfo.carAttachId1_img!==null
                &&$scope.carInfo.carAttachId2_img!==undefined&&$scope.carInfo.carAttachId2_img!==null
                &&$scope.carInfo.carAttachId3_img!==undefined&&$scope.carInfo.carAttachId3_img!==null
                &&$scope.carInfo.carAttachId4_img!==undefined&&$scope.carInfo.carAttachId4_img!==null
                &&$scope.carInfo.carAttachId5_img!==undefined&&$scope.carInfo.carAttachId5_img!==null
                &&$scope.carInfo.carAttachId6_img!==undefined&&$scope.carInfo.carAttachId6_img!==null
            )
            {

                console.log('path of carAttachId1 =' + $scope.carInfo.carAttachId1_img);
                console.log('path of carAttachId2 =' + $scope.carInfo.carAttachId2_img);
                console.log('path of carAttachId3 =' + $scope.carInfo.carAttachId3_img);
                console.log('path of carAttachId4 =' + $scope.carInfo.carAttachId4_img);
                console.log('path of carAttachId5 =' + $scope.carInfo.carAttachId5_img);
                console.log('path of carAttachId6 =' + $scope.carInfo.carAttachId6_img);


                var order=$scope.order;
                var carId=$scope.order.carId;

                var suffix='';
                var imageType='carPhoto';
                if($scope.carInfo.carAttachId1_img.indexOf('.jpg')!=-1)
                    suffix='jpg';
                else if($scope.carInfo.carAttachId1_img.indexOf('.png')!=-1)
                    suffix='png';
                else{}
                var server=Proxy.local()+'/svr/request?request=uploadPhoto' +
                    '&imageType='+imageType+'&suffix='+suffix+'&filename='+'carAttachId1'+'&carId='+carId;
                var options = {
                    fileKey:'file',
                    headers: {
                        'Authorization': "Bearer " + $rootScope.access_token
                    }
                };


                var carAttachId1=null;
                var carAttachId2=null;
                var carAttachId3=null;
                var carAttachId4=null;
                var carAttachId5=null;
                var carAttachId6=null;

                $cordovaFileTransfer.upload(server, $scope.carInfo.carAttachId1_img, options)
                    .then(function(res) {
                        alert('upload first license success');
                        for(var field in res) {
                            alert('field=' + field + '\r\n' + res[field]);
                        }
                        var su=null
                        if($scope.carInfo.carAttachId1_img.indexOf('.jpg')!=-1)
                            su='jpg';
                        else if($scope.carInfo.carAttachId1_img.indexOf('.png')!=-1)
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
                                        imageType:'carPhoto',
                                        filename:'carAttachId1',
                                        suffix:su,
                                        docType:'I2',
                                        carId:carId
                                    }
                                }
                        });
                    }).then(function(res) {
                    var json=res.data;
                    if(json.re==1) {
                        carAttachId1=json.data;
                        alert('carAttachId1=' + carAttachId1);
                        var su=null;
                        if($scope.carInfo.carAttachId2_img.indexOf('.jpg')!=-1)
                            su='jpg';
                        else if($scope.carInfo.carAttachId2_img.indexOf('.png')!=-1)
                            su='png';
                        server=Proxy.local()+'/svr/request?request=uploadPhoto' +
                            '&imageType='+imageType+'&suffix='+su+'&filename='+'carAttachId2'+'&carId='+carId;
                        return  $cordovaFileTransfer.upload(server, $scope.carInfo.carAttachId2_img, options);
                    }
                }).then(function(res) {
                    alert('second image upload success');
                    var su=null;
                    if($scope.carInfo.carAttachId2_img.indexOf('.jpg')!=-1)
                        su='jpg';
                    else if($scope.carInfo.carAttachId2_img.indexOf('.png')!=-1)
                        su='png';
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
                                    imageType:'carPhoto',
                                    filename:'carAttachId2',
                                    suffix:su,
                                    docType:'I2',
                                    carId:carId
                                }
                            }
                    });
                }).then(function(res) {
                    var json=res.data;
                    if(json.re==1) {
                        carAttachId2=json.data;
                        alert('carAttachId2=' + carAttachId2);
                        var su=null;
                        if($scope.carInfo.carAttachId3_img.indexOf('.jpg')!=-1)
                            su='jpg';
                        else if($scope.carInfo.carAttachId3_img.indexOf('.png')!=-1)
                            su='png';
                        server=Proxy.local()+'/svr/request?request=uploadPhoto' +
                            '&imageType='+imageType+'&suffix='+su+'&filename='+'carAttachId3'+'&carId='+carId;
                        return  $cordovaFileTransfer.upload(server, $scope.carInfo.carAttachId3_img, options);
                    }
                }).then(function(res) {
                    alert('third image upload successfully');
                    var su=null;
                    if($scope.carInfo.carAttachId3_img.indexOf('.jpg')!=-1)
                        su='jpg';
                    else if($scope.carInfo.carAttachId3_img.indexOf('.png')!=-1)
                        su='png';
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
                                    imageType:'carPhoto',
                                    filename:'carAttachId3',
                                    suffix:su,
                                    docType:'I2',
                                    carId:carId
                                }
                            }
                    });
                }).then(function(res) {
                    var json=res.data;
                    if(json.re==1) {
                        carAttachId3=json.data;
                        alert('carAttachId3=' + carAttachId3);
                        var su=null;
                        if($scope.carInfo.carAttachId4_img.indexOf('.jpg')!=-1)
                            su='jpg';
                        else if($scope.carInfo.carAttachId4_img.indexOf('.png')!=-1)
                            su='png';
                        server=Proxy.local()+'/svr/request?request=uploadPhoto' +
                            '&imageType='+imageType+'&suffix='+su+'&filename='+'carAttachId4'+'&carId='+carId;
                        return  $cordovaFileTransfer.upload(server, $scope.carInfo.carAttachId4_img, options);
                    }
                }).then(function(res) {
                    alert('fourth image upload successfully');
                    var su=null;
                    if($scope.carInfo.carAttachId4_img.indexOf('.jpg')!=-1)
                        su='jpg';
                    else if($scope.carInfo.carAttachId4_img.indexOf('.png')!=-1)
                        su='png';
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
                                    imageType:'carPhoto',
                                    filename:'carAttachId4',
                                    suffix:su,
                                    docType:'I2',
                                    carId:carId
                                }
                            }
                    });
                }).then(function(res) {
                    var json=res.data;
                    if(json.re==1) {
                        carAttachId4=json.data;
                        alert('carAttachId4=' + carAttachId4);
                        var su=null;
                        if($scope.carInfo.carAttachId5_img.indexOf('.jpg')!=-1)
                            su='jpg';
                        else if($scope.carInfo.carAttachId5_img.indexOf('.png')!=-1)
                            su='png';
                        server=Proxy.local()+'/svr/request?request=uploadPhoto' +
                            '&imageType='+imageType+'&suffix='+su+'&filename='+'carAttachId5'+'&carId='+carId;
                        return  $cordovaFileTransfer.upload(server, $scope.carInfo.carAttachId5_img, options);
                    }
                }).then(function(res) {
                    alert('fifth image upload successfully');
                    var su=null;
                    if($scope.carInfo.carAttachId5_img.indexOf('.jpg')!=-1)
                        su='jpg';
                    else if($scope.carInfo.carAttachId5_img.indexOf('.png')!=-1)
                        su='png';
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
                                    imageType:'carPhoto',
                                    filename:'carAttachId5',
                                    suffix:su,
                                    docType:'I2',
                                    carId:carId
                                }
                            }
                    });
                }).then(function(res) {
                    var json=res.data;
                    if(json.re==1) {
                        carAttachId5=json.data;
                        alert('carAttachId5=' + carAttachId5);
                        var su=null;
                        if($scope.carInfo.carAttachId6_img.indexOf('.jpg')!=-1)
                            su='jpg';
                        else if($scope.carInfo.carAttachId6_img.indexOf('.png')!=-1)
                            su='png';
                        server=Proxy.local()+'/svr/request?request=uploadPhoto' +
                            '&imageType='+imageType+'&suffix='+su+'&filename='+'carAttachId6'+'&carId='+carId;
                        return  $cordovaFileTransfer.upload(server, $scope.carInfo.carAttachId6_img, options);
                    }
                }).then(function(res) {
                    alert('sixth image upload successfully');
                    var su=null;
                    if($scope.carInfo.carAttachId6_img.indexOf('.jpg')!=-1)
                        su='jpg';
                    else if($scope.carInfo.carAttachId6_img.indexOf('.png')!=-1)
                        su='png';
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
                                    imageType:'carPhoto',
                                    filename:'carAttachId6',
                                    suffix:su,
                                    docType:'I2',
                                    carId:carId
                                }
                            }
                    });
                }).then(function(res) {
                    var json=res.data;
                    if(json.re==1) {
                        carAttachId6=json.data;
                        var ob={
                            carAttachId1:carAttachId1,
                            carAttachId2:carAttachId2,
                            carAttachId3:carAttachId3,
                            carAttachId4:carAttachId4,
                            carAttachId5:carAttachId5,
                            carAttachId6:carAttachId6
                        }
                        return $http({
                            method: "POST",
                            url: Proxy.local()+"/svr/request",
                            headers: {
                                'Authorization': "Bearer " + $rootScope.access_token,
                            },
                            data:
                                {
                                    request:'updateInsuranceCarInfo',
                                    info:{
                                        carId:carId,
                                        ob:ob
                                    }
                                }
                        });
                    }
                }).then(function(res) {
                    $scope.close_uploadCarAttachModal();
                    $scope.applyCarOrderPrice();
                }).catch(function(err) {
                    var str='';
                    for(var field in err) {
                        str+=err[field];
                    }
                    alert('error=\r\n' + str);
                });

            }
            else{
                $ionicPopup.alert({
                    title: '',
                    template: '请同时上传验车照片6面'
                });
            }
        }



        $scope.applyCarOrderPrice=function () {

            var selected_price = $scope.price;
            $http({
                method: "POST",
                url: Proxy.local() + "/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data: {
                    request: 'applyCarOrderPrice',
                    info: {
                        price: selected_price
                    }
                }
            }).then(function (res) {
                var json = res.data;
                if (json.re == 1) {
                    alert("discount="+selected_price.discount);
                    return $http({
                        method: "POST",
                        url: Proxy.local() + "/svr/request",
                        headers: {
                            'Authorization': "Bearer " + $rootScope.access_token
                        },
                        data: {
                            request: 'updateInsuranceCarOrder',
                            info: {
                                orderId:$scope.order.orderId,
                                fields:{
                                    insurerId:31,
                                    companyId:selected_price.companyId,
                                    discount:selected_price.discount,
                                    benefit:selected_price.benefit,
                                    insuranceFeeTotal:selected_price.insuranceFeeTotal,
                                    contractFee:selected_price.contractFee,
                                    commission:selected_price.commission,
                                    score:selected_price.score,
                                    exchangeMoney:selected_price.exchangeMoney,
                                    orderDate:new Date()
                                }
                            }
                        }
                    });

                }
            }).then(function(res) {
                var json=res.data;
                if(json.re==1) {

                    var alertPopup = $ionicPopup.alert({
                        title: '提示',
                        template: '订单已支付完成'
                    });

                    alertPopup.then(function(res) {
                        $state.go('tabs.my');
                    });

                    $rootScope.flags.carOrders.onFresh=true;

                }
            }).catch(function (err) {
                var str = '';
                for (var field in err)
                    str += err[field];
                console.error('erro=\r\n' + str);
            });
        }

        //提交车险方案
        $scope.apply=function() {
            $scope.checkCarNeedValidateWhetherOrNot();
        }


    });

