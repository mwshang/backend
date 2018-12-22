/**
 * Created by Administrator on 2017/9/8 0008.
 */
'use strict';

/* Controllers */
app.controller('dashboardController', ['$scope', '$http', '$state', 'request', function ($scope, $http, $state, request) {
    $scope.user = app['user'];
    $scope.agent = {};
    $scope.notice = {};
    $scope.isHave = false;
    $scope.inited = false;

    console.log($scope.user);

    if ($scope.user == null || $scope.user == undefined) {
        $state.go('access.signin');
        return;
    }

    //通知
    function getNotice() {
        request.request("/gameop/notice", {uid: $scope.user.uid, type: 1}).then(function (notices) {
            if (!notices) return;
            $scope.notice = notices[0];
            //判断通知是否存在
            if (!!notices[0]) {
                //打开通知窗口
                $scope.isHave = true;
                //格式化
                var ttDate = $scope.notice.createdtime;
                ttDate = ttDate.replace(/(\d{4}).(\d{1,2}).(\d{1,2}).+/mg, '$1-$2-$3');
                $scope.notice.createdtime = ttDate;
            }
        });
    }

    //查询当前用户信息
    function getAgent() {
        request.request('/user/getInfo', {uid: $scope.user.uid, pid: $scope.user.uid})
            .then(function (agent) {
                $scope.agent = agent;

                // 显示代理数据
                request.request('/data/agentdata', {uid: $scope.user.uid}, false)
                    .then(function (data) {
                        console.log("代理数据:", data);
                        if (!data) return;
                        $scope.agent.chargeAmount = data.chargeAmount.toFixed(2);   //今日充值
                        $scope.agent.bonusAvail = $scope.user.bonusAvail; //可提佣金
                        $scope.agent.playerNum = data.playerNum;   //绑定玩家
                        $scope.agent.agentNum = data.agentNum;  //下级代理

                        $scope.inited = true;
                    });
            });
    }

    getNotice();
    getAgent();

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

    $scope.openAgents = function () {
        console.log(app.user.uid);
        $state.go("app.agents", {pid: app.user.uid});
    };
}]);