'use strict';

/* Controllers */
app.controller('editAgentModalController', ['$scope', '$modalInstance', 'request', 'toaster', 'agentLevel', function ($scope, $modalInstance, request, toaster, agentLevel) {
    $scope.agentLevel = agentLevel;
    $scope.user = app["user"];
    //修改代理登记 (agentList实现)
    $scope.editAgent = function () {
        //数据校验
        var toastMsg = '';
        if (this.selectLevelInt == null || this.selectLevelInt == undefined || this.selectLevelInt == '') {
            toastMsg = "请选择等级!";
        }
        // todo:启东关闭
        // else if (this.bonusPercent == undefined || (this.bonusPercent + '').length == 0 || this.bonusPercent == '') {
        //     toastMsg = "请输入佣金比例!";
        // }
        // else if (app.user.isAgent && parseInt(this.bonusPercent) > app.user.bonusPercent) {
        //     toastMsg = "代理佣金比例不能高于自己的佣金比例!";
        // }
        // else if ( parseInt(this.bonusPercent) > 70) {
        //     toastMsg = "代理佣金比例不能高于70%!";
        // }
        // else if ( parseInt(this.bonusPercent) <= 0) {
        //     toastMsg = "代理佣金比例不能低于0%!";
        // }
        else if (app.user.isAgent && app.user.agentLevel > this.selectLevelInt) {
            toastMsg = "代理等级不能超过自己!";
        }
        if (toastMsg.length > 0) {
            toaster.clear();
            toaster.pop('error', '错误', toastMsg, 2000);
            return;
        }
        //关闭模态框 提交数据
        $modalInstance.close({
            selectLevelInt: this.selectLevelInt,
            // todo:启东关闭
            // bonusPercent: this.bonusPercent
        });

    };

    //取消按钮
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);

