app.controller('indexController', ['$scope', '$http', '$state', '$stateParams', '$timeout', '$modal', 'request', 'dialog',
    function ($scope, $http, $state, $stateParams, $timeout, $modal, request, dialog) {
        //获取用户信息
        $scope.user = app["user"];
        //判断用户是否登录
        if ($scope.user == null || $scope.user == undefined) {
            $state.go('access.signin');
            return;
        }

        //显示运营数据operatordata
        function operatordata() {
            request.request('/data/operatordata', {uid: app["user"].uid})
                .then(function (data) {
                    if (data.today != null) {
                        $scope.itemsToday = [
                            {icon: 'fa fa-plus', color: 'green', title: '充钻数', num: data.today.buyCards, hasMore: true},
                            {icon: 'fa fa-minus', color: 'red', title: '耗钻数', num: data.today.usedCards, hasMore: true},
                            {
                                icon: 'icon-diamond',
                                color: 'red',
                                title: '剩余钻数',
                                num: data.today.leftCards,
                                hasMore: true
                            },
                            {
                                icon: 'fa fa-toggle-right',
                                color: 'blue',
                                title: '开局数',
                                num: data.today.openTables,
                                hasMore: true
                            },
                            {
                                icon: 'fa fa-child',
                                color: 'green',
                                title: '新增玩家',
                                num: data.today.newUsers,
                                hasMore: true
                            },
                            {
                                icon: 'fa fa-users',
                                color: 'green',
                                title: '活跃玩家',
                                num: data.today.activeUsers,
                                hasMore: true
                            },
                        ];
                    }
                });
        }

        //运营30天数据
        function operatordataMounth(){
            var begin = new Date();
            begin.setDate(1);
            var end = new Date();
            var strBegin = begin.getFullYear() + '/' + (begin.getMonth() + 1) + '/' + (begin.getDate() + 1);
            var strEnd = end.getFullYear() + '/' + (end.getMonth() + 1) + '/' + (end.getDate() + 1);
            var cond = {uid: $scope.user.uid, pageId: 0, pageSize: 31, begin: strBegin, end: strEnd};
            //调用接口请求
            request.request('/data/operatordata_v2', cond, true)
                .then(function (data) {
                    $scope.records = data.data.data !== null ? data.data.data : [];
                    $scope.avg = data.data.avg !== null ? data.data.avg : [];
                });
        }

        //跳转到代理列表 所传参数
        $scope.openAgents = function () {
            $state.go("app.agentList", {pid: app.user.uid});
        };

        //用户等级
        $scope.getLevel = function (level) {
            switch (level) {
                case 1:
                    return '高级运营';
                case 2:
                    return '中级运营';
                case 3:
                    return '普通运营';
            }
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
        };

        //刷新按钮
        $scope.refresh = function () {
            operatordata();
            revenue();
        };

        //6小时动态
        request.request('/data/operatordata2', {uid: $scope.user.uid, type: 'daily', month: 0, date: 0, days: ''})
        //接受返回数据
            .then(function (data) {
                var today = new Date();
                var hour = today.getHours();
                console.log(typeof(hour));
                //判断是否大于5
                if (hour >= 6) {
                    $scope.itemsHourData = data.slice(hour - 5, hour + 1);
                } else {
                    $scope.itemsHourData = data.slice(0, hour + 1);
                }
            });

        //获取今日的实时流水
        function revenue (){
            request.request('/data/operatordata', {uid: $scope.user.uid})
                .then(function (data){
                    $scope.itemToday = data.today;
                });
        }

        operatordata();
        operatordataMounth();
        revenue();

    }]);
//时间筛选器 输出输出格式 H:m
app.filter('myTimePipe', function () {
    return function (time) {
        var datetime = new Date(time);
        var hour = datetime.getHours() <= 9 ? '0' + datetime.getHours() : datetime.getHours();
        var min = datetime.getMinutes() <= 9 ? '0' + datetime.getMinutes() : datetime.getMinutes();
        return hour + ':' + min;
    }
});
