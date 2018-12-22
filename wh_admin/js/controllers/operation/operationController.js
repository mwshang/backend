
app.controller('operationController', ['$scope', '$http', '$state', '$stateParams', '$timeout', '$modal','request','dialog',
    function($scope, $http, $state, $stateParams, $timeout,$modal, request, dialog) {
        //获取用户信息
        $scope.user = app["user"];
        //判断用户是否登录
        if ($scope.user == null || $scope.user == undefined) {
            $state.go('access.signin');
            return;
        }

        //获取一小时动态 请求服务器
        request.request('/data/operatordata2' , {uid: app["user"].uid, type: 'hour', date: 0, hour: -1} )
            .then(function(data){
                $scope.itemsHourData = data != null ? data : [];
            });

        //显示运营数据
        request.request('/data/operatordata', {uid: app["user"].uid})
            .then( function( data) {
                console.log(data);
                if (data.today != null) {
                    $scope.itemsToday = [
                        {icon: 'fa fa-plus', color: 'green', title: '充钻数', num: data.today.buyCards, hasMore: true},
                        {icon: 'fa fa-minus', color: 'red', title: '耗钻数', num: data.today.usedCards, hasMore: true},
                        {icon: 'icon-diamond', color: 'red', title: '剩余钻数', num: data.today.leftCards, hasMore: true},
                        {icon: 'fa fa-toggle-right', color: 'blue', title: '开局数', num: data.today.openTables, hasMore: true},
                        {icon: 'fa fa-child', color: 'green', title: '新增玩家', num: data.today.newUsers, hasMore: true},
                        {icon: 'fa fa-users', color: 'green', title: '活跃玩家', num: data.today.activeUsers, hasMore: true},
                    ];
                }
                if (data.yesterday != null) {
                    $scope.itemsYesterday = [
                        {icon: 'fa fa-plus', color: 'green', title: '充钻数', num: data.yesterday.buyCards, hasMore: true},
                        {icon: 'fa fa-minus', color: 'red', title: '耗钻数', num: data.yesterday.usedCards, hasMore: true},
                        {icon: 'fa fa-toggle-right', color: 'blue', title: '开局数', num: data.yesterday.openTables, hasMore: true},
                        {icon: 'fa fa-child', color: 'green', title: '新增玩家', num: data.yesterday.newUsers, hasMore: true},
                        {icon: 'fa fa-users', color: 'green', title: '活跃玩家', num: data.yesterday.activeUsers, hasMore: true},
                    ];
                }
                if (data.week != null) {
                    $scope.itemsWeek = [
                        {icon: 'fa fa-plus', color: 'green', title: '充钻数', num: data.week.buyCards, hasMore: true},
                        {icon: 'fa fa-minus', color: 'red', title: '耗钻数', num: data.week.usedCards, hasMore: true},
                        {icon: 'fa fa-toggle-right', color: 'blue', title: '开局数', num: data.week.openTables, hasMore: true},
                        {icon: 'fa fa-child', color: 'green', title: '新增玩家', num: data.week.newUsers, hasMore: true},
                        {icon: 'fa fa-users', color: 'green', title: '活跃玩家', num: data.week.activeUsers, hasMore: true},
                    ];
                }
                if (data.halfMonth != null) {
                    $scope.itemsHalfMonth = [
                        {icon: 'fa fa-plus', color: 'green', title: '充钻数', num: data.halfMonth.buyCards, hasMore: true},
                        {icon: 'fa fa-minus', color: 'red', title: '耗钻数', num: data.halfMonth.usedCards, hasMore: true},
                        {icon: 'fa fa-toggle-right', color: 'blue', title: '开局数', num: data.halfMonth.openTables, hasMore: true},
                        {icon: 'fa fa-child', color: 'green', title: '新增玩家', num: data.halfMonth.newUsers, hasMore: true},
                        {icon: 'fa fa-users', color: 'green', title: '活跃玩家', num: data.halfMonth.activeUsers, hasMore: true},
                    ];
                }
                if (data.month != null) {
                    $scope.itemsCurMonth = [
                        {icon: 'fa fa-plus', color: 'green', title: '充钻数', num: data.month.buyCards, hasMore: true},
                        {icon: 'fa fa-minus', color: 'red', title: '耗钻数', num: data.month.usedCards, hasMore: true},
                        {icon: 'fa fa-toggle-right', color: 'blue', title: '开局数', num: data.month.openTables, hasMore: true},
                        {icon: 'fa fa-child', color: 'green', title: '新增玩家', num: data.month.newUsers, hasMore: true},
                        {icon: 'fa fa-users', color: 'green', title: '活跃玩家', num: data.month.activeUsers, hasMore: true},
                    ];
                }
                if (data.lastMonth != null) {
                    $scope.itemsLastMonth = [
                        {icon: 'fa fa-plus', color: 'green', title: '充钻数', num: data.lastMonth.buyCards, hasMore: true},
                        {icon: 'fa fa-minus', color: 'red', title: '耗钻数', num: data.lastMonth.usedCards, hasMore: true},
                        {icon: 'fa fa-toggle-right', color: 'blue', title: '开局数', num: data.lastMonth.openTables, hasMore: true},
                        {icon: 'fa fa-child', color: 'green', title: '新增玩家', num: data.lastMonth.newUsers, hasMore: true},
                        {icon: 'fa fa-users', color: 'green', title: '活跃玩家', num: data.lastMonth.activeUsers, hasMore: true},
                    ];
                }
                if (data.year != null) {
                    $scope.itemsYear = [
                        {icon: 'fa fa-plus', color: 'green', title: '充钻数', num: data.year.buyCards, hasMore: true},
                        {icon: 'fa fa-minus', color: 'red', title: '耗钻数', num: data.year.usedCards, hasMore: true},
                        {icon: 'fa fa-toggle-right', color: 'blue', title: '开局数', num: data.year.openTables, hasMore: true},
                        {icon: 'fa fa-child', color: 'green', title: '新增玩家', num: data.year.newUsers, hasMore: true},
                        {icon: 'fa fa-users', color: 'green', title: '活跃玩家', num: data.year.activeUsers, hasMore: true},
                    ];
                }
            });


        //点击事件 触发弹出页面 查询详情
        $scope.openIndexModal = function (dateType) {
            var modalInstance = $modal.open({
                templateUrl: 'operationModal.html',
                controller: 'operationModalController',
                resolve: {
                    dataType: function () {
                        return dateType;
                    }
                }
            });
        };


        //跳转到代理列表 所传参数
        $scope.openAgents = function () {
            $state.go("app.agentList", {pid:app.user.uid});
        };
        //用户等级
        $scope.getLevel = function(level) {
            switch (level) {
                case 1:
                    return '高级运营';
                case 2:
                    return '中级运营';
                case 3:
                    return '普通运营';
            }
        };

    }]);
//时间筛选器 输出输出格式 H:m
app.filter('myTimePipe', function() {
    return function(time) {
        var datetime = new Date(time);
        var hour = datetime.getHours() <= 9 ? '0'+datetime.getHours() : datetime.getHours();
        var min = datetime.getMinutes() <= 9 ? '0'+datetime.getMinutes() : datetime.getMinutes();
        return hour + ':' + min;
    }
});
