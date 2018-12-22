'use strict';
app.controller('gameInformationController', ['$scope', '$http', '$state', 'request', 'dialog',
    function ($scope, $http, $state, request, dialog) {
        //获取用户信息
        $scope.user = app["user"];
        $scope.inited = false;

        //判断用户是否登录
        if ($scope.user === null || $scope.user === undefined) {
            $state.go('access.signin');
            return;
        }

        //获取游戏信息设置
        request.request("/settings/load", {}, false)
            .then(function (data) {
                if (data != null) {
                    console.log(data);
                    $scope.settings = data;
                    $scope.inited = true;
                } else {
                    dialog.showError('','信息获取失败,请稍后重试');
                    return;
                }
            });
        //修改列表
        $scope.saveSettings = function () {
            if ($scope.settings.kfWeChat === ''||$scope.settings.kfWeChat === null || $scope.settings.kfWeChat === undefined ){
                dialog.showError('','客服微信不能为空');
                return;
            }
            if ($scope.settings.kfWeChat === ''||$scope.settings.kfWeChat === null || $scope.settings.kfWeChat === undefined ){
                dialog.showError('','客服微信不能为空');
            }
            if ($scope.settings.kfWeChat === ''||$scope.settings.kfWeChat === null || $scope.settings.kfWeChat === undefined ){
                dialog.showError('','客服微信不能为空');
            }
            if ($scope.settings.kfWeChat === ''||$scope.settings.kfWeChat === null || $scope.settings.kfWeChat === undefined ){
                dialog.showError('','客服微信不能为空');
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
