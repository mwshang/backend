app.controller('agentChargeListController', ['$scope', '$http', '$state', 'request', 'dialog',
    function ($scope, $http, $state, request, dialog) {
        $scope.user = app["user"];
        //判断用户是否登录
        if ($scope.user === null || $scope.user === undefined) {
            $state.go('access.signin');
            return;
        }
        var date = new Date();
        var str = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
        $scope.dateBegin = str;
        $scope.dateEnd = str;
        $scope.openedStart = false;
        $scope.openedEnd = false;
        $scope.format = "yyyy/MM/dd";
        $scope.altInputFormats = ['yyyy/M!/d!'];
        $scope.searchUid = "";
        $scope.totalPageAmount = 0;
        $scope.totalAmount = 0;
        //跳转到首页
        $scope.pageClear = false;
        //日期选择组件
        $scope.openStart = function () {
            $scope.openedStart = true;
        };
        $scope.openEnd = function () {
            $scope.openedEnd = true;
        };
        $scope.inited = false;
        $scope.initDate = date;

        // page roll
        $scope.pageId = 0;
        $scope.pageSize = 20;
        $scope.pageNum = 1;
        $scope.searchFlag = "";

        $scope.pageroll = function (id) {
            switch (id) {
                case 0:
                    $scope.pageId = 0;
                    break;
                case -1:
                    if ($scope.pageId > 0)
                        $scope.pageId -= 1;
                    break;
                case 1:
                    if ($scope.pageId < $scope.pageNum - 1)
                        $scope.pageId += 1;
                    break;
                case 2:
                    $scope.pageId = $scope.pageNum - 1;
                    break;
            }
            searchByDateAction();
        };

        //搜索按钮
        $scope.searchAgent = function () {
            if ($scope.searchUid === '' || $scope.searchUid.length !== 6) {
                dialog.showError('', '代理UID不正确,请确认后重试!');
                return;
            }
            //查询接口
            request.request('/player/getPlayer', {uid: $scope.user.uid, pid: $scope.searchUid})
                .then(function (data) {
                    if (data !== null) {
                        $scope.userName = data.nickName;
                        $scope.inited = true;
                    }
                });
            //是否清除页面
            $scope.pageClear = true;
            searchByDateAction();
        };

        //日期搜索
        function searchByDateAction() {
            var begin = new Date($scope.dateBegin);
            var end = new Date($scope.dateEnd);
            var cond = {uid:$scope.user.uid, pid: $scope.searchUid, pageSize: $scope.pageSize};
            if (begin > end) {
                console.log("起始日期不能大于截止日期");
                dialog.showError("错误", "起始日期不能大于截止日期");
                return;
            }
            else if ($scope.dateBegin != null && $scope.dateEnd != null) {
                var strBegin = begin.getFullYear() + '/' + (begin.getMonth() + 1) + '/' + begin.getDate();
                var strEnd = end.getFullYear() + '/' + (end.getMonth() + 1) + '/' + end.getDate();
                cond['begin'] = strBegin;
                cond['end'] = strEnd;
            } else if ($scope.dateBegin == null || $scope.dateEnd == null) {
                var today = new Date();
                var _today = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate();
                cond['begin'] = _today;
                cond['end'] = _today;
            }
            //判断是否需要刷新初始页面
            if ($scope.pageClear) {
                //刷新初始页面
                $scope.pageId = 0;
                //还原刷新开关
                $scope.pageClear = false;
            }
            cond['pageId'] = $scope.pageId;
            console.log(cond);
            request.request('/user/getCharges', cond, true)
                .then(function (data) {
                    if (!data) {
                        dialog.showError('', '代理不存在');
                        return;
                    }
                    console.log(data);
                    $scope.players = data.data.charges != null ? data.data.charges : [];
                    $scope.pageId = data.page.id;
                    $scope.pageNum = data.page.num;
                    $scope.totalAmount = data.data.totalAmount;
                    //计算当页总金额
                    $scope.getTotoalChargeAmount($scope.players);
                    $scope.inited = true;

                });
        }

        $scope.getUserLevel = function (record) {
            if (record.isAgent != undefined && record.isAgent) {
                return '下级代理';
            } else {
                return '直属玩家';
            }
        };

        //计算当页总充值金额
        $scope.getTotoalChargeAmount = function (data) {
            if (data === null || data === []) {
                $scope.totalPageAmount = 0;
                return;
            }
            var totalPageAmount = 0;
            //计算总金额
            data.map(function (value) {
                totalPageAmount += value.chargeAmount
            });
            $scope.totalPageAmount = totalPageAmount;
        };

    }]);