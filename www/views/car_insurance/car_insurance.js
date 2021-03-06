/**
 * Created by yiming on 16/9/7.
 */
angular.module('starter')

  .controller('carInsuranceController',function($scope,$state,$http,
                                                $rootScope,$ionicActionSheet,
                                                $ionicModal,Proxy,$stateParams,$ionicPopup,
                                                $ionicScrollDelegate,$ionicLoading,$timeout){
    if($stateParams.carInfo!==undefined&&$stateParams.carInfo!==null&&$stateParams.carInfo!=="")
    {
      var carInfo=$stateParams.carInfo;
      if(Object.prototype.toString.call(carInfo)=='[object String]')
        carInfo = JSON.parse(carInfo);
      $scope.carInfo=carInfo;
    }

      $scope.tabIndex=0;

      $scope.setter=function (item,field,val) {

          var product1 = $scope.tabs[$scope.tabIndex].products['车辆损失险'];

          if(item[field]==true){
              item[field]=val;
          }else{
              item[field]=true;
          }

          if(val==false&&item.productId==1)
          {
              for(var proName in $scope.tabs[$scope.tabIndex].products)
              {
                  var product= $scope.tabs[$scope.tabIndex].products[proName];
                  if(product.productId==9||product.productId==10||product.productId==11||product.productId==27
                        ||product.productId==22||product.productId==29||product.productId==23||product.productId==24
                        ||product.productId==25||product.productId==26)
                  {
                      product.checked=false;
                  }
              }
          }

          if(product1.checked==false)
          {
              for(var proName in $scope.tabs[$scope.tabIndex].products)
              {
                  var product= $scope.tabs[$scope.tabIndex].products[proName];
                  if(product.productId==9||product.productId==10||product.productId==11||product.productId==27
                      ||product.productId==22||product.productId==29||product.productId==23||product.productId==24
                      ||product.productId==25||product.productId==26)
                  {
                      product.checked=false;
                  }
              }
          }

      }

      $scope.slideIndexSearch=0;
      $scope.activeSlideSearch = function(index) {
          console.log('...');
          $scope.slideIndexSearch=index;
      };


      $scope.selectedTabStyle={
          display: 'table',width: '100%',height:'100%',position: 'relative',
      'text-align': 'center',border: '1px solid #fff9df','border-bottom':'0px',background:'cadetblue'
      };

      $scope.unSelectedTabStyle={
          display: 'table',width: '100%',height:'100%',
          'text-align': 'center',border: '1px solid rgba(255, 249, 223, 0.32)','border-bottom':'0px',background:'rgba(95, 158, 160, 0.39)'
      }


    //当前页数
    $scope.companyIndex=0;

    $scope.tab_change=function(i) {
      $scope.tabIndex=i;
    };

    $scope. modal_tab_change=function(i) {
      $scope.modalTabIndex=i;
    };


    $scope.company={name:"选择公司"};
    //公司选择
    $scope.selectCompany=function(companyName){

      $scope.company.companyName=companyName;
      $scope.apply();
      $scope.closeCompanyModal();

    }

    $scope.goto=function(url){
        $state.go(url);
    };


    //选择车辆人员责任险模态框

      /*** bind special_tab_modal ***/
        $ionicModal.fromTemplateUrl('views/modal/special_tab_modal.html',{
          scope:  $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.special_tab_modal = modal;
        });

        //待定
        $scope.openSpecialModal= function(){
          $scope.special_tab_modal.show();
        };


        $scope.closeSpecialModal= function() {
          $scope.special_tab_modal.hide();
        };
      /*** bind special_tab_modal ***/





    $scope.toggle=function(item,field,options)
    {
      if(options!==undefined&&options!==null)
      {
      }else{
        if(item[field]==true)
          item[field]=false;
        else
          item[field]=true;
      }
    }

    $scope.go_back=function(){
      window.history.back();
    }


    $scope.actionSheet=function(item,sourceField,acts)
    {
      console.log('...');
      if (item[sourceField] !== undefined && item[sourceField]!== null && item[sourceField].length > 0)
      {
        var buttons=[];
        item[sourceField].map(function(li,i) {
          buttons.push({text: li});
        });
        $ionicActionSheet.show({
          buttons:buttons,
          titleText: '选择你的保额',
          cancelText: 'Cancel',
          buttonClicked: function(index) {
            acts.map(function (act, i) {
              if(act.indexOf('=>')!=-1)
              {
                var dest=act.split('=>')[1];
                var src=act.split('=>')[0];
                item[dest]=item[src][index];
              }
            });
            return true;
          },
          cssClass:'motor_insurance_actionsheet'
        });
      }
      else
      {}
    }






    /**************方案详情模态框*************************/
    $ionicModal.fromTemplateUrl('views/modal/car_detail_modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.car_detail_modal = modal;
    });
    $scope.openModal = function() {
      $scope.car_detail_modal.show();
    };
    $scope.closeModal = function() {
      $scope.car_detail_modal.hide();
    };
    /**************方案详情模态框*************************/


    /**************选择公司模态框*************************/
    $ionicModal.fromTemplateUrl('views/modal/car_company_modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.car_company_modal = modal;
    });
    $scope.openCompanyModal = function() {
        var products=$scope.tabs[$scope.tabIndex].products;
        var selected=[];
        for(var proName in products)
        {
            var product=products[proName];
            if(product.checked==true)
                selected.push(product);
        }
        if(selected.length>0)
        {
            $scope.car_company_modal.show();
        }else{
            var alertPopup = $ionicPopup.alert({
                title: '信息',
                template: '请勾选险种后确认套餐选择'
            });
        }
    };
    $scope.closeCompanyModal = function() {
      $scope.car_company_modal.hide();
        var element = angular.element(document.querySelector("body"));
        element.removeClass('modal-open')
    };
    $scope.$on('$destroy', function() {
        $scope.car_company_modal.remove();
    });
    /**************选择公司模态框*************************/

    /**************选择车险相关人员模态框*************************/
    $ionicModal.fromTemplateUrl('views/modal/append_carOrder_person.html',{
      scope:  $scope,
      animation: 'animated '+' bounceInUp',
      hideDelay:920
    }).then(function(modal) {
      $scope.append_carOrderPerson_modal = modal;
    });

    $scope.open_appendCarOrderModal= function(){
      $scope.append_carOrderPerson_modal.show();
    };

    $scope.close_appendCarOrderModal= function() {
      $scope.append_carOrderPerson_modal.hide();
    };
    /**************选择车险相关人员模态框*************************/


    $scope.getInsuranceMeals=function () {

        $ionicLoading.show({
            template:'<p class="item-icon-left">拉取车险套餐数据...<ion-spinner icon="ios" class="spinner-calm spinner-bigger"/></p>'
        });

        /**
         * 获得险种套餐
         */
        $http({
            method: "POST",
            url: Proxy.local()+"/svr/request",
            headers: {
                'Authorization': "Bearer " + $rootScope.access_token
            },
            data:
                {
                    request:'getCarInsuranceMeals'
                }
        }).then(function(response) {
            var data=response.data;
            var meals=[];
            data.data.map(function(meal,i) {
                var products={};
                meal.products.map(function(product,j) {
                    if(product.isIrrespectable==1)
                        product.irrespective=true;
                    product.checked=true;
                    if(products[product.productName]==undefined||products[product.productName]==null)
                    {
                        products[product.productName]=product;

                    }
                    else
                    {
                        if(products[product.productName].productIds!==undefined&&products[product.productName].productIds!==null)
                        {}else{
                            //新创建productIds和insuranceTypes
                            products[product.productName].productIds=[];
                            products[product.productName].insuranceTypes=[];
                            products[product.productName].productIds.push(products[product.productName].productId);
                            products[product.productName].insuranceTypes.push(products[product.productName].insuranceType);
                        }

                        products[product.productName].productIds.push(product.productId);
                        products[product.productName].insuranceTypes.push(product.insuranceType);
                        //如果有多个默认选中偏选项
                        if(product.preference==1)
                        {
                            products[product.productName].productId=product.productId;
                            products[product.productName].insuranceType=product.insuranceType;
                        }

                    }
                });
                meals.push({mealName:meal.mealName,mealId:meal.mealId,products:products});
            });

            //按照基础\建议\自定义的顺序添加
            $scope.tabs=[{},{},{}];
            meals.map(function (meal,i) {
                if(meal.mealName=='基础套餐')
                    $scope.tabs[0]=meal;
                if(meal.mealName=='建议套餐')
                    $scope.tabs[1]=meal;
                if(meal.mealName=='自定义')
                    $scope.tabs[2]=meal;
            })


            return $http({
                method: "POST",
                url: Proxy.local()+"/svr/request",
                headers: {
                    'Authorization': "Bearer " + $rootScope.access_token
                },
                data:
                    {
                        request:'getInsuranceCompany'
                    }
            });
        }).then(function(res) {
            var data=res.data;
            //选择公司
            $scope.companys=data.data;
            $scope.page_size=6;
            $scope.companyIndex=0;
            $scope.page_companys=[];
            var curIndex=$scope.companyIndex*$scope.page_size;
            var j=0;
            for(var i=curIndex;i<$scope.companys.length;i++)
            {
                if(j<$scope.page_size)
                {
                    $scope.page_companys.push($scope.companys[i]);
                    j++;
                }
                else
                    break;
            }
            $ionicLoading.hide();

        }).catch(function(err) {
            var str='';
            for(var field in err)
                str+=err[field];
            console.log('error=\r\n'+str);
            $ionicLoading.hide();
        });
    }

    $scope.getInsuranceMeals();



    $scope.carorder={
      insuranceder:{}
    }

    $scope.car_insurance={
      insuranceder:{perTypeCode:'I'},
      order:{
        insuranceder:{
        },
      }
    }


    //提交车险意向
    $scope.confirm=function(){
      var products=[];
      var meal = $scope.tabs[$scope.tabIndex];
      for(var productName in meal.products) {
        var product=meal.products[productName];
        if(product.checked==true)
        {
          products.push(product);
        }
      }
      var companys=[];
      $scope.companys.map(function(company,i) {
        if(company.checked==true)
          companys.push(company);
      });

      $http({
        method: "POST",
        url: Proxy.local()+"/svr/request",
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token
        },
        data:
        {
          request:'generateCarInsuranceOrder',
          info:
          {
            products:products,
            companys:companys,
            carId:$scope.carInfo.carId,
            insurancederId:$scope.insuranceder.personId
          }
        }
      }).then(function(res) {
        $scope.closeCompanyModal();
        $scope.close_appendCarOrderModal();
        var json=res.data;
        var orderId=json.data;
        if(orderId!==undefined&&orderId!==null)
        {
          $state.go('car_orders');
        }
      }).catch(function(err) {
        $scope.closeCompanyModal();
        var str='';
        for(var feild in err)
          str+=err[field];
        console.error('error=\r\n' + str);
      });
    }


    $scope.Mutex=function(item,field,cluster) {
      if(item[field])
      {
        item[field]=false;
      }
      else{
        item[field]=true;
        cluster.map(function(cell,i) {
          if(cell.personId!=item.personId)
            cell[field]=false;
        })
      }
    };


    /*** bind append_car_insuranceder_modal 选择被保险人模态框(车险)***/
    $ionicModal.fromTemplateUrl('views/modal/append_car_insuranceder_modal.html',{
      scope:  $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.append_car_insuranceder_modal = modal;
    });

    $scope.open_appendCarInsurancederModal= function(){
      $scope.append_car_insuranceder_modal.show();
    };

    $scope.close_appendCarInsurancederModal= function() {
      $scope.append_car_insuranceder_modal.hide();
    };
    /*** bind append_car_insuranceder_modal ***/

    /*** bind select_relative modal ***/
    $ionicModal.fromTemplateUrl('views/modal/select_car_relative.html',{
      scope:  $scope,
      animation: 'animated '+' bounceInUp',
      hideDelay:920
    }).then(function(modal) {
      $scope.select_relative={
        modal:modal
      }
    });

    $scope.open_selectRelativeModal= function(field){
      $scope.select_relative.modal.show();
      $scope.select_relative.field=field;
    };

    $scope.close_selectRelativeModal= function(cluster) {
      if(cluster!==undefined&&cluster!==null)
      {
        cluster.map(function(singleton,i) {
          if(singleton.checked==true)
          {
            $scope[$scope.select_relative.field]=singleton;
          }
        })
      }
      $scope.select_relative.modal.hide();
    };
    /*** bind select_relative modal ***/


    //拉取相关人员信息
    $scope.fetchRelative=function(field) {
      $http({
        method: "POST",
        url: Proxy.local()+'/svr/request',
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token
        },
        data:
        {
          request:'getRelativePersons'
        }
      }).then(function(res) {
        var json=res.data;
        if(json.re==1) {
          if(json.data!=undefined&&json.data!=null){
            $scope.relatives=json.data;

            $scope.open_selectRelativeModal(field);
          }
        }else{
          $scope.open_selectRelativeModal(field);
        }

      }).catch(function(err) {
        var str='';
        for(var field in err)
          str+=err[field];
        console.error('error=\r\n' + str);
      });
    };

    $scope.ionicPopup=function(title,item,field,cb) {

      var buttons = [];
      if (Object.prototype.toString.call(cb) == '[object Array]') {
        buttons.push({text: '<b>取消</b>', type: 'button-assertive'});
        cb.map(function (item, i) {
          buttons.push({text: item.text, type: 'button-positive', onTap: item.cb});
        });
      } else {
        buttons = [
          {
            text: '<b>取消</b>',
            type: 'button-assertive'
          },
          {
            text: '<b>添加</b>',
            type: 'button-positive',
            onTap: function (e) {
              cb();
              //$scope.open_appendPersonModal();
              //$scope.life_insurance.person.perType=1;
            }
          }
        ];
      }
      var myPopup = $ionicPopup.show({
        template: '可选人员没有,是否进行添加',
        title: '<strong>选择投保人?</strong>',
        subTitle: '',
        scope: $scope,
        buttons: buttons
      });

      myPopup.then(function(res) {
        console.log('...');
      });
    }


    //添加被保险人(车险)
    $scope.append_car_insuranceder=function(props){
      $scope.ionicPopup(props.title,props.item,props.field,$scope.open_appendCarInsurancederModal);

    }
    $scope.ActionSheet= function (options,item,field,addon_field) {
      var buttons = [];
      options.map(function (item, i) {
        buttons.push({text: item});
      });
      $ionicActionSheet.show({
        buttons: buttons,
        titleText: '',
        cancelText: '取消',
        buttonClicked: function (index) {
          item[field] = buttons[index].text;
          if (addon_field !== undefined && addon_field !== null)
            item[addon_field] = (index + 1);
          return true;
        },
        cssClass: 'motor_insurance_actionsheet'
      });
    }

    //选用险种检查车险相关人员
    $scope.apply=function(){

        var companys=[];
        $scope.companys.map(function(company,i) {
            if(company.checked==true)
                companys.push(company);
        });

        var subCompanys = [];

        var carNumPrefix = $scope.carInfo.carNum.substring(0,2);
        var carCity2 = null;
        switch (carNumPrefix) {
            case '鲁A':
                carCity2='济南';
                break;
            case '鲁B':
                carCity2='青岛';
                break;
            case '鲁C':
                carCity2='淄博';
                break;
            case '鲁D':
                carCity2='枣庄';
                break;
            case '鲁E':
                carCity2='东营';
                break;
            case '鲁F':
                carCity2='烟台';
                break;
            case '鲁G':
                carCity2='潍坊';
                break;
            case '鲁H':
                carCity2='济宁';
                break;
            case '鲁J':
                carCity2='泰安';
                break;
            case '鲁K':
                carCity2='威海';
                break;
            case '鲁L':
                carNum='日照';
                break;
            case '鲁M':
                carCity2='滨州';
                break;
            case '鲁N':
                carCity2='德州';
                break;
            case '鲁P':
                carCity2='聊城';
                break;
            case '鲁Q':
                carCity2='临沂';
                break;
            case '鲁R':
                carCity2='菏泽';
                break;
            case '鲁S':
                carCity2='莱芜';
                break;
            default:
                break;
        }


        $http({
            method: "POST",
            url: Proxy.local()+"/svr/request",
            headers: {
                'Authorization': "Bearer " + $rootScope.access_token
            },
            data:
                {
                    request:'getSubInsuranceCompany',
                    info: {
                        companys:companys,
                        carCity: $scope.carInfo.carCity,
                        carNum:$scope.carInfo.carNum,
                        carCity2:carCity2
                    }
                }
        }).then(function(res) {
            var json = res.data;
            if(json.re==1){
                subCompanys = json.data;

                if(subCompanys.length>0) {
                    //TODO:append insuranceder modal
                    //$scope.open_appendCarOrderModal();
                    var products=[];
                    var meal = $scope.tabs[$scope.tabIndex];
                    for(var productName in meal.products) {
                        var product=meal.products[productName];
                        if(product.checked==true)
                        {
                            products.push(product);
                        }
                    }

                    if($rootScope.carOrderModify!=undefined&&$rootScope.carOrderModify!=null){
                        var info={
                            orderId:$rootScope.carOrderModify.orderId,
                            products:products,
                            companys:subCompanys,
                            carId:$rootScope.carOrderModify.carId
                        };
                    }else{
                        var info={
                            products:products,
                            companys:subCompanys,
                            carId:$scope.carInfo.carId
                        };

                    }

                    $scope.closeCompanyModal();
                    $state.go('append_car_insuranceder',{info:JSON.stringify(info)});

                }else{
                    var alertPopup = $ionicPopup.alert({
                        title: '错误',
                        template: '请选择公司后点击确认'
                    });
                }

            }

        })

    }


    //向上滚动
    $scope.scrollUpStep=function () {
        $ionicScrollDelegate.$getByHandle('products_scroll').scrollTop(true);
    }
    //向下滚动
    $scope.scrollDownStep=function () {
        $ionicScrollDelegate.$getByHandle('products_scroll').scrollBottom(true);
    }

    $scope.previou_page=function(){
      var curIndex=($scope.companyIndex-1)*$scope.page_size;
      if(curIndex>=0) {
        $scope.companyIndex--;
        var j=0;
        $scope.page_companys=[];
        for(var i=curIndex;i<$scope.companys.length;i++)
        {
          if(j<$scope.page_size)
          {
            $scope.page_companys.push($scope.companys[i]);
            j++;
          }
          else
            break;
        }
      }
    }

    $scope.next_page=function(){
      var curIndex=($scope.companyIndex+1)*$scope.page_size;
      if(curIndex<$scope.companys.length)
      {
        $scope.companyIndex++;
        var j=0;
        $scope.page_companys=[];
        for(var i=curIndex;i<$scope.companys.length;i++)
        {
          if(j<$scope.page_size)
          {
            $scope.page_companys.push($scope.companys[i]);
            j++;
          }
          else
            break;
        }
      }
    }

    //分页footer
    $scope.pageSpan=5;
    $scope.pages=[0,1,2,3,4];
    //分页按钮选中
    $scope.pageSelect=function (i) {
        $scope.companyIndex=i;
        //页面列表渲染
        var curIndex=($scope.companyIndex)*$scope.page_size;
        if(curIndex>=0) {
            var j=0;
            $scope.page_companys=[];
            for(var k=curIndex;k<$scope.companys.length;k++)
            {
                if(j<$scope.page_size)
                {
                    $scope.page_companys.push($scope.companys[k]);
                    j++;
                }
                else
                    break;
            }
        }


        //页脚渲染
        var capacity= $scope.companys.length;
        var pageSize=$scope.page_size;
        var pageMax=parseInt(capacity/pageSize);
        var remainder=capacity%pageSize;
        if(remainder==0)
        {
            pageMax--;
        }
        else{}

        if(i-2>=0&&i+2<=pageMax)
        {
            $scope.pages=[];
            for(var j=i-2;j<=i+2;j++)
            {
                $scope.pages.push(j);
            }
        }else{}
    }



//提交统一函数
    $scope.upload=function(cmd,item,field){

      var personId=null;
      $http({
        method: "POST",
        url: Proxy.local()+'/svr/request',
        headers: {
          'Authorization': "Bearer " + $rootScope.access_token,
        },
        data:
        {
          request:cmd,
          info:item
        }
      })
        .then(function(res) {

          if(res.data.re==1){
            var json =res.data;
            personId=json.data.personId;
         //   alert('personid='+personId);
            var suffix='';
            var imageType='perIdCard';
         //   alert('path='+$scope.life_insurance.insurer.perIdCard1_img);
            if($scope.life_insurance.insurer.perIdCard1_img.indexOf('.jpg')!=-1)
              suffix='jpg';
            else if($scope.life_insurance.insurer.perIdCard1_img.indexOf('.png')!=-1)
              suffix='png';
            else{}
            var server=Proxy.local()+'/svr/request?request=uploadPhoto' +
              '&imageType='+imageType+'&suffix='+suffix+
              '&filename='+'perIdCard1_img'+'&personId='+personId;
            var options = {
              fileKey:'file',
              headers: {
                'Authorization': "Bearer " + $rootScope.access_token
              }
            };

            var perIdAttachId1=null;
            var perIdAttachId2=null;

            $cordovaFileTransfer.upload(server, $scope.life_insurance.insurer.perIdCard1_img, options)
              .then(function(res) {
            //    alert('upload perIdCard1 success');
                for(var field in res) {
            //      alert('field=' + field + '\r\n' + res[field]);
                }
                var su=null
                if($scope.life_insurance.insurer.perIdCard1_img.indexOf('.jpg')!=-1)
                  su='jpg';
                else if($scope.life_insurance.insurer.perIdCard1_img.indexOf('.png')!=-1)
                  su='png';
            //    alert('suffix=' + su);
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
                      imageType:'perIdCard',
                      filename:'perIdAttachId1',
                      suffix:su,
                      docType:'I1' ,
                      personId:personId
                    }
                  }
                });
              })
              .then(function(res) {
                var json=res.data;
                if(json.re==1) {
                  perIdAttachId1=json.data;
              //    alert('perIdAttachId1=' + perIdAttachId1);
                  var su=null;
                  if($scope.life_insurance.insurer.perIdCard2_img.indexOf('.jpg')!=-1)
                    su='jpg';
                  else if($scope.life_insurance.insurer.perIdCard2_img.indexOf('.png')!=-1)
                    su='png';
                  server=Proxy.local()+'/svr/request?request=uploadPhoto' +
                    '&imageType='+imageType+'&suffix='+su+'&filename='+'perIdAttachId2'+'&personId='+personId;
                  return  $cordovaFileTransfer.upload(server, $scope.life_insurance.insurer.perIdCard2_img, options)
                    .then(function(res) {
                 //     alert('upload perIdCard2 success');
                      for(var field in res) {
                //        alert('field=' + field + '\r\n' + res[field]);
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
                            imageType:'perIdCard',
                            filename:'perIdAttachId2',
                            suffix:su,
                            docType:'I1' ,
                            personId:personId
                          }
                        }
                      });
                    }) .then(function(res) {
                      var json=res.data;
                      if(json.re==1){
                        perIdAttachId2=json.data;
                        return $http({
                          method: "POST",
                          url: Proxy.local()+"/svr/request",
                          headers: {
                            'Authorization': "Bearer " + $rootScope.access_token,
                          },
                          data:
                          {
                            request:'createInsuranceInfoPersonInfo',
                            info:{
                              perIdAttachId1:perIdAttachId1,
                              perIdAttachId2:perIdAttachId2,
                              personId:personId
                            }
                          }
                        });
                      }
                    }).then(function(res) {
                      var json=res.data;
                      return $http({
                        method: "POST",
                        url: Proxy.local()+"/svr/request",
                        headers: {
                          'Authorization': "Bearer " + $rootScope.access_token,
                        },
                        data:
                        {
                          request:'getInfoPersonInfoByPersonId',
                          info:{
                            personId:personId
                          }
                        }
                      });
                    }).then(function(res) {
                      var json=res.data;
                      if(json.re==1) {
                        $scope.insuranceder=json.data;
                      }
                    })
                }
              })
          }else{}
     //     alert('...it is back')
        }).then(function(res) {

        })
        .catch(function(err) {
          var str='';
          for(var field in err)
            str+=err[field];
          alert('error=\r\n' + str);
        });

    }
  });

