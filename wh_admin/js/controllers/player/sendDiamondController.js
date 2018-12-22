app.controller('sendDiamondController', ['$scope', 'request', 'dialog', 'toaster', function ($scope, request, dialog, toaster) {
    //获取用户信息
    $scope.user = app['user'];
    //判断用户是否登录
    if ($scope.user === null || $scope.user === undefined) {
        $state.go('access.signin');
        return;
    }
    //页面显示的用户昵称
    $scope.userName = '';
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
                    $scope.userName = data.nickName;
                } else {
                    dialog.showError('错误', '没有找到该玩家');
                }
            });
    };

    //发送钻石
    $scope.sendDiamond = function(){
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
        //判断钻石是否
        if (this.diamond == null || this.diamond == undefined || this.diamond == ''){
            dialog.showError('错误', '钻石数量不能为空');
            return;
        }
        if (this.diamond < 0){
            dialog.showError('错误', '钻石数量不正确');
            return;
        }
        if ($scope.user.isAgent && this.gemNum > $scope.user.gemNum){
            dialog.showError('错误', '您的钻石不够了!');
            return;
        }
        //防止误操作
        toaster.clear();
        toaster.pop('wait', '', '正在操作,请稍后', 100000);
        $('.sendDiamond').attr('disabled',"disabled");
        //请求接口 发送钻石
        request.request('/user/donateCards', {uid: $scope.user.uid, pid:this.uid, gem: this.diamond})
            .then( function( result){
                if (result == 1) {
                    dialog.showSuccess('', '发钻成功!');
                }
                if (result == 0) {
                    dialog.showError('', '发钻失败!');
                }
                $('.sendDiamond').attr('disabled',false);
                return;
            });

    }

}]);