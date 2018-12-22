'use strict';

/* Controllers */
app.controller('registerAgentModalController', ['$scope', '$modalInstance', 'request', 'toaster', 'agentLevel', function ($scope, $modalInstance, request, toaster, agentLevel) {
    $scope.agentLevel = agentLevel;
    $scope.user = app["user"];
    //获取用户昵称用
    $scope.userName = '';
    //推荐人用户名
    $scope.recommenderName = '';
    //是否查询成功 开关
    $scope.noticeRecommenderName = false;
    $scope.noticeUserName = false;

    //查询昵称 (agentList实现)
    $scope.getUserName = function (uid, type) {
        //判断uid是否为空
        if (uid === null || uid === undefined || uid === '') {
            toaster.clear();
            toaster.pop('error', '错误', '请正确填写UID', 2000);
            return;
        }
        //查询接口
        request.request('/player/getPlayer', {uid: $scope.user.uid, pid: uid})
            .then(function (data) {
                //查询是否成功
                if (data !== null) {
                    //判断是那个触发的 1:代开通  2:新代理uid查询
                    if (type === 1) {
                        //判断该用户是否是代理
                        if (data.agentLevel >= 1) {
                            //防止无昵称玩家
                            if (data.nickName == '') {
                                $scope.noticeRecommenderName = true;
                            }
                            $scope.recommenderName = data.nickName;
                            $scope.recommenderAgentLevel = data.agentLevel;
                            return;
                        }
                        //查询成功 但不是代理
                        $scope.recommenderName = '';
                        $scope.recommenderAgentLevel = '';
                        toaster.clear();
                        toaster.pop('error', '错误', '用户 ' + data.nickName + ' 不是代理,请确认后重试', 2000);
                        return;
                    }
                    //查询玩家uid

                    //判断该用户是否是代理
                    if (data.agentLevel >= 1) {
                        //查询成功 但不是代理
                        $scope.userName = '';
                        toaster.clear();
                        toaster.pop('error', '错误', '用户 ' + data.nickName + ' 已是代理,请确认后重试', 2000);
                        return;
                    }
                    //防止误昵称玩家
                    if (data.nickName == '') {
                        $scope.noticeUserName = true;
                    }
                    $scope.userName = data.nickName;
                    return;
                }
                //查询失败
                //为防止用户 在查询完之后再做更改 进行保护
                if (type === 1) {
                    $scope.recommenderName = '';
                    $scope.recommenderAgentLevel = '';
                    $scope.noticeRecommenderName = false;

                } else {
                    $scope.userName = '';
                    $scope.noticeUserName = false;
                }
                toaster.clear();
                toaster.pop('error', '错误', '没有找到该用户,请确认后重试', 2000);
            });
    };

    //添加代理 (agentList实现)
    $scope.registerAgent = function () {
        //数据校验
        var toastMsg = '';
        if ($scope.userName == null || $scope.userName == undefined || ($scope.userName == '' && $scope.noticeUserName == false)) {
            toastMsg = "请先读取用户昵称";
        }
        if (this.uid == null || this.uid == undefined || this.uid == '') {
            toastMsg = "请输入用户ID";
        }
        if (this.switch == true && ($scope.recommenderName == null || $scope.recommenderName == undefined || ($scope.recommenderName == '' && $scope.noticeRecommenderName == false))) {
            toastMsg = "代开通时,请获取上级代理昵称";
        }
        if (this.switch == true && (this.uid == this.recommender)) {
            toastMsg = "新开通的代理与上级代理不能为同一人!";
        }
        if (this.selectLevelInt == null || this.selectLevelInt == undefined || this.selectLevelInt == '') {
            toastMsg = "请选择等级!";
        }
        if (this.switch == true && this.selectLevelInt < $scope.recommenderAgentLevel ){
            toastMsg = "新开通的代理等级不能高于上级代理!";
        }
        if (this.agentCode == undefined || (this.agentCode + '').length != 6) {
            toastMsg = "请输入六位邀请码,且不能以0开头!";
        }
        if (this.phoneNumber == undefined || this.phoneNumber == '') {
            toastMsg = "请输入手机号码!";
        }
        if ((this.phoneNumber + '').length != 11 || !(/^[1][3-8]\d{9}$/.test(this.phoneNumber))) {
            toastMsg = "手机号码格式不正确!";
        }
        //todo:启东部署去除
        // else if (this.bonusPercent == undefined || (this.bonusPercent + '').length == 0 || this.bonusPercent == '') {
        //     toastMsg = "请输入佣金比例!";
        // }
        // else if (app.user.isAgent && parseInt(this.bonusPercent) > app.user.bonusPercent) {
        //     toastMsg = "开通的代理佣金比例不能高于自己的佣金比例!";
        // }
        // else if ( parseInt(this.bonusPercent) <= 0) {
        //     toastMsg = "开通的代理佣金比例不能低于0%!";
        // }
        // else if ( parseInt(this.bonusPercent) > 70) {
        //     toastMsg = "开通的代理佣金比例不能高于70%!";
        // }
        if (this.pwd == null || this.pwd == undefined || this.pwd == '') {
            toastMsg = "请填写初始密码!";
        }
        if (!(/^[0-9a-zA-Z]{6,16}$/.test(this.pwd))) {
            toastMsg = "密码不能小于6位,且不能为特殊字符!";
        }
        if (toastMsg.length > 0) {
            toaster.clear();
            toaster.pop('error', '错误', toastMsg, 2000);
            return;
        }
        //关闭模态框 提交数据
        $modalInstance.close({
            uid: this.uid,
            selectLevelInt: this.selectLevelInt,
            agentCode: this.agentCode,
            pwd: this.pwd,
            switch: this.switch,
            recommender: this.recommender,
            // todo:
            // bonusPercent: this.bonusPercent,
            //todo:十三水去除
            phoneNumber: this.phoneNumber
        });
    };

    //取消按钮
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

}]);

