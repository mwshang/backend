'use strict';

/* Controllers */
// signin controller
app.controller('SigninFormController', ['$scope', '$http', '$state', '$localStorage', 'request', 'dialog', function ($scope, $http, $state, $localStorage, request, dialog) {
    $scope.user = {};
    if (angular.isDefined($localStorage.user)) {
        $scope.user = $localStorage.user;
    }

    $scope.login = function () {
        console.log(request);
        request.a();

        // Try to login
        request.request("/user/login", {name: $scope.user.uid, pwd: $scope.user.password, usePwd: true, type: 1})
            .then(function (data) {
                if (data != null) {
                    //判断是否被封号
                    if (data.locked === 1) {
                        dialog.showError("错误", "账号已封停");
                        return;
                    }
                    if (data.isAgent !== 5) {
                        dialog.showError("错误", "您所使用的不是运营账号");
                        return;
                    }
                    $scope.user.uid = data.uid;
                    $scope.user.name = data.name;
                    $scope.user.password = data.password;
                    $scope.user.initPassword = data.initPassword;
                    $scope.user.agentId = data.agentId;
                    $scope.user.agentLevel = data.agentLevel;
                    $scope.user.isAgent = (data.isAgent <= 2);
                    $scope.user.gemNum = data.gemNum;
                    $scope.user.bonusPercent = data.bonusPercent;
                    $scope.user.bonusTotal = data.bonusTotal;
                    var bonusTotal = data.bonusTotal == null ? 0.00 : data.bonusTotal;
                    var bonusOut = data.bonusOut == null ? 0.00 : data.bonusOut;
                    $scope.user.bonusAvail = (bonusTotal - bonusOut).toFixed(2);

                    app['user'] = $scope.user;

                    // save login user to local storage
                    $localStorage.user = $scope.user;

                    $state.go('app.index');
                }
            }, function (x) {
            });
    };
}])
;