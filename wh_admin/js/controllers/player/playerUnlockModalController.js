'use strict';

/* Controllers */
app.controller('playerUnlockModalController', ['$scope', '$modalInstance', '$stateParams', 'request', 'toaster', 'pid', 'nickName', function ($scope, $modalInstance, $stateParams, request, toaster, pid, nickName) {
    //接受uid
    $scope.pid = pid ? pid : 0;
    //接受玩家 nickName
    $scope.nickName = nickName;
    $scope.user = app["user"];
    //获取用户昵称用
    $scope.userName = '';
    //页面功能开关
    $scope.inited = false;
    //返回信息
    $scope.res = 0;

    console.log($scope.pid, $scope.nickName);
    //玩家解封 (内部实现)
    $scope.playerUnlock = function () {
        if (pid === 0) {
            toaster.clear();
            toaster.pop('error', '错误', '未获取到解封用户uid,请关闭窗口后重试', 2000);
            return;
        }
        //解封操作
        request.request('/player/lockPlayer', {uid: $scope.user.uid, pid: $scope.pid, locked: 0}, true)
            .then(function (data) {
                console.log(data);
                if (data.data !== null && data.data.locked === 0) {
                    $scope.res = 1;
                    toaster.clear();
                    toaster.pop('success', '成功', '解封成功', 2000);
                    //关闭模态框 提交数据
                    $modalInstance.close({
                        res: $scope.res
                    });
                } else {
                    toaster.clear();
                    toaster.pop('error', '失败', '解封失败', 2000);
                    //关闭模态框 提交数据
                    $scope.cancel();
                }
            });

    };

    //取消按钮
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);

