
app.controller('operationModalController', ['$scope', '$modalInstance','request','dataType', function($scope, $modalInstance, request, dataType ) {
    //获取用户信息
    $scope.user = app['user'];
    //关闭模态框
    $scope.cancel = function () {
        $modalInstance.close();
    };

    //配置接口数据
    switch (dataType) {
        case 'itemsToday':
            $scope.title = '今日数据';
            $scope.timeType = 'daily';
            searchData = {date: 0, month: 0};
            break;
        case 'itemsYesterday':
            $scope.title = '昨日数据';
            $scope.timeType = 'daily';
            searchData = {date: -1, month: 0};
            break;
        case 'itemsWeek':
            $scope.title = '7日数据';
            $scope.timeType = 'days';
            searchData = {days: 7, month: 0};
            break;
        case 'itemsHalfMonth':
            $scope.title = '15日数据';
            $scope.timeType = 'days';
            searchData = {days: 15, month: 0};
            break;
        case 'itemsCurMonth':
            $scope.title = '本月数据';
            $scope.timeType = 'days';
            searchData = {month: new Date().getMonth()};
            break;
        case 'itemsLastMonth':
            $scope.title = '上月数据';
            $scope.timeType = 'days';
            searchData = {month: -1};
            break;
        case 'itemsYear':
            $scope.title = '本年数据';
            $scope.timeType = 'months';
            searchData = {};
            break;
    }

    //请求数据
    request.request('/data/operatordata2', {
        uid: $scope.user.uid,
        type:$scope.timeType,
        month: searchData.month,
        date: searchData.date,
        days:searchData.days
    })
    //接受返回数据
        .then( function( data){
            $scope.indexModalData = data;
        });

}]);
//时间筛选器 输出输出格式 H:m
app.filter('gameName', function () {
    return function (name) {
        switch (name){
            case 'qidong':return '启东敲麻';break;
            case 'qidongbd':return '百搭';break;
            case 'qidongljc':return '老韭菜';break;
            case 'shisanshui':return '十三水';break;
        }
    }
});