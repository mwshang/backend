app.controller('agentNoticeModalController', ['$scope', '$modalInstance', 'request', 'dataType', 'dialog', function ($scope, $modalInstance, request, dataType, dialog) {
    //获取用户信息
    $scope.user = app['user'];
    //关闭模态框
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    //提交按钮(关闭模态款) 把数据传回gameNoticeController
    $scope.noticeSubmit = function () {
        //判断数据是否存在
        if (!this.text) {
            dialog.showError('', '通知信息不能为空!');
            return;
        }
        $modalInstance.close({text: this.text});
    };
}]);