app.controller('playerRecordDetailController', ['$scope', '$http', '$state', '$modal', 'request', 'dialog',
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
        $scope.searchUID = '';
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

            //调用日期查询接口
            searchByDataAction()
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
            //查询接口

            var begin = new Date($scope.dateBegin);
            var end = new Date($scope.dateEnd);
            var cond = {uid: $scope.user.uid, pageId: $scope.pageId, pageSize: $scope.pageSize};
            //判断起始时间
            if (begin > end) {
                console.log("起始日期不能大于截止日期");
                dialog.showError("错误", "起始日期不能大于截止日期");
                return;
            }
            if ($scope.searchUID == '') {
                dialog.showError("错误", "请输入玩家UID");
                return;
            }
            cond['pid'] = $scope.searchUID;
            //如果时间不为空 且起始时间存在 进行设置
            if ($scope.dateBegin !== null && $scope.dateEnd !== null) {
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
            console.log(cond);
            request.request('/data/playerdata_detail', cond, true)
                .then(function (data) {
                    console.log(data);
                    if (!data.data && ($scope.searchUID != '')) {
                        dialog.showError("错误", "该玩家不存在");
                        return;
                    }
                    $scope.players = data.data !== null ? data.data : [];
                    $scope.pageId = data.page.id;
                    $scope.pageNum = data.page.num;
                    //打开页面
                    $scope.inited = true;
                });
        }

        //首次进入执行
        searchByDataAction();


        //刷新按钮
        $scope.refresh = function () {
            if ($scope.searchFlag === 'byUid') {
                $scope.searchByUID();
            } else {
                searchByDataAction();
            }
        };

        //胜率格式化
        $scope.getratio = function (num) {
            var num = num * 100;
            return (num.toFixed(2)) + '%';
        };

        $scope.recordDetail = function (array) {
            var modalInstance = $modal.open({
                templateUrl: 'playerRecordDetailModal.html',
                controller: 'playerRecordDetailModalController',
                resolve: {
                    data: function () {
                        return array;
                    }
                }
            })
        };
    }]);
//时间筛选器 输出输出格式 Y-M-d-H:m
app.filter('myTime', function () {
    return function (time) {
        if (time === '') {
            return '新用户,暂无充值记录';
        }
        var datetime = new Date(time);
        var mon = datetime.getMonth() + 1 <= 9 ? '0' + (datetime.getMonth() + 1) : '' + (datetime.getMonth() + 1);
        var day = datetime.getDate() <= 9 ? '0' + datetime.getDate() : datetime.getDate();
        var hour = datetime.getHours() <= 9 ? '0' + datetime.getHours() : datetime.getHours();
        var min = datetime.getMinutes() <= 9 ? '0' + datetime.getMinutes() : datetime.getMinutes();
        return datetime.getFullYear() + '-' + mon + '-' + day + ' ' + hour + ':' + min;
    }
});