'use strict';

/* Controllers */
app.controller('changeDiamondPriceController', ['$scope', '$http', '$state', '$localStorage', '$timeout', 'request', 'dialog', function ($scope, $http, $state, $localStorage, $timeout, request, dialog) {
    $scope.user = app["user"];
    //判断用户是否登录
    if ($scope.user === null || $scope.user === undefined) {
        $state.go('access.signin');
        return;
    }
    $scope.inited = false;
    //价格列表
    request.request("/settings/load", {}, false)
        .then(function (data) {
            if (data != null) {
                $scope.settings = data;
                //留档 用于判断 是否变更
                $scope.gemPrice = data.gemPrice;
                $scope.inited = true;
            } else {
                dialog.showError('','信息获取失败,请稍后重试');
                return;
            }
        });
    //修改列表
    $scope.saveSettings = function () {
        //判断是否已经变更
        if ($scope.settings.gemPrice == $scope.gemPrice) {
            dialog.showInfo('', '数据未变更!');
            return;
        }
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