'use strict';

myApp.controller('bindController',
    function loginController($scope, $location, $http) {
  console.log($location);
  $scope.params = $location.search();

  $scope.inviteCode = '';
  $scope.msg = '';

  $scope.bind = function() {
    if ($scope.inviteCode == '') {
      $scope.msg = '请输入邀请码!';
      return;
    }

    $http.post("/user/bind", {uid: $scope.params.i, inviteCode : $scope.inviteCode, serverType: $scope.params.t})
      .success(function(data, status, headers, config){
        //当异步请求成功返回响应时触发
        console.log(data);

        if (data.code == 200) {
          if (data.data == 1) {
            var url = $location.host();
            // var url = 'http://localhost:3000';
            console.log('jump to mall:', url);
            window.location = 'http://mall.17xiayou.com/mall.html?a=1&token='+$scope.params.token+'&t='+$scope.params.t+'&i='+$scope.params.i+'&s='+$scope.params.s;
          } else
            $scope.msg = '绑定失败,请稍后重试!';
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
