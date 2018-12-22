
app.controller('shareRevenueController', ['$scope', '$http', '$state', 'request','dialog',
    function($scope, $http, $state, request,dialog) {
        $scope.user=app["user"];
        var date = new Date();
        var str= date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate();
        $scope.dateBegin = str;
        $scope.dateEnd = str;
        $scope.openedStart = false;
        $scope.openedEnd = false;
        $scope.format = "yyyy/MM/dd";
        $scope.altInputFormats = ['yyyy/M!/d!'];
        $scope.searchUID = '';

        $scope.openStart = function () {
            $scope.openedStart = true;
        };
        $scope.openEnd = function () {
            $scope.openedEnd = true;
        };
        $scope.initDate = date;

        //判断用户是否登录
        if ($scope.user === null || $scope.user === undefined) {
            $state.go('access.signin');
            return;
        }

        //分成详细数据
        request.request('/data/operatordata1', {uid: $scope.user.uid, type:'daily', month: 0, date: 0})
            .then(function(data) {
                console.log(data);
            });



        $scope.searchByDate = function() {
            var begin = new Date($scope.dateBegin);
            var end = new Date($scope.dateEnd);
            var cond = {uid: $scope.user.uid};
            if (begin > end) {
                console.log("起始日期不能大于截止日期");
                dialog.showError("错误","起始日期不能大于截止日期");
                return;
            }
            else if ($scope.dateBegin !== null && $scope.dateEnd !== null) {
                var strBegin = begin.getFullYear() + '/' + (begin.getMonth()+1) + '/' + begin.getDate();
                var strEnd = end.getFullYear() + '/' + (end.getMonth()+1) + '/' + end.getDate();
                cond['begin'] = strBegin;
                cond['end'] = strEnd;
            } else if ($scope.dateBegin === null || $scope.dateEnd === null) {
                var today = new Date();
                var _today = today.getFullYear() + '/' + (today.getMonth()+1) + '/' + today.getDate();
                cond['begin'] = _today;
                cond['end'] = _today;
            }

            console.log(cond);
            request.request('/user/getPlayers', cond)
                .then(function(data) {
                    console.log(data);
                    $scope.players = data !== null ? data : [];

                });
        };

        $scope.searchByUID = function() {
            if ($scope.searchUID != null && $scope.searchUID.length > 0) {
                var cond = {uid: $scope.user.uid, pid:$scope.searchUID};
                // if (this.dateBegin != null && this.dateEnd != null) {
                //     cond['begin'] = this.dateBegin;
                //     cond['end'] = this.dateEnd;
                // }
                request.request('/player/getPlayer', cond)
                    .then(function(data){
                        $scope.players = [];
                        $scope.players.push(data);
                    });
            } else {
                dialog.showError("","请输入UID");
            }
        };

        if ($scope.searchUID !== null && $scope.searchUID.length > 0)
            $scope.searchByUID();
        else {
            var cond = {uid: $scope.user.uid};
            request.request('/user/getPlayers', cond)
                .then(function(data) {
                    console.log(data);
                    $scope.players = data != null ? data : [];

                });
        }





        //获取分成比例
        request.request("/settings/load", {}, false)
            .then(function( data){
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
