
app.controller('releaseArenaController', ['$scope','request','dialog', function($scope, request ,dialog) {
    //获取用户信息
    $scope.user = app['user'];
    //判断用户是否登录
    if ($scope.user === null || $scope.user === undefined) {
        $state.go('access.signin');
        return;
    }
    //设置选择框空属性
    $scope.inited = false;
    //解散房间
    $scope.releaseRoom = function () {
        //判断表单是否合法
        if( $scope.roomID === undefined || $scope.roomID === null){
            dialog.showError('', '请输入比赛场ID!');
            return;
        }
        //请求解散房间接口
        request.request('/gameop/closeRoom', {
            uid: $scope.user.uid,
            arenaId: $scope.roomID,
            tableId: $scope.roomID,
            serverType: $scope.selected,//todo:选择type缺失
            type: 2 //1:解散房间 2:解散比赛场
        })
            .then( function (data){
                if (data === 1) {
                    dialog.showSuccess('', '解散成功!');
                    return;
                } else {
                    dialog.showError('', '解散失败!');
                    return;
                }
            });
    }



}]);