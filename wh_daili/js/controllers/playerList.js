
app.controller('playerListController', ['$scope', '$http', '$state', 'request','dialog',
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
        //闪屏兼容性调整 在数据获取后 释放dom
        $scope.inited = false;
        //搜索日期表开关
        $scope.openStart = function () {
            $scope.openedStart = true;
        };
        $scope.openEnd = function () {
            $scope.openedEnd = true;
        };

        // 分页设置
        //分页ID
        $scope.pageId = 0;
        //每页显示的数量
        $scope.pageSize = 5;
        //初始页码
        $scope.pageNum = 1;
        //设置搜索条件占位
        $scope.searchFlag = "";
        //是否清除页面
        $scope.pageClear = false;

        //分页点击事件
        $scope.pageroll = function (id) {
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
                    if ($scope.pageId < $scope.pageNum -1)
                        $scope.pageId += 1;
                    break;
                //最后一页
                case 2:
                    $scope.pageId = $scope.pageNum -1;
                    break;
            }

            //判断使用搜索方式
            if ($scope.searchFlag === 'byUid') {
                //调用用户UID查询接口
                $scope.searchByUID();
            } else if ($scope.searchFlag === 'byDate') {
                //调用日期查询接口
                searchByDataAction()
            } else {
                //分页跳转
                var cond = {uid: $scope.user.uid,pageId: $scope.pageId, pageSize: $scope.pageSize};
                request.request('/user/getPlayers', cond, true)
                  .then(function(data) {
                      $scope.players = data.data !== null ? data.data : [];
                      $scope.pageId = data.page.id;
                      $scope.pageNum = data.page.num;
                  });
            }
        };

        //初始化时间
        $scope.initDate = date;

        //日期查询按钮 (重置页码)
        $scope.searchByDate = function () {
            //是否清除页面
            $scope.pageClear = true;
            searchByDataAction()
        };

        function searchByDataAction(){
            var begin = new Date($scope.dateBegin);
            var end = new Date($scope.dateEnd);
            var cond = {uid: $scope.user.uid, pageId: $scope.pageId, pageSize: $scope.pageSize};
            //判断起始时间
            if (begin >end) {
                console.log("起始日期不能大于截止日期");
                dialog.showError("错误","起始日期不能大于截止日期");
                return;
            }
            //如果时间不为空 且起始时间存在 进行设置
            else if ($scope.dateBegin !== null && $scope.dateEnd !== null) {
                var strBegin=begin.getFullYear() + '/' + (begin.getMonth()+1) + '/' + begin.getDate();
                var strEnd=end.getFullYear() + '/' + (end.getMonth()+1) + '/' + end.getDate();
                cond['begin'] = strBegin;
                cond['end'] = strEnd;
                //起始时间不存在 默认为当天
            } else if ($scope.dateBegin === null || $scope.dateEnd === null) {
                var today = new Date();
                var _today = today.getFullYear() + '/' + (today.getMonth()+1) + '/' + today.getDate();
                cond['begin'] = _today;
                cond['end'] = _today;
            }
            //判断是否需要刷新初始页面
            if ($scope.pageClear ){
                //刷新初始页面
                $scope.pageId = 0;
                //还原刷新开关
                $scope.pageClear = false;
            }
            cond['pageId'] = $scope.pageId;
            //设置type字段
            $scope.searchFlag = "byDate";
            //调用接口请求
            request.request('/user/getPlayers', cond, true)
                .then(function(data) {
                    console.log(data);
                    $scope.players = data.data !== null ? data.data : [];
                    $scope.pageId = data.page.id;
                    $scope.pageNum = data.page.num;
                    //打开页面
                    $scope.inited = true;
                });
        }
        //通过时间搜索

        //玩家UID条件作为搜索
        $scope.searchByUID = function() {
            //判断UID是否为空 且合法
            if ($scope.searchUID != null && $scope.searchUID > 0) {
                //设置搜索方法
                var cond = {uid: $scope.user.uid, pid:$scope.searchUID};
                // if (this.dateBegin != null && this.dateEnd != null) {
                //     cond['begin'] = this.dateBegin;
                //     cond['end'] = this.dateEnd;
                // }
                $scope.searchFlag = "byUid";

                request.request('/player/getPlayer', cond)
                  .then(function(data){
                      if (data != null){
                          $scope.players = [];
                          $scope.players.push(data);
                          $scope.pageId = 0;
                          $scope.pageNum = 1;
                          return;
                      }
                        dialog.showError('','该玩家不存在!');
                        return;
                  });
            } else {
                dialog.showError("","请输入UID");
                return;
            }
        };

        //进入页面 默认搜索用户
        if ($scope.searchUID !== null && $scope.searchUID > 0)
            $scope.searchByUID();
        else {
            var cond = {uid: $scope.user.uid,pageId: $scope.pageId, pageSize: $scope.pageSize};
            request.request('/user/getPlayers', cond, true)
              .then(function(data) {
                  console.log(data);
                  $scope.players = data.data != null ? data.data : [];
                  $scope.pageId = data.page.id;
                  $scope.pageNum = data.page.num;
                  $scope.inited = true;
              });
        }

    }]);