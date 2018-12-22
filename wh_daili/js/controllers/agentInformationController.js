'use strict';

app.controller('agentInformationController', ['$scope', '$http', '$state', 'request', function ($scope, $http, $state, request) {
    $scope.user = app['user'];
    $scope.agent = {};


    if ($scope.user == null || $scope.user == undefined) {
        $state.go('access.signin');
        return;
    }

    //查询当前用户信息
    request.request('/user/getInfo', {uid: $scope.user.uid, pid: $scope.user.uid})
        .then(function (agent) {
            $scope.agent = agent;
            $scope.inited = true;
        });

    $scope.getLevel = function (level) {
        switch (level) {
            case 1:
                return '金钻代理';
            case 2:
                return '银钻代理';
            case 3:
                return '蓝钻代理';
        }
    };

    //获得佣金比例
    $scope.getBonusPercent = function () {
        request.request("/settings/load", {}, false)
            .then(function (data) {
                if (data != null) {
                    $scope.normal = data.normalRate1;
                    $scope.middle = data.middleRate1;
                    $scope.high = data.highRate1;
                } else {
                    dialog.showError('', '信息获取失败,请稍后重试');
                    return;
                }
            });

    };

    $scope.getBonusPercent();

    //设置页面佣金比例
    $scope.setBonusPercent = function (agentLevel) {
        switch (agentLevel) {
            case 3:
                return $scope.normal;
                break;
            case 2:
                return $scope.middle;
                break;
            case 1:
                return $scope.high;
                break;
        }
    };


}])
;