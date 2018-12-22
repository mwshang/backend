'use strict';

/* Controllers */
app.controller('viewAgentPasswordController', ['$scope', 'request', 'toaster', 'dialog', function ($scope, request, toaster, dialog) {
    $scope.user = app["user"];
    //判断用户是否登录
    if ($scope.user === null || $scope.user === undefined) {
        $state.go('access.signin');
        return;
    }
    //获取用户昵称用
    $scope.userName = '';
    //代理密码
    $scope.agentPassword = '';
    //
    $scope.nullName = false;

    //查询昵称
    $scope.getUserName = function (uid) {
        $scope.nullName = false;
    //判断uid是否为空
        if (uid === null || uid === undefined || uid === '') {
            dialog.showError('错误', '玩家UID不能为空!');
            return;
        }
    //查询接口
        request.request('/player/getPlayer', {uid: $scope.user.uid, pid: uid})
            .then(function (data) {
                if (data !== null) {
                    if (data.nickName === ''){
                        $scope.nullName = true;
                    }
                    $scope.userName = data.nickName;
                }
            });
    };

    //查找密码
    $scope.viewPassword = function () {
        if ($scope.userName === '' && $scope.nullName === false ){
            dialog.showError('', '请先读取玩家昵称!');
            return;
        }
        request.request('/user/getInfo', {uid: $scope.user.uid, pid:$scope.uid})
            .then(function(player) {
                if (player.isAgent === 5) {
                    dialog.showWarning('警告', '无权查看运营账号密码!');
                    return;
                } else {
                    alert('密码: '+player.password+', 请通知玩家及时更新密码!');
                }
            });
    };

}]);

