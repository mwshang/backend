app.controller('gameNoticeController', ['$scope', '$http', '$state', '$stateParams', '$timeout', '$modal', 'request', 'dialog',
    function ($scope, $http, $state, $stateParams, $timeout, $modal, request, dialog) {
        //获取用户信息
        $scope.user = app["user"];
        $scope.pid = parseInt($stateParams.pid);

        //判断用户是否登录
        if ($scope.user === null || $scope.user === undefined) {
            $state.go('access.signin');
            return;
        }

        //获取游戏notice列表
        $scope.getNoticeList = function () {
            request.request('/gameop/notice', {uid: $scope.user.uid, type: 11})
                .then(function (notices) {
                    $scope.notices = notices;
                });
        };

        //点击事件 触发弹出页面 添加游戏通知
        $scope.openNoticeModal = function () {
            var modalInstance = $modal.open({
                templateUrl: 'gameNoticeModal.html',
                controller: 'gameNoticeModalController',
                resolve: {
                    dataType: function () {
                        return '游戏通知';
                    }
                }
            });
            //处理Modal回调
            modalInstance.result.then(function (data) {
                $scope.text = data.text;
                //判断通知信息是否为空
                if ($scope.text === null || $scope.text === undefined) {
                    dialog.showError('', '通知信息不能为空!');
                } else {
                    //请求数据接口
                    request.request('/user/sendNotice', {
                        uid: $scope.user.uid,
                        title: '',
                        contents: $scope.text,
                        type: 11,
                    })
                        .then(function (result) {
                            if (result === 1) {
                                dialog.showSuccess('', '发布成功!');
                            } else if (result === 0) {
                                dialog.showError('', '发布失败!');
                            }
                            //刷新页面数据
                            $scope.getNoticeList();
                        });
                }
            });
        };

        //初始刷新
        $scope.getNoticeList();

    }]);
//时间筛选器 输出输出格式 H:m
app.filter('myTimePipe', function () {
    return function (time) {
        var datetime = new Date(time);
        var mon = datetime.getMonth() + 1 <= 9 ? '0' + (datetime.getMonth() + 1) : '' + (datetime.getMonth() + 1);
        var day = datetime.getDate() <= 9 ? '0' + datetime.getDate() : datetime.getDate();
        var hour = datetime.getHours() <= 9 ? '0' + datetime.getHours() : datetime.getHours();
        var min = datetime.getMinutes() <= 9 ? '0' + datetime.getMinutes() : datetime.getMinutes();
        return datetime.getFullYear() + '-' + mon + '-' + day + ' ' + hour + ':' + min;
    }
});