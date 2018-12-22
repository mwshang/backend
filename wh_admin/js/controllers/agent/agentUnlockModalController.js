'use strict';

/* Controllers */
app.controller('agentUnlockModalController', ['$scope', '$modalInstance', '$stateParams', 'request', 'toaster', 'pid', 'nickName', 'agentLevel', function ($scope, $modalInstance, $stateParams, request, toaster, pid, nickName, agentLevel) {
    //接受uid
    $scope.pid = pid ? pid : 0;
    //接受代理 nickName
    $scope.nickName = nickName;
    //接受代理等级
    $scope.agentLevel = agentLevel;
    $scope.user = app["user"];
    //获取用户昵称用
    $scope.userName = '';
    //页面功能开关
    $scope.inited = false;
    //返回信息
    $scope.res = 0;

    console.log($scope.pid, $scope.nickName, $scope.agentLevel);
    //代理解封 (内部实现)
    $scope.agentUnlock = function () {
        //教研
        if ($scope.pid === 0 || $scope.agentLevel === null || $scope.agentLevel === undefined || $scope.agentLevel === '' ) {
            toaster.clear();
            toaster.pop('error', '错误', '代理信息获取失败,请关闭窗口后重试', 2000);
            return;
        }
        //解封操作
        request.request('/user/auditAgent', {uid: $scope.user.uid, pid: $scope.pid, type: 0, audit:$scope.agentLevel}, true)
            .then(function (data) {
                console.log(data);
                if (data.data === 1) {
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

