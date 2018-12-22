
app.controller('revenueStatisticsController', ['$scope', '$http', '$state', '$stateParams', '$timeout', '$modal','request','dialog',
    function($scope, $http, $state, $stateParams, $timeout,$modal, request, dialog) {
        //获取用户信息
        $scope.user = app["user"];
        $scope.pid = parseInt($stateParams.pid);

        //判断用户是否登录
        if ($scope.user === null || $scope.user === undefined) {
            $state.go('access.signin');
            return;
        }

        //获取营收统计表数据
        request.request('/data/operatordata', {uid: $scope.user.uid})
            .then(function (data){
                $scope.itemToday = data.today;
                $scope.itemYesterday = data.yesterday;
                $scope.itemWeek = data.week;
                $scope.itemHalfMonth = data.halfMonth;
                $scope.itemCurMonth = data.month;
                $scope.itemLastMonth = data.lastMonth;
                $scope.itemYear = data.year;
            });

        //获取分成比例
        request.request("/settings/load", {}, false)
            .then(function(data) {
                if (data !== null) {
                    var sharing = data.opcpSharing.split(':');
                    $scope._opcpSharing = parseInt(sharing[0]) / (parseInt(sharing[0]) + parseInt(sharing[1]));
                }
                return null;
            });


        //开发商分成
        $scope.cpSharing = function(item) {
            var v = (item.incomeTotal-item.apBonusIn) * (1 - $scope._opcpSharing);
            return v.toFixed(2);
        };


        //运营商分成
        $scope.opSharing = function(item) {
            var v = (item.incomeTotal-item.apBonusIn) * $scope._opcpSharing;
            return v.toFixed(2);
        };


        //代理佣金
        $scope.apBonus = function(item) {
            if (item.apBonusIn === null)
                return 0.00;
            else {
                var v = item.apBonusIn;
                return v.toFixed(2);
            }
        }



    }]);
