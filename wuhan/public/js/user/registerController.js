'use strict';

myApp.controller('registerController',
    function registerController($rootScope, $scope, $localStorage, $location, $http) {
  $scope.user = {
    uid: '',
    // name: '',
    mail: '',
    pwd: '',
    pwd2: ''
  };

  $scope.register = function() {
    if ($scope.user.mail == '' || $scope.user.pwd == '') {
      $scope.msg = "输入信息不完整!";
      return;
    }

    if ($scope.user.pwd != $scope.user.pwd2) {
      $scope.msg = "两次密码不一致，请重新输入!";
      return;
    }
    console.log(hex_md5('asdfghjkl;zxcvbnm,./' + $scope.user.pwd));
    $http.post("/user/register", {uid: $scope.user.uid, name: $scope.user.uid,
                                  mail: $scope.user.mail, pwd: hex_md5('asdfghjkl;zxcvbnm,./' + $scope.user.pwd)})
      .success(function(data, status, headers, config){
        //当异步请求成功返回响应时触发
        console.log(data);

        if (data.code == 200) {
          $rootScope.user = data.data;
          $rootScope.session = data.session;
          $localStorage.user = null;
          $location.url('/main');
        } else {
          $scope.msg = data.msg;
        }
      }).error(function(data, status, headers, config){
        //当发生异常时触发
        console.log(data);
        $scope.msg = "您的网络开小差啦!";
      });

  };
});
