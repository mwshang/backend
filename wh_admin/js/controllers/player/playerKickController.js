
app.controller('playerKickController', ['$scope','request','dialog', function($scope, request ,dialog) {
    //获取用户信息
    $scope.user = app['user'];
    //判断用户是否登录
    if ($scope.user === null || $scope.user === undefined) {
        $state.go('access.signin');
        return;
    }
    //页面显示的用户昵称
    $scope.userName = '';
    //页面显示控制器
    $scope.inited = false;
    //查询昵称
    $scope.getUserName = function () {
        //判断uid是否为空
        if (this.uid === null || this.uid === undefined || this.uid === ''){
            dialog.showError('错误', '玩家UID不能为空');
            return;
        }
        //查询接口
        request.request('/player/getPlayer', {uid: $scope.user.uid, pid: this.uid})
            .then( function(data) {
                if (data !== null) {
                    console.log(data);
                    $scope.userName = data.nickName;
                    $scope.inited = true;
                } else {
                    dialog.showError('错误', '没有找到该玩家');
                }
            });
    };

    //踢出房间
    $scope.kick = function(){
        //判断是否已经查询过玩家
        if ($scope.userName == null || $scope.userName == undefined || $scope.userName == ''){
            dialog.showError('错误', '请先读取玩家昵称');
            return;
        }
        //判断uid是否为空
        if (this.uid == null || this.uid == undefined || this.uid == '' || !/^([1-9][0-9]*)$/.test(this.uid)){
            dialog.showError('错误', '请填写正确的玩家UID');
            return;
        }
        // todo:等待接口完成
        dialog.showError('错误','功能尚未开放,敬请期待!');
        return;

        //请求接口 踢出房间
        request.request('/user/donateCards', {uid: $scope.user.uid, pid:this.uid, gem: this.diamond})
            .then( function( result){
                if (result == 1) {
                    dialog.showSuccess('', '踢出成功!');
                    return;
                }
                if (result == 0) {
                    dialog.showError('', '踢出失败!');
                    return;
                }
            });

    }

}]);