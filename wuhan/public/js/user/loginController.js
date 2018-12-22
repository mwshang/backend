'use strict';

myApp.controller('loginController',
    function loginController($rootScope, $scope, $sessionStorage, $localStorage, $location, $http) {

  if (($location.path() == '/' || $location.path() == '') &&
    $rootScope.user != undefined && $rootScope.user != null) {
    $location.url('/main');
  }

  $scope.user = {
    name : '',
    pwd : ''
  };

  $scope.msg = '';

  if ($localStorage.user != undefined || $localStorage.user != null) {
    $scope.user.name = $localStorage.user.name;
    $scope.user.pwd = $localStorage.user.pwd;
    $scope.remember = true;
  } else
    $scope.remember = false;

  $scope.login = function() {
    if ($scope.user.name == '' || $scope.user.pwd == '')
      return;

    $http.post("/user/login", {name: $scope.user.name, pwd : hex_md5('asdfghjkl;zxcvbnm,./' + $scope.user.pwd)})
      .success(function(data, status, headers, config){
        //当异步请求成功返回响应时触发
        console.log(data);

        if (data.code == 200) {
          if ($scope.remember)
            $localStorage.user = {name: $scope.user.name, pwd: $scope.user.pwd};
          else
            $localStorage.user = null;


          $rootScope.user = data.data;
          $rootScope.session = data.session;
          console.log($rootScope.user);
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
