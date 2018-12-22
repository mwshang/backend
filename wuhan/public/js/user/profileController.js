'use strict';

myApp.controller('profileController',
  function profileController($rootScope, $scope, $sessionStorage, $location, $http, browser) {
    $scope.isMobile = browser.mobile;
    console.log(browser, $scope.isMobile);

    $scope.user = {
      name : '',
      uid : '',
      isAgent: 0,
      gemNum: 0,
      agentId: ''
    };

    $scope.user.uid = $rootScope.user.uid;
    $scope.user.name = $rootScope.user.name;
    $scope.user.isAgent = $rootScope.user.isAgent;
    $scope.user.gemNum = $rootScope.user.gemNum;
    $scope.user.agentId = $rootScope.user.agentId;

    $scope.oldPwd = $scope.newPwd = $scope.cfmPwd = '';

    $scope.switchTab = function (tab) {
      $scope.msg = '';
      $scope.pwdResult = -1;
      $scope.isChanging = false;
      $scope.showMyInfo = false;
      $scope.showChangeMyPwd = false;

      switch (tab) {
        case 'myInfo':
          $scope.showMyInfo = true;
          $scope.title = '我的信息';
          break;
        case 'changePwd':
          $scope.showChangeMyPwd = true;
          $scope.title = '修改密码';
          break;
      }

      console.log($scope.title);
    };

    $scope.switchTab('myInfo');

    $scope.logout = function() {
      $rootScope.user = null;
      $location.url('/login');
    };

    $scope.changePwd = function () {
      if (hex_md5('asdfghjkl;zxcvbnm,./' + $scope.oldPwd) != $rootScope.user.password) {
        $scope.msg = "旧密码输入错误!";
        return;
      }
      if ($scope.newPwd != $scope.cfmPwd) {
        $scope.msg = "两次输入的密码不一致!";
        return;
      }

      $scope.isChanging = true;
      $http.post("/user/changePwd", {uid: $scope.user.uid, oldpwd: hex_md5('asdfghjkl;zxcvbnm,./' + $scope.oldPwd),
          newpwd: hex_md5('asdfghjkl;zxcvbnm,./' + $scope.newPwd), session:$rootScope.session})
        .success(function(data, status, headers, config){
          //当异步请求成功返回响应时触发
          console.log(data, status);

          if (data.code == 200) {
            $rootScope.session = data.session;
            $scope.pwdResult = data.data;
          } else {
            $scope.msg = data.msg;
          }
          $scope.isChanging = false;
        }).error(function(data, status, headers, config){
        //当发生异常时触发
        console.log(data);
        $scope.msg = "您的网络开小差啦!";
        $scope.isChanging = false;
      });
    };


    $scope.showInfo = function() {
      $scope.switchTab('myInfo');
    };

    $scope.showChangePwd = function () {
      $scope.switchTab('changePwd');
    };

  });
