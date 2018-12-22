'use strict';

/* Controllers */

app.controller('qrCodeController', ['$scope', '$localStorage', function($scope, $localStorage) {
  if (angular.isDefined($localStorage.user)) {
    $scope.user = $localStorage.user;
  }
    // var cond = {uid: $scope.user.uid, pid: $scope.user.uid};
    // request.request('/player/getPlayer', cond)
    //     .then(function (data) {
    //         if (data != null) {
    //             $scope.shareUrl = 'http://mall.yiqigame.me/wxpub.html?a=1&token=download&s=qd&t=' + $scope.user.agentId;
    //             $scope.imageUrl = 'http://qr.liantu.com/api.php?logo=' + data.headUrl + '&text=http://mall.yiqigame.me/wxpub.html?a=1%26token=download%26s=qd%26t=' + $scope.user.agentId;
    //             return;
    //         }
    //         dialog.showError('', '二维码获取失败,请重试!')
    //     });

  $scope.shareUrl = 'http://whmall.yiqigame.me/wxpub.html?a=1&token=download&s=wh&t=' + $scope.user.agentId;
  $scope.imageUrl = 'http://qr.liantu.com/api.php?logo=http://whdl.yiqigame.me/icon.png&text=http://whmall.yiqigame.me/wxpub.html?a=1%26token=download%26s=wh%26t=' + $scope.user.agentId;

}]);