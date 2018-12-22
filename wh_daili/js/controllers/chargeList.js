/**
 * Created by Administrator on 2017/9/8 0008.
 */
app.controller('chargeListController', ['$scope', '$http', '$state', 'request', 'dialog',
    function ($scope, $http, $state, request, dialog) {
        $scope.user = app["user"];
        var date = new Date();
        var str = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
        $scope.dateBegin = str;
        $scope.dateEnd = str;
        $scope.openedStart = false;
        $scope.openedEnd = false;
        $scope.format = "yyyy/MM/dd";
        $scope.altInputFormats = ['yyyy/M!/d!'];
        $scope.searchUid = "";
        $scope.total = 0;
        //跳转到首页
        $scope.pageClear = false;
        //日期选择组件
        $scope.openStart = function () {
            $scope.openedStart = true;
        };
        $scope.openEnd = function () {
            $scope.openedEnd = true;
        };

        $scope.initDate = date;
        $scope.total = 0;
        // page roll
        $scope.pageId = 0;
        $scope.pageSize = 10;
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

            if ($scope.searchFlag === 'byUid') {
                searchByUIDAction();
            } else {
                searchByDateAction();
            }
        };

        //日期搜索按钮
        $scope.searchByDate = function () {
            //是否清除页面
            $scope.pageClear = true;
            searchByDateAction()
        };

        //日期搜索
        function searchByDateAction() {
            var begin = new Date($scope.dateBegin);
            var end = new Date($scope.dateEnd);
            var cond = {uid: $scope.user.uid, pageSize: $scope.pageSize};

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

            $scope.searchFlag = "byDate";

            request.request('/user/getCharges', cond, true)
                .then(function (data) {
                    if (!data) return;
                    $scope.players = data.data.charges != null ? data.data.charges : [];
                    $scope.pageId = data.page.id;
                    $scope.pageNum = data.page.num;
                    //计算当页总金额
                    $scope.getTotoalChargeAmount($scope.players);
                    $scope.total = data.data.totalAmount;

                });
        }

        //用户UID搜索按钮
        $scope.searchByUID = function () {
            //是否清除页面
            $scope.pageClear = true;
            searchByUIDAction()
        };

        //用户UID搜索
        function searchByUIDAction() {
            if ($scope.searchUid !== null && $scope.searchUid.length > 0) {
                $scope.searchFlag = "byUid";
                var cond = {uid: $scope.user.uid, pid: $scope.searchUid, pageSize: $scope.pageSize};
                if ($scope.dateBegin !== null && $scope.dateEnd !== null) {
                    var begin = new Date($scope.dateBegin);
                    var end = new Date($scope.dateEnd);
                    var strBegin = begin.getFullYear() + '/' + (begin.getMonth() + 1) + '/' + begin.getDate();
                    var strEnd = end.getFullYear() + '/' + (end.getMonth() + 1) + '/' + end.getDate();
                    cond['begin'] = strBegin;
                    cond['end'] = strEnd;
                }
                console.log(cond);
                //判断是否需要刷新初始页面
                if ($scope.pageClear) {
                    //刷新初始页面
                    $scope.pageId = 0;
                    //还原刷新开关
                    $scope.pageClear = false;
                }
                cond['pageId'] = $scope.pageId;
                //请求数据接口
                request.request('/user/getCharge', cond, true)
                    .then(function (data) {
                        if (!data) return;
                        $scope.players = data.data !== null ? data.data : [];
                        $scope.pageId = data.page.id;
                        $scope.pageNum = data.page.num;
                        //计算当页总金额
                        $scope.getTotoalChargeAmount($scope.players);
                        $scope.total = $scope.totoalChargeAmount
                    });
            } else {
                dialog.showError("", "请输入UID");
            }
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
                $scope.totoalChargeAmount = 0;
                return;
            }
            var totoalChargeAmount = 0;
            //计算总金额
            data.map(function (value) {
                totoalChargeAmount += value.chargeAmount
            });
            $scope.totoalChargeAmount = totoalChargeAmount;
        };

        //页面初始化
        searchByDateAction();

    }]);