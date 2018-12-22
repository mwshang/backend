'use strict';
app.controller('sendDiamondListController', ['$scope', '$http', '$state', 'request', 'dialog',
    function ($scope, $http, $state, request, dialog) {
        $scope.user = app["user"];
        //判断用户是否登录
        if ($scope.user === null || $scope.user === undefined) {
            $state.go('access.signin');
            return;
        }
        $scope.pid = '';
        //页面显示开关
        $scope.inited = false;
        //根据时间搜索 组件参数
        var date = new Date();
        var str = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
        $scope.dateBegin = str;
        $scope.dateEnd = str;
        $scope.openedStart = false;
        $scope.openedEnd = false;
        $scope.format = "yyyy/MM/dd";
        $scope.altInputFormats = ['yyyy/M!/d!'];
        $scope.openStart = function () {
            $scope.openedStart = true;
        };
        $scope.openEnd = function () {
            $scope.openedEnd = true;
        };

        //分页ID
        $scope.pageId = 0;
        //每页显示的数量
        $scope.pageSize = 20;
        //初始页码
        $scope.pageNum = 1;
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
            //搜索条件
            var cond = {uid: $scope.user.uid, pid: $scope.pid, pageId: $scope.pageId, pageSize: $scope.pageSize};
            //调用接口
            searchAction(cond)
        };

        //初始化时间
        $scope.initDate = date;

        //查询按钮 (重置页码)
        $scope.searchDate = function () {
            //是否清除页面
            $scope.pageClear = true;
            searchAction()
        };

        function searchAction(cond) {
            //判断是否存在搜索条件
            var cond = arguments[0] ? arguments[0] : {
                uid: $scope.user.uid,
                pid: $scope.pid,
                pageId: 0,
                pageSize: $scope.pageSize
            };
            var begin = new Date($scope.dateBegin);
            var end = new Date($scope.dateEnd);
            //判断起始时间
            if (begin > end) {
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
            if (cond['begin'] !== cond['end'] && $scope.pid === '') {
                dialog.showError("错误", "多代理查询仅支持单天");
                return;
            }
            //判断是否需要刷新初始页面
            if ($scope.pageClear) {
                //刷新初始页面
                $scope.pageId = 0;
                //还原刷新开关
                $scope.pageClear = false;
            }
            cond['pageId'] = $scope.pageId;

            //获取发送钻石列表
            request.request('/user/donates_v2', cond, true)
                .then(function (data) {
                    console.log(data);
                    $scope.records = data.data !== null ? data.data : [];
                    $scope.pageId = data.page.id;
                    $scope.pageNum = data.page.num;
                    //打开页面
                    $scope.inited = true;
                });

        }
        //初始刷新
        searchAction();

    }]);