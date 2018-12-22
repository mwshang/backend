'use strict';

/* Controllers */
app.controller('playerLockModalController', ['$scope', '$modalInstance', '$stateParams', 'request', 'toaster', function ($scope, $modalInstance, $stateParams, request, toaster) {

    $scope.user = app["user"];
    //获取用户昵称用
    $scope.userName = '';
    //页面功能开关
    $scope.inited = false;
    //查询昵称
    $scope.getUserName = function (uid) {
        //判断uid是否为空
        if (uid === null || uid === undefined || uid === '') {
            toaster.clear();
            toaster.pop('error', '错误', '玩家UID不能为空', 2000);
            return;
        }
        //查询接口
        request.request('/player/getPlayer', {uid: $scope.user.uid, pid: uid})
            .then(function (data) {
                if (data !== null) {
                    $scope.userName = data.nickName;
                    $scope.inited = true;
                }
            });
    };

    //玩家封号 (playerList实现)
    $scope.playerBan = function () {
        //数据校验
        var toastMsg = '';
        if ($scope.userName == null || $scope.userName == undefined || $scope.userName == '') {
            toastMsg = "请先读取用户昵称";
        }
        if (this.uid == null || this.uid == undefined || this.uid == '') {
            toastMsg = "请输入用户ID";
        }
        if (toastMsg.length > 0) {
            toaster.clear();
            toaster.pop('error', '错误', toastMsg, 2000);
            return;
        }
        //关闭模态框 提交数据
        $modalInstance.close({
            pid: this.uid,
        });
    };

    //取消按钮
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);

