app.controller('gameUrgentNoticeModalController', ['$scope', '$modalInstance', 'request', 'dataType', 'dialog', function ($scope, $modalInstance, request, dataType, dialog) {
    //获取用户信息
    $scope.user = app['user'];
    //关闭模态框
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    $scope.times = 1;
    //提交按钮(关闭模态款) 把数据传回gameNoticeController
    $scope.noticeSubmit = function () {
        //判断数据是否存在
        if (!this.text) {
            dialog.showError('', '通告信息不能为空!');
            return;
        }
        if (!this.times || this.times < 0 || this.times > 50) {
            dialog.showError('', '请确认循环在1-50之间!');
            return;
        }
        $modalInstance.close({text: this.text,times:this.times});
    };

}]);