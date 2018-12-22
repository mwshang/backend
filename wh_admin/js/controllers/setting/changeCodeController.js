'use strict';

/* Controllers */
app.controller('changeCodeController', ['$scope', '$http', '$state', '$localStorage', '$timeout', 'request', 'dialog', function ($scope, $http, $state, $localStorage, $timeout, request, dialog) {
    $scope.userName = '';
    $scope.user = app["user"];
    //判断用户是否登录
    if ($scope.user === null || $scope.user === undefined) {
        $state.go('access.signin');
        return;
    }
    //查询昵称
    $scope.getUserName = function (uid) {
        //判断uid是否为空
        if (uid === null || uid === undefined || uid === '') {
            dialog.showError('错误', '玩家UID不能为空!');
            return;
        }
        //查询接口
        request.request('/player/getPlayer', {uid: $scope.user.uid, pid: uid})
            .then(function (data) {
                if (data !== null) {
                    $scope.userName = data.nickName;
                }
            });
    };
    //修改验证码
    $scope.changeCode = function(){
        if (!/^([1-9][0-9]*)$/.test($scope.code) ){
            dialog.showError('', '请填写新的邀请码!');
            return;
        }
        request.request('/user/bind', {uid: $scope.uid, inviteCode:$scope.code, allowChange: true})
            .then(function( result){
                if (result === 1) {
                    dialog.showSuccess('', '修改成功!');
                    return;
                } else if (result === 0) {
                    dialog.showError('', '修改失败!');
                    return;
                }
            });
    }

}]);