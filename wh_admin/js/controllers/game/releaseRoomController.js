
app.controller('releaseRoomController', ['$scope','request','dialog', function($scope, request ,dialog) {
    //获取用户信息
    $scope.user = app['user'];
    //判断用户是否登录
    if ($scope.user === null || $scope.user === undefined) {
        $state.go('access.signin');
        return;
    }
    //设置选择框空属性
    $scope.inited = false;
    //获取房间类型
    request.request('/gameop/getServerTypes', {})
        .then(function(data) {
            console.log(data);
            //判断数据为空
            if (data === null || data === undefined ){
               return;
            }
            $scope.selectArr = [];
            //重组
            data.map(function(value){
                var arr = [];
                arr['aka'] = Object.keys(value)[0];
                arr['name'] = value[arr['aka']];
                $scope.selectArr.push(arr);
            });
            $scope.inited = true;
        });

    //解散房间
    $scope.releaseRoom = function () {
        //判断表单是否合法
        if ($scope.selected === undefined || $scope.selected === null){
            dialog.showError('', '请选择房间类型!');
            return;
        }
        if( $scope.roomID === undefined || $scope.roomID === null){
            dialog.showError('', '请输入房间ID!');
            return;
        }
        console.log('111');
        //请求解散房间接口
        request.request('/gameop/closeRoom', {
            uid: $scope.user.uid,
            arenaId: $scope.roomID,
            tableId: $scope.roomID,
            serverType: $scope.selected,
            type: 1 //1:解散房间 2:解散比赛场
        })
            .then( function (data){
                console.log(data);
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