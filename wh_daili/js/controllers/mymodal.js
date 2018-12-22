'use strict';

/* Controllers */
app.controller('ModalInstanceCtrl', ['$scope', '$modalInstance', 'request', 'toaster', 'agentLevel', function ($scope, $modalInstance, request, toaster, agentLevel) {
    $scope.agentLevel = agentLevel;
    $scope.user = app["user"];
    //获取用户昵称用
    $scope.userName = '';
    //计算次数用
    $scope.i = 0;
    //发送钻石
    $scope.sendgem = function () {
        $modalInstance.close(this.gemNum);
    };

    //查询昵称 (agentList实现)
    $scope.getUserName = function (uid) {
        //判断uid是否为空
        if (uid === null || uid === undefined || uid === '') {
            toaster.clear();
            toaster.pop('error', '错误', '请输入玩家UID', 2000);
            return;
        }
        //查询接口
        request.request('/player/getPlayer', {uid: $scope.user.uid, pid: uid})
            .then(function (data) {
                if (data !== null) {
                    $scope.userName = data.nickName;
                }
            });
    };

    //添加代理 (agentList实现)
    $scope.auditAgent = function () {
        //数据校验
        var toastMsg = '';
        if ($scope.userName == null || $scope.userName == undefined || $scope.userName == '') {
            toastMsg = "请先读取用户昵称";
        }
        if (this.uid == null || this.uid == undefined || this.uid == '') {
            toastMsg = "请输入用户ID";
        }
        else if (this.selectLevelInt == null || this.selectLevelInt == undefined || this.selectLevelInt == '') {
            toastMsg = "请选择等级!";
        }
        else if(this.selectLevelInt < $scope.user.agentLevel){
            toastMsg = "开通的代理等级不能高于自己";
        }
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

        else if (this.agentCode == undefined || (this.agentCode + '').length != 6) {
            toastMsg = "请输入六位邀请码,且不能以0开头!";
        }
        else if (this.phoneNumber == undefined || this.phoneNumber == '') {
            toastMsg = "请输入手机号码!";
        }
        else if ((this.phoneNumber + '').length != 11 || !(/^[1][3-8]\d{9}$/.test(this.phoneNumber))) {
            toastMsg = "手机号码格式不正确!";
        }
        else if (this.pwd == null || this.pwd == undefined || this.pwd == '') {
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
            phoneNumber: this.phoneNumber,
            //todo:启东去除
            // bonusPercent: this.bonusPercent

        });
    };

    //编辑代理
    $scope.editAgent = function () {
        $modalInstance.close({selectLevelInt: this.selectLevelInt, bonusPercent: this.bonusPercent});
    };

    //取款
    $scope.withdrawal = function () {
        //防止重复性操作
        $scope.i ++;
        //判断金额数量是否大于100
        if (this.getMoney < 100 || this.getMoney == null) {
            toaster.clear();
            toaster.pop('error', '错误', '单笔提取金额需大于100元', 2000);
            return;
        }
        if ($scope.i < 2){
            $modalInstance.close(this.getMoney);
        } else {
            $modalInstance.dismiss('cancel');
        }
    };

    //取消按钮
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);

app.controller('ModalCtrl', ['$scope', '$modal', '$log', '$window', 'request', 'dialog', function ($scope, $modal, $log, $window, request, dialog) {
    $scope.gemNum = 0;
    $scope.getMoney = 0;

    //赠送钻石
    $scope.openSendGem = function (uid) {
        var modalInstance = $modal.open({
            templateUrl: 'myModalSendGem.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
                agentLevel: function () {
                    return '代理等级';
                }
            }
        });

        modalInstance.result.then(function (num) {
            $scope.gemNum = num;

            var toastMsg = '';

            if ($scope.gemNum == null) {
                toastMsg = "请填写钻石数量!";
            }

            if (toastMsg.length > 0) {
                dialog.showError('', toastMsg);
            } else {
                if ($scope.gemNum < 0) {
                    dialog.showError('', '输入有误!');
                } else if (app.user.isAgent && $scope.gemNum > app.user.gemNum) {
                    dialog.showError('', '您的钻石不够了!');
                } else {
                    request.request('/user/donateCards', {uid: app.user.uid, pid: uid, gem: $scope.gemNum})
                        .then(function (result) {
                            if (result == 1) {
                                dialog.showInfo('', '发钻成功!');
                            } else if (result == 0) {
                                dialog.showError('', '发钻失败!');
                            }
                        });
                }
            }

        }, function () {
            $log.info('Modal dismissed');
        });
    };

    //提现
    $scope.openWithdrawBonus = function (uid) {
        var modalInstance = $modal.open({
            templateUrl: 'myModalWithdraw.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
                agentLevel: function () {
                    return '代理等级';
                }
            }
        });

        modalInstance.result.then(function (num) {
            $scope.getMoney = num;

            if ($scope.getMoney === null) {
                dialog.showError('', '请填写提取金额');
            } else {
                if ($scope.getMoney < 0) {
                    dialog.showError('', '输入金额有误!');
                }
                else if (app.user.isAgent && $scope.getMoney > app.user.bonusAvail) {
                    dialog.showError('', '您的金额不够了!');
                }
                else if ($scope.getMoney < 100) {
                    dialog.showError('', '每笔提取金额需大于100元!');
                }
                else if ($scope.getMoney > 5000) {
                    dialog.showError('', '每笔提取金额不能超过5000元!');
                }

                else {
                    request.request('/withdraw/withdraw', {uid: app.user.uid, cny: $scope.getMoney})
                        .then(function (result) {
                            if (result.result == 1) {
                                if (result.cfmUrl.length > 0) {
                                    $window.location.href = result.cfmUrl;
                                } else {
                                    dialog.showInfo('', '提取成功!');
                                }
                            } else {
                                dialog.showError('', '提取失败!');
                            }
                        });
                }
            }

        }, function () {
            $log.info('Modal dismissed');
        });
    };

    //修改代理
    $scope.openEditAgent = function (uid) {
        var modalInstance = $modal.open({
            templateUrl: 'myModalEditAgent.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
                agentLevel: function () {
                    return '代理等级';
                }
            }
        });

        $scope.selectLevelInt = 1;
        modalInstance.result.then(function (data) {
            $scope.selectLevelInt = data.selectLevelInt == undefined ? 0 : data.selectLevelInt;
            $scope.bonusPercent = data.bonusPercent == undefined ? 0 : data.bonusPercent;

            var toastMsg = '';

            if ($scope.selectLevelInt == 0 && parseInt($scope.bonusPercent) == 0) {
                toastMsg = "没有修改信息!";
            }
            else if (app.user.isAgent && parseInt($scope.bonusPercent) > app.user.bonusPercent) {
                toastMsg = "开通的代理佣金比例不能高于自己的佣金比例!";
            }

            if (toastMsg.length > 0) {
                dialog.showError('', toastMsg);
            } else {
                // 先审核
                request.request('/user/auditAgent', {
                    uid: app.user.uid, pid: uid,
                    recommender: app.user.isAgent ? app.user.uid : 0,
                    type: 1, audit: $scope.selectLevelInt
                })
                    .then(function (data) {
                        if (data == 1) { // 代注册
                            request.request('/user/register', {
                                uid: uid, mail: '',
                                pwd: $scope.pwd,
                                // bonusPercent: parseInt($scope.bonusPercent),
                                bonusPercent:'',
                                phoneNumber: '',
                                agentCode: $scope.agentCode,
                                willLogin: false
                            })
                                .then(function (data) {
                                    if (data != null && data.uid == uid) {
                                        dialog.showInfo('', '修改代理成功!');
                                    } else {
                                        dialog.showError('', '修改代理失败,请稍后再试!');
                                    }
                                });
                        } else {
                            dialog.showError('', '修改代理失败,请稍后再试!');
                        }
                    });
            }
        }, function () {

        });
    };
}]);
