'use strict';
app.controller('playerLockListController', ['$scope', '$http', '$state', '$timeout', '$modal', '$stateParams', 'request', 'dialog',
    function ($scope, $http, $state, $timeout, $modal, $stateParams, request, dialog) {
        $scope.user = app["user"];
        //判断用户是否登录
        if ($scope.user === null || $scope.user === undefined) {
            $state.go('access.signin');
            return;
        }
        //初始修改的uid
        $scope.EditAgentUid = '';
        //默认搜索数据
        $scope.searchUID = '';
        //总页面开关
        $scope.inited = false;

        //页面刷新控制
        $scope.inited = false;

        //分页初始化
        $scope.pageId = 0;
        //页面显示条数
        $scope.pageSize = 20;
        //总页面
        $scope.pageNum = 1;
        //是否清除页面
        $scope.pageClear = false;


        //分页逻辑
        $scope.pageroll = function (id) {
            //如果是通过uid搜索 则不翻页
            if ($scope.searchFlag === 'byUid') {
                return;
            }
            //翻页计算
            switch (id) {
                //首页
                case 0:
                    $scope.pageId = 0;
                    break;
                //上一页
                case -1:
                    if ($scope.pageId > 0)
                        $scope.pageId -= 1;
                    break;
                //下一页
                case 1:
                    if ($scope.pageId < $scope.pageNum - 1)
                        $scope.pageId += 1;
                    break;
                //最后一页
                case 2:
                    $scope.pageId = $scope.pageNum - 1;
                    break;
            }
            $scope.getLockedList();
        };


        //根据uid 查找玩家
        $scope.searchByUID = function () {
            //分页初始化
            $scope.pageId = 0;
            //总页面
            $scope.pageNum = 1;
            //判断是否为空
            if ($scope.searchUID === '') {
                dialog.showError('', '请输入玩家UID');
                return;
            }
            //配置查询条件
            var cond = {uid: $scope.user.uid, pid: $scope.searchUID};
            request.request('/player/getLockedPlayer', cond, true)
                .then(function (data) {
                    if (data) {
                        // 设置搜索关键字
                        $scope.searchFlag = 'byUid';
                        $scope.players = data.data;
                        return;
                    }
                    dialog.showError('', '该封号玩家不存在');
                    return;
                });
        };


        //封号列表
        $scope.getLockedList = function () {
            var cond = {uid: $scope.user.uid, pageId: $scope.pageId, pageSize: $scope.pageSize};
            request.request('/player/getLockedPlayerList', cond, true)
                .then(function (data) {
                    console.log(data);
                    $scope.players = data ? data.data : '';
                    $scope.pageId = data.page.id;
                    $scope.pageNum = data.page.num;
                    $scope.searchFlag = 'list';
                    $scope.inited = true;
                });
        };


        //页面首次搜索
        $scope.getLockedList();

        //解封 (传输解封玩家 id 和 nickName)
        $scope.playerUnlock = function (uid , nickName) {
            console.log(uid , nickName);
            var modalInstance = $modal.open({
                templateUrl: 'playerUnlockModal.html',
                controller: 'playerUnlockModalController',
                resolve: {
                    pid: function () {
                        return uid;
                    },
                    nickName: function () {
                        return nickName;
                    }
                }
            });

            //获取模态框返回值进行解封
            modalInstance.result.then(function (data) {
                //判断是否成功 如果成功则刷新 不成功 保持原状
                if (data.res === 1){
                    //刷新页面
                    $scope.getLockedList();
                }
            });
        };

    }]);

//时间筛选器 输出输出格式 Y-M-d-H:m
app.filter('myTime', function () {
    return function (time) {
        if (time === '') {
            return '';
        }
        var datetime = new Date(time);
        var mon = datetime.getMonth() + 1 <= 9 ? '0' + (datetime.getMonth() + 1) : '' + (datetime.getMonth() + 1);
        var day = datetime.getDate() <= 9 ? '0' + datetime.getDate() : datetime.getDate();
        var hour = datetime.getHours() <= 9 ? '0' + datetime.getHours() : datetime.getHours();
        var min = datetime.getMinutes() <= 9 ? '0' + datetime.getMinutes() : datetime.getMinutes();
        return datetime.getFullYear() + '-' + mon + '-' + day + ' ' + hour + ':' + min;
    }
});