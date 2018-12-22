app.controller('operationDetailModalController', ['$scope', '$http', '$state', '$stateParams', '$modal', '$timeout', '$modalInstance', 'request', 'toaster', 'time',
    function ($scope, $http, $state, $stateParams, $modal, $timeout, $modalInstance, request, toaster, time) {
        $scope.user = app["user"];
        $scope.title = time;
        //页面控制器
        $scope.none = false;
        $scope.init = false;
        //查询
        function searchByDataAction() {
            // 设置查找日期
            var searchTime = new Date(time);
            var condTime = searchTime.getFullYear() + '/' + (searchTime.getMonth() + 1) + '/' + (searchTime.getDate() + 1);
            var cond = {uid: $scope.user.uid, begin: condTime, end: condTime};
            // 调用接口请求
            request.request('/data/operatordata_bygame', cond, true)
                .then(function (data) {
                    if (data.data.data.length < 1) {
                        $scope.none = true;
                    } else {
                        $scope.records = data.data.data;
                        $scope.init = true;
                    }
                });
        }

        //初始刷新
        searchByDataAction();

        //关闭模态框
        $scope.cancel = function () {
            $modalInstance.close();
        };

    }]);




