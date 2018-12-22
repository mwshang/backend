'use strict';

/* Controllers */
app.controller('playerRecordDetailModalController', ['$scope', '$modalInstance', '$stateParams', 'request', 'data', function ($scope, $modalInstance, $stateParams, request, data) {
    $scope.data = data;


    //胜率格式化
    $scope.getratio = function (num) {
        var num = num * 100;
        return (num.toFixed(2)) + '%';
    };

    //取消按钮
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);

