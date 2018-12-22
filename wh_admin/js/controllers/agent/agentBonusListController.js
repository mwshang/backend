app.controller('agentBonusListController', ['$scope', '$http', '$state', '$stateParams', 'request', 'dialog',
    function ($scope, $http, $state, $stateParams, request, dialog) {
        $scope.user = app["user"];
        //判断用户是否登录
        if ($scope.user === null || $scope.user === undefined) {
            $state.go('access.signin');
            return;
        }
        //设置查询开关 判断查询的用户是否存在
        $scope.agentExist = false;
        // 获取当天日期
        var date = new Date();
        var str = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
        $scope.initDate = date;
        //起始日期
        $scope.dateBegin = str;
        //结尾日期
        $scope.dateEnd = str;
        //日期选择开关 关
        $scope.openedStart = false;
        $scope.openedEnd = false;

        $scope.format = "yyyy/MM/dd";
        $scope.altInputFormats = ['yyyy/M!/d!'];

        //日期选择框开关
        $scope.openStart = function () {
            $scope.openedStart = true;
        };
        //日期选择框开关
        $scope.openEnd = function () {
            $scope.openedEnd = true;
        };

        $scope.inited = false;

        //分页设置1
        $scope.pageId = 0;
        $scope.pageNum = 1;

        //分页设置2
        $scope.pageId1 = 0;
        $scope.pageNum1 = 1;

        //全局分页设置(单页面数量)
        $scope.pageSize = 20;

        // //判断是否是第一次进入页面 设置初始pid
        // if ($stateParams.agent !== {}) {
        //     $scope.agent = $stateParams.agent;
        //     $scope.searchAgent();
        // } else {
        //     $scope.agent = {};
        // }

        //分页点击事件
        $scope.pageroll = function (id) {
            //设置页面跳转
            switch (id) {
                //首页
                case 0:
                    $scope.pageId = 0;
                    break;
                //上一页
                case -1:
                    if ($scope.pageId > 0)
                        $scope.pageId -= 1;
                    break;
                //下一页
                case 1:
                    if ($scope.pageId < $scope.pageNum - 1)
                        $scope.pageId += 1;
                    break;
                //最后一页
                case 2:
                    $scope.pageId = $scope.pageNum - 1;
                    break;
            }
            //搜索条件
            var cond = {uid: $scope.user.uid, pid: $scope.agent.uid, pageId: $scope.pageId, pageSize: $scope.pageSize};
            //请求接口
            $scope.searchDate(cond);
        };

        //分页点击事件2
        $scope.pageroll1 = function (id) {
            switch (id) {
                // 首页
                case 0:
                    $scope.pageId1 = 0;
                    break;
                // 上一页
                case -1:
                    if ($scope.pageId1 > 0)
                        $scope.pageId1 -= 1;
                    break;
                // 下一页
                case 1:
                    if ($scope.pageId1 < $scope.pageNum1 - 1)
                        $scope.pageId1 += 1;
                    break;
                // 尾页
                case 2:
                    $scope.pageId1 = $scope.pageNum1 - 1;
                    break;
            }
            var cond = {uid: $scope.user.uid, pid: $scope.agent.uid, pageId: $scope.pageId1, pageSize: $scope.pageSize};
            $scope.searchDate(cond);
        };

        //根据日期搜索的分页
        $scope.searchDate = function (cond) {
            //判断是否存在搜索条件
            var cond = arguments[0] ? arguments[0] : {
                uid: $scope.user.uid,
                pid: $scope.agent.uid,
                pageId: 0,
                pageSize: $scope.pageSize
            };
            //设置起始时间
            var begin = new Date($scope.dateBegin);
            var end = new Date($scope.dateEnd);
            //起始日期大于终止日期
            if (begin > end) {
                dialog.showError("错误", "起始日期不能大于截止日期");
                return;
            }
            //日期搜索条件存在
            else if ($scope.dateBegin !== null && $scope.dateEnd !== null) {
                //格式化获取的 起始 日期格式
                var strBegin = begin.getFullYear() + '/' + (begin.getMonth() + 1) + '/' + begin.getDate();
                var strEnd = end.getFullYear() + '/' + (end.getMonth() + 1) + '/' + end.getDate();
                cond['begin'] = strBegin;
                cond['end'] = strEnd;
                //日期搜索条件不全(搜索当日)
            } else if ($scope.dateBegin === null || $scope.dateEnd === null) {
                var today = new Date();
                var _today = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate();
                cond['begin'] = _today;
                cond['end'] = _today;
            }
            console.log(cond);
            //佣金查询 调用接口
            request.request('/user/bonus', cond, true)
                .then(function (data) {
                    console.log(data);
                    if (!data) return;
                    $scope.bonusIn = data.data.bonusIn;
                    $scope.bonusOut = data.data.bonusOut;

                    $scope.agent = data.data.user;
                    if (data.data.user.bonusTotal === null)
                        data.data.user.bonusTotal = 0.00;
                    if (data.data.user.bonusOut === null)
                        data.data.user.bonusOut = 0.00;

                    $scope.agent.bonusTotal = data.data.user.bonusTotal.toFixed(2);
                    $scope.agent.bonusAvail = data.data.user.bonusTotal - data.data.user.bonusOut;
                    $scope.agent.bonusAvail = $scope.agent.bonusAvail.toFixed(2);

                    $scope.pageId = data.page.bonusInPage.id;
                    $scope.pageNum = data.page.bonusInPage.num;
                    $scope.pageId1 = data.page.bonusOutPage.id;
                    $scope.pageNum1 = data.page.bonusOutPage.num;
                });
            //在页面信息获取之后全局刷新
            $scope.inited = true;
        };

        //搜索按钮事件(为防止点击下一页 造成用户信息的重复查询 用户信息查询将在改事件中进行)
        $scope.searchAgent = function () {
            //用户是否输入用户uid
            if ($scope.agent.uid == '' || $scope.agent.uid == null || $scope.agent.uid == undefined) {
                dialog.showError("错误", "请输入代理UID");
                return;
            }
            request.request('/user/agent', {uid: $scope.user.uid, pid: $scope.agent.uid})
                .then(function (agent) {
                    if (!agent) {
                        dialog.showError("错误", "该用户不存在");
                        return;
                    }
                    console.log(agent[0]);
                    $scope.userName = agent[0].name;
                    $scope.agent = agent[0];
                    $scope.totalAmount = agent[0].totalAmount;
                    console.log( $scope.totalAmount,$scope.agent);
                    //执行搜索语句
                    $scope.searchDate();
                });
        };

        //提取佣金
        $scope.getBonus = function (record) {
            return record.bonus.toFixed(2);
        };

        //提取佣金返回结果值处理
        $scope.bonusStatus = function (record) {
            if (record.status == 1)
                return '成功';
            else if (record.status == 3 || record.status == 4)
                return '失败';
            else if (record.status == 2)
                return '正在处理';
        };

        // 时间日期格式化
        $scope.showShortDateTime = function (record) {
            if (!record.createTime) return '';
            var temdate = new Date(record.createTime);
            return temdate.getFullYear() + '/' + (temdate.getMonth() + 1) + '/' + temdate.getDate() + ' ' + temdate.getHours() + ':' + temdate.getMinutes();
        };

        //搜索代理的总充值金额
        function getTotalAmount (pid) {
            var cond = {uid: $scope.user.uid, pid:pid};
            console.log(cond);
            request.request('/user/agent', cond)
                .then(function (data) {
                    console.log(data);
                    $scope.TotalAmount = data.data !== null ? data.data : [];
                });
        }


    }]);