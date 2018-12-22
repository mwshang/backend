'use strict';

/* Controllers */
app.controller('setBonusController', ['$scope', '$http', '$state', '$localStorage', '$timeout', 'request', 'dialog', function ($scope, $http, $state, $localStorage, $timeout, request, dialog) {
    $scope.user = app["user"];
    //判断用户是否登录
    if ($scope.user === null || $scope.user === undefined) {
        $state.go('access.signin');
        return;
    }
    //数据显示控制
    $scope.inited = false;
    //价格列表
    request.request("/settings/load", {}, false)
        .then(function (data) {
            if (data != null) {
                $scope.settings = data;
                //显示数据
                $scope.inited = true;
            } else {
                dialog.showError('', '信息获取失败,请稍后重试');
                return;
            }
        });
    // 修改列表
    $scope.saveSettings = function () {
        //判断是数据是否为空
        if ($scope.settings.normalRate1 === '' || $scope.settings.middleRate1 === '' || $scope.settings.highRate1 === '') {
            dialog.showError('', '代理佣金比例不能为空');
            return;
        }
        //初级<=中级<=高级<=100
        if (!(0 <= $scope.settings.normalRate1 && $scope.settings.normalRate1 <= $scope.settings.middleRate1 && $scope.settings.middleRate1 <= $scope.settings.highRate1 && $scope.settings.highRate1 <= 100)) {
            dialog.showError('', '代理比例不符合规范,佣金比例依次为 普通<=中级<=高级,范围在0~100之间!');
            return;
        }
        //请求接口执行数据
        request.request('/settings/save', {uid: $scope.user.uid, settings: $scope.settings})
            .then(function (data) {
                if (data == 1) {
                    dialog.showSuccess('', '修改成功!');
                } else {
                    dialog.showError('', '修改失败!');

                }
            });

    }

}]);