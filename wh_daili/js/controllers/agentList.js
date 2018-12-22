'use strict';
app.controller('agentListController', ['$scope', '$http', '$state', '$stateParams', '$timeout', '$modal', 'request','dialog',
    function($scope, $http, $state, $stateParams, $timeout, $modal, request, dialog) {
        $scope.user = app["user"];
        $scope.pid = parseInt($stateParams.pid);
        $scope.searchUID = '';
        //总页面开关
        $scope.inited = false;
        //表详情开关
        $scope.showDetail = false;
        var date = new Date();
        var str = date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate();
        $scope.dateBegin = str;
        $scope.dateEnd = str;
        $scope.openedStart = false;
        $scope.openedEnd = false;
        $scope.format = "yyyy/MM/dd";
        $scope.altInputFormats = ['yyyy/M!/d!'];
        //日期选择组件
        $scope.openStart = function () {
            $scope.openedStart = true;
        };
        $scope.openEnd = function () {
            $scope.openedEnd = true;
        };
        //页面刷新控制
        $scope.inited = false;

        //分页初始化
        $scope.pageId = 0;
        //页面显示条数
        $scope.pageSize = 10;
        //总页面
        $scope.pageNum = 1;
        //搜索类型
        $scope.searchFlag = "";
        //是否清除页面
        $scope.pageClear = false;

        //分页逻辑
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
                    if ($scope.pageId < $scope.pageNum-1)
                        $scope.pageId += 1;
                    break;
                //最后一页
                case 2:
                    $scope.pageId = $scope.pageNum-1;
                    break;
            }
            //判断使用何种分页
            if ($scope.searchFlag === 'byUid') {
                $scope.searchByUID();
            } else if ($scope.searchFlag === 'byDate') {
                searchByDataAction();
            } else {
                var cond = {uid: $scope.user.uid, pid: $scope.pid,pageId: $scope.pageId, pageSize: $scope.pageSize};
                request.request('/user/getAgents', cond, true)
                  .then(function(data) {
                      $scope.agents = data.data !== null ? data.data : [];
                      $scope.pageId = data.page.id;
                      $scope.pageNum = data.page.num;
                      $timeout(function(){
                        $('.table').trigger('footable_redraw');
                        $timeout(function(){
                            $scope.inited = true;
                        },100);
                      }, 10);
                  });
            }
        };

        //日期初始化
        $scope.initDate = date;

        //日期查询按钮 (重置页码)
        $scope.searchByDate = function() {
            //是否清除页面
            $scope.pageClear = true;
            searchByDataAction()
        };

        //根据日期查询
        function searchByDataAction(){
            //页面模块关闭
            $scope.inited = false;
            var begin = new Date($scope.dateBegin);
            var end = new Date($scope.dateEnd);
            var cond = {uid: $scope.user.uid, pid: $scope.pid, pageSize: $scope.pageSize};
            if (begin >end) {
                dialog.showError("错误","起始日期不能大于截止日期");
                return;
            }
            //根据日期搜索
            else if ($scope.dateBegin != null && $scope.dateEnd != null) {
                var strBegin=begin.getFullYear() + '/' + (begin.getMonth()+1) + '/' + begin.getDate();
                var strEnd=end.getFullYear() + '/' + (end.getMonth()+1) + '/' + end.getDate();
                cond['begin'] = strBegin;
                cond['end'] = strEnd;
                //默认搜索
            } else if ($scope.dateBegin == null || $scope.dateEnd == null) {
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

            $scope.searchFlag = 'byDate';
            request.request('/user/getAgents', cond, true)
                .then(function(data) {
                    $scope.agents = data.data != null ? data.data : [];
                    $scope.pageId = data.page.id;
                    $scope.pageNum = data.page.num;
                    $timeout(function(){
                        $('.table').trigger('footable_redraw');
                        $timeout(function(){
                            $scope.inited = true;
                        },100);
                    }, 10);
                });

        }

        //根据UID查询
        $scope.searchByUID = function() {
            if ($scope.searchUID !== null && $scope.searchUID.length > 0) {
              $scope.inited = false;
                $scope.searchFlag = 'byUid';

                var cond = {
                    uid: $scope.user.uid,
                    pid:$scope.searchUID
                };
                request.request('/user/agent', cond)
                  .then(function(data){
                      if (data == null){
                          dialog.showError('错误','该玩家不存在');
                          $scope.inited = true;
                          return;
                      }
                      $scope.agents = data != null ? data : [];
                      $timeout(function(){
                          $('.table').trigger('footable_redraw');
                          $timeout(function(){
                              $scope.inited = true;
                          },100);
                      }, 10);
                      //分页初始化
                      $scope.pageId = 0;
                      //总页面
                      $scope.pageNum = 1;
                  });
            } else {
                dialog.showError('错误','请输入UID');
            }
        };

        //页面返回
        $scope.back = function () {
            window.history.back();
        };

        //页面首次搜索
        if ($scope.searchUID != null && $scope.searchUID.length > 0){
            $scope.searchByUID();
        } else {
            //根据时间搜索
            var cond = {
                uid: $scope.user.uid,
                pid: $scope.pid,
                pageId: $scope.pageId,
                pageSize: $scope.pageSize
            };
            request.request('/user/getAgents', cond, true)
              .then(function(data) {
                  $scope.agents = data.data != null ? data.data : [];
                  $scope.pageId = data.page.id;
                  $scope.pageNum = data.page.num;
                  $timeout(function(){
                      $('.table').trigger('footable_redraw');
                      $timeout(function(){
                          $scope.inited = true;
                      },100);
                  }, 10);
              });
        }


        //开通代理
        $scope.openAuditAgent = function () {
            var modalInstance = $modal.open({
                templateUrl: 'registerAgent.html',
                controller: 'ModalInstanceCtrl',
                resolve: {
                    agentLevel: function () {
                        return '代理等级';
                    }
                }
            });
            //设置默认初始值
            $scope.selectLevelInt = 1;
            modalInstance.result.then(function (data) {
                $scope.uid = data.uid;
                $scope.selectLevelInt =  data.selectLevelInt;
                $scope.agentCode = '' + data.agentCode;
                $scope.pwd = data.pwd ;
                $scope.phoneNumber = data.phoneNumber ;
                // todo:启东去除
                // $scope.bonusPercent = data.bonusPercent == undefined ? 0 : data.bonusPercent;
                // 审核
                request.request('/user/auditAgent', {
                    uid: app.user.uid,
                    pid: $scope.uid,
                    recommender: app.user.isAgent ? app.user.uid : 0,
                    type:1,
                    audit:$scope.selectLevelInt
                })
                    .then(function(data){
                        // 代注册
                        if (data === 1) {
                            request.request('/user/register', {
                                uid: $scope.uid,
                                mail: '',
                                pwd: $scope.pwd,
                                // bonusPercent: parseInt($scope.bonusPercent),
                                phoneNumber: $scope.phoneNumber,
                                agentCode: $scope.agentCode,
                                willLogin: false
                            })
                                .then(function(data){
                                    if (data !== null && data.uid === $scope.uid) {
                                        dialog.showInfo('消息', '开通代理成功!');
                                    } else {
                                        request.request('/user/auditAgent', {
                                            uid: app.user.uid,
                                            pid: $scope.uid,
                                            recommender: app.user.isAgent ? app.user.uid : 0,
                                            type:1,
                                            audit:0
                                        });
                                        //dialog.showError('消息', '开通代理失败,请稍后再试!');
                                    }
                                });
                        } else {
                            dialog.showError('错误', '玩家已经注册,开通代理失败,请稍后再试!');
                        }
                    });
            });
        };

        //获得佣金比例
        $scope.getBonusPercent = function () {
            request.request("/settings/load", {}, false)
                .then(function (data) {
                    if (data != null) {
                        $scope.normal = data.normalRate1;
                        $scope.middle = data.middleRate1;
                        $scope.high = data.highRate1;
                    } else {
                        dialog.showError('', '信息获取失败,请稍后重试');
                        return;
                    }
                });

        };

        $scope.getBonusPercent();

        //设置页面佣金比例
        $scope.setBonusPercent = function (agentLevel) {
            switch (agentLevel) {
                case 3:
                    return $scope.normal;
                    break;
                case 2:
                    return $scope.middle;
                    break;
                case 1:
                    return $scope.high;
                    break;
            }
        };

    }]);