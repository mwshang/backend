'use strict';

/* Controllers */
app.controller('changePwdController', ['$scope', '$http', '$state', '$localStorage', '$timeout', 'request', 'dialog', function ($scope, $http, $state, $localStorage, $timeout, request, dialog) {
    $scope.changePwd = function () {
        if ($localStorage.user.password != $scope.oldpwd) {
            dialog.showError('', '原密码错误!');
            return;
        }
        if ($scope.newpwd != $scope.newpwd2) {
            dialog.showError('', '新密码输入不一致!');
            return;
        }
        if ($localStorage.user.password == $scope.newpwd) {
            dialog.showError('', '新密码与原密码相同!');
            return;
        }
        //判断密码是否合法
        if (!/^(?=.*[0-9])(?=.*[a-zA-Z]).{6,30}$/.test($scope.newpwd)) {
            dialog.showError('', '密码必须包含英文字母和数字，不能小于6位!');
            return;
        }
        request.request('/user/changePwd', {uid: app.user.uid, oldpwd: $scope.oldpwd, newpwd: $scope.newpwd})
            .then(function (data) {
                if (data == 1) {
                    $localStorage.user.password = $scope.newpwd;
                    dialog.showInfo('', '修改成功!');
                    $timeout(function () {
                        $state.go('access.signin');
                    }, 1500);
                } else {
                    dialog.showError('', '修改失败!');
                }
            });
    };
}])
;