app.controller('playerListController', ['$scope', '$http', '$state', '$modal', 'request', 'dialog',
    function ($scope, $http, $state, $modal, request, dialog) {
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
        //闪屏兼容性调整 在数据获取后 释放dom
        $scope.inited = false;
        //搜索日期表开关
        $scope.openStart = function () {
            $scope.openedStart = true;
        };
        $scope.openEnd = function () {
            $scope.openedEnd = true;
        };

        // 分页设置
        //分页ID
        $scope.pageId = 0;
        //每页显示的数量
        $scope.pageSize = 20;
        //初始页码
        $scope.pageNum = 1;
        //设置搜索条件占位
        $scope.searchFlag = "";
        //是否清除页面
        $scope.pageClear = false;

        //分页点击事件
        $scope.pageroll = function (id) {
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

            //判断使用搜索方式
            if ($scope.searchFlag === 'byUid') {
                //调用用户UID查询接口
                $scope.searchByUID();
            } else if ($scope.searchFlag === 'byDate') {
                //调用日期查询接口
                searchByDataAction()
            } else {
                //分页跳转
                var cond = {uid: $scope.user.uid, pageId: $scope.pageId, pageSize: $scope.pageSize};
                request.request('/user/getPlayers', cond, true)
                    .then(function (data) {
                        console.log(data);
                        $scope.players = data.data !== null ? data.data : [];
                        $scope.pageId = data.page.id;
                        $scope.pageNum = data.page.num;
                    });
            }
        };

        //初始化时间
        $scope.initDate = date;

        //日期查询按钮 (重置页码)
        $scope.searchByDate = function () {
            //是否清除页面
            $scope.pageClear = true;
            searchByDataAction()
        };

        //通过时间搜索
        function searchByDataAction() {
            var begin = new Date($scope.dateBegin);
            var end = new Date($scope.dateEnd);
            var cond = {uid: $scope.user.uid, pageId: $scope.pageId, pageSize: $scope.pageSize};
            //判断起始时间
            if (begin > end) {
                console.log("起始日期不能大于截止日期");
                dialog.showError("错误", "起始日期不能大于截止日期");
                return;
            }
            //如果时间不为空 且起始时间存在 进行设置
            else if ($scope.dateBegin !== null && $scope.dateEnd !== null) {
                var strBegin = begin.getFullYear() + '/' + (begin.getMonth() + 1) + '/' + begin.getDate();
                var strEnd = end.getFullYear() + '/' + (end.getMonth() + 1) + '/' + end.getDate();
                cond['begin'] = strBegin;
                cond['end'] = strEnd;
                //起始时间不存在 默认为当天
            } else if ($scope.dateBegin === null || $scope.dateEnd === null) {
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
            //设置type字段
            $scope.searchFlag = "byDate";
            //调用接口请求
            request.request('/user/getPlayers', cond, true)
                .then(function (data) {
                    $scope.players = data.data !== null ? data.data : [];
                    $scope.pageId = data.page.id;
                    $scope.pageNum = data.page.num;
                    //打开页面
                    $scope.inited = true;
                });
        }

        //玩家UID条件作为搜索
        $scope.searchByUID = function () {
            //判断UID是否为空 且合法
            if ($scope.searchUID != null && $scope.searchUID > 0) {
                //设置搜索方法
                var cond = {uid: $scope.user.uid, pid: $scope.searchUID};
                request.request('/player/getPlayer', cond)
                    .then(function (data) {
                        console.log(data);
                        if (data !== null) {
                            $scope.searchFlag = "byUid";
                            $scope.players = [];
                            $scope.players.push(data);
                        }
                    });
            } else {
                dialog.showError("", "请输入UID");
                return;
            }
        };

        //首次进入执行
        searchByDataAction();

        //玩家封号
        $scope.playerBan = function () {
            var modalInstance = $modal.open({
                templateUrl: 'playerLockModal.html',
                controller: 'playerLockModalController',
                resolve: {
                    agentLevel: function () {
                        return '玩家封停';
                    }
                }
            });

            modalInstance.result.then(function (data) {
                $scope.pid = data.pid;
                //玩家封停
                request.request('/player/lockPlayer', {uid: $scope.user.uid, pid: $scope.pid, locked: 1}, true)
                    .then(function (data) {
                        //数据存在
                        if (data.data !== null && data.data.locked === 1) {
                            dialog.showSuccess('', '玩家封停成功!');
                            return;
                        } else {
                            dialog.showError('', '玩家封停失败!');
                            return;
                        }
                    });
            });
        };

        //刷新按钮
        $scope.refresh = function () {
            if ($scope.searchFlag === 'byUid') {
                $scope.searchByUID();
            } else {
                searchByDataAction();
            }
        };

        //价格输出
        $scope.payNum = function (num) {
            if (num > 0) {
                return num + '元';
            }
            return '无';
        };

        //胜率格式化
        $scope.getratio = function (num) {
            var num = num * 100;
            return (num.toFixed(2)) + '%';
        };

    }]);
//时间筛选器 输出输出格式 Y-M-d-H:m
app.filter('myTime', function () {
    return function (time) {
        if (time === '' || time == null) {
            return '新注册玩家';
        }
        var datetime = new Date(time);
        var mon = datetime.getMonth() + 1 <= 9 ? '0' + (datetime.getMonth() + 1) : '' + (datetime.getMonth() + 1);
        var day = datetime.getDate() <= 9 ? '0' + datetime.getDate() : datetime.getDate();
        var hour = datetime.getHours() <= 9 ? '0' + datetime.getHours() : datetime.getHours();
        var min = datetime.getMinutes() <= 9 ? '0' + datetime.getMinutes() : datetime.getMinutes();
        return datetime.getFullYear() + '-' + mon + '-' + day + ' ' + hour + ':' + min;
    }
});