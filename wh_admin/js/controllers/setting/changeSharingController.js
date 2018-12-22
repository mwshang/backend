'use strict';

/* Controllers */
app.controller('changeSharingController', ['$scope', '$http', '$state', '$localStorage', '$timeout', 'request', 'dialog', function ($scope, $http, $state, $localStorage, $timeout, request, dialog) {
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
                //留档 用于判断 是否变更 (根据:切割 成数组)
                var SharingData = data.opcpSharing.split(":");
                //备份数据 判断是否变更
                $scope.opcpSharing = data.opcpSharing;
                //运营商
                $scope.operator = parseInt(SharingData[0]);
                //开发商
                $scope.developers = parseInt(SharingData[1]);
                //显示数据
                $scope.inited = true;
            } else{
                dialog.showError('','信息获取失败,请稍后重试');
                return;
            }
        });
    // 修改列表
    $scope.saveSettings = function () {
        //判断是数据是否为空
        if ($scope.operator === null || $scope.developers === null){
            dialog.showError('','请设置运营商与开发商占比');
            return;
        }
        //判断是否变更
        var newSharing = $scope.operator + ':'+$scope.developers;
        console.log($scope.opcpSharing , newSharing);
        if ($scope.opcpSharing === newSharing){
            dialog.showInfo('','比例未变更未变更!');
            return;
        }
        //覆盖写入值setting设置
        $scope.settings.opcpSharing = newSharing;
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