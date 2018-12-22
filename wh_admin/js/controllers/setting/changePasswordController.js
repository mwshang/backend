'use strict';

/* Controllers */
app.controller('changePasswordController', ['$scope', '$http', '$state', '$localStorage', '$timeout', 'request', 'dialog', function ($scope, $http, $state, $localStorage, $timeout, request, dialog) {
    $scope.user = app["user"];
    //判断用户是否登录
    if ($scope.user === null || $scope.user === undefined) {
        $state.go('access.signin');
        return;
    }
    $scope.newpwd = '';
    $scope.newpwd2 = '';
    $scope.changePwd = function () {
        if ($scope.oldpwd != app['user'].password) {
            dialog.showError('', '原密码有误请确认后重试!');
            return;
        }
        if ($scope.newpwd == null || $scope.newpwd2 == null || $scope.newpwd == '' || $scope.newpwd2 == '') {
            dialog.showError('', '密码不能为空');
            return;
        }
        if ($scope.oldpwd == $scope.newpwd) {
            dialog.showError('', '原密码与新密码不能相同!');
            return;
        }
        if ($scope.newpwd != $scope.newpwd2) {
            dialog.showError('', '新密码两次输入不一致!');
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
                    // this.config.setValue('password', this.newPwd);
                    dialog.showSuccess('', '修改成功,正在跳转至登录页面!');
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