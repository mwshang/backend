app.controller('operationDataController', ['$scope', '$http', '$state', '$stateParams', '$modal', '$timeout', 'request', 'dialog',
    function ($scope, $http, $state, $stateParams, $modal, $timeout, request, dialog) {
        $scope.user = app["user"];
        //判断用户是否登录
        if ($scope.user === null || $scope.user === undefined) {
            $state.go('access.signin');
            return;
        }
        //被查对象默认为空 可查看所有
        $scope.pid = '';
        var date = new Date();
        var str = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + (date.getDate() - 1);
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
            if ($scope.searchFlag === 'byDate') {
                //调用日期查询接口
                searchByDataAction()
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

        //查询
        function searchByDataAction() {
            var today = new Date();
            var begin = new Date($scope.dateBegin);
            var end = new Date($scope.dateEnd);
            var cond = {uid: $scope.user.uid, pageId: $scope.pageId, pageSize: $scope.pageSize};
            //判断起始时间
            if (begin > end) {
                dialog.showError("错误", "起始日期不能大于截止日期");
                return;
            }
            //如果时间不为空 且起始时间存在 进行设置
            else if ($scope.dateBegin !== null && $scope.dateEnd !== null) {
                var strBegin = begin.getFullYear() + '/' + (begin.getMonth() + 1) + '/' + (begin.getDate() + 1);
                var strEnd = end.getFullYear() + '/' + (end.getMonth() + 1) + '/' + (end.getDate() + 1);
                cond['begin'] = strBegin;
                cond['end'] = strEnd;
            }
            //起始时间不存在 默认为昨天
            else if ($scope.dateBegin === null || $scope.dateEnd === null) {
                var yesterday = new Date();
                var _yesterday = yesterday.getFullYear() + '/' + (yesterday.getMonth() + 1) + '/' + (yesterday.getDate() + 1);
                cond['begin'] = _yesterday;
                cond['end'] = _yesterday;
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
            request.request('/data/operatordata_v2', cond, true)
                .then(function (data) {
                    $scope.records = data.data.data !== null ? data.data.data : [];
                    $scope.avg = data.data.avg !== null ? data.data.avg : [];
                    console.log($scope.records);
                    console.log($scope.avg);
                    $scope.pageId = data.page.id;
                    $scope.pageNum = data.page.num;
                    //打开页面
                    $scope.inited = true;
                });
        }

        //初始刷新
        searchByDataAction();

        //获取当日实时信息
        $scope.openTodayDataModal = function () {
            var modalInstance = $modal.open({
                templateUrl: 'todayDataModal.html',
                controller: 'todayDataModalController',
                resolve: {
                    dataType: function () {
                        return '今日实时信息';
                    }
                }
            });
        };

        //获取详情
        $scope.operationDetail = function (time) {
            var modalInstance = $modal.open({
                templateUrl: 'operationDetailModal.html',
                controller: 'operationDetailModalController',
                resolve: {
                    time: function () {
                        return time;
                    }
                }
            });
        }

    }]);