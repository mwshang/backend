
app.controller('todayDataModalController', ['$scope', '$modalInstance','request', function($scope, $modalInstance, request ) {
    //获取用户信息
    $scope.user = app['user'];
    //关闭模态框
    $scope.cancel = function () {
        $modalInstance.close();
    };
    //页面载入
    $scope.inited = false;
    //显示运营数据

    $scope.refresh = function(){
        $scope.inited = false;
        refreshAction();
    };

    function refreshAction() {
        request.request('/data/operatordata', {uid: app["user"].uid})
            .then(function (data) {
                if (data.today != null) {
                    $scope.itemsToday = [
                        {icon: 'fa fa-plus', color: 'green', title: '充钻数', num: data.today.buyCards, hasMore: true},
                        {icon: 'fa fa-minus', color: 'red', title: '耗钻数', num: data.today.usedCards, hasMore: true},
                        {icon: 'icon-diamond', color: 'red', title: '剩余钻数', num: data.today.leftCards, hasMore: true},
                        {
                            icon: 'fa fa-toggle-right',
                            color: 'blue',
                            title: '开局数',
                            num: data.today.openTables,
                            hasMore: true
                        },
                        {icon: 'fa fa-child', color: 'green', title: '新增玩家', num: data.today.newUsers, hasMore: true},
                        {
                            icon: 'fa fa-users',
                            color: 'green',
                            title: '活跃玩家',
                            num: data.today.activeUsers,
                            hasMore: true
                        },
                    ];
                }
                //刷新页面
                $scope.inited = true;
            });
    }

    //搜东刷新
    refreshAction();

}]);