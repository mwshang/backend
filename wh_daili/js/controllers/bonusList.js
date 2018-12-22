/**
 * Created by fyw2515 on 2017/9/9.
 */
/**
 * Created by Administrator on 2017/9/8 0008.
 */
app.controller('bonusListController', ['$scope', '$http', '$state', '$window', 'request','dialog',
  function($scope, $http, $state, $window, request, dialog) {
    $scope.user = app["user"];
    $scope.agent={};
    // 获取当天日期
    var date = new Date();
    var str= date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate();
    $scope.initDate = date;
    //起始日期
    $scope.dateBegin = str;
    //结尾日期
    $scope.dateEnd = str;
    //日期选择开关 关
    $scope.openedStart = false;
    $scope.openedEnd = false;

    $scope.format = "yyyy/MM/dd";
    $scope.altInputFormats = ['yyyy/M!/d!'];

    //日期选择框开关
    $scope.openStart = function () {
      $scope.openedStart = true;
    };
    //日期选择框开关
    $scope.openEnd = function () {
      $scope.openedEnd = true;
    };

    //todo:闪屏兼容性调整 在数据获取后 释放dom(目前失效 后续再查)
    $scope.inited = false;

    //分页设置1
    $scope.pageId = 0;
    $scope.pageNum = 1;

    //分页设置2
    $scope.pageId1 = 0;
    $scope.pageNum1 = 1;

    //全局分页设置(单页面数量)
    $scope.pageSize = 20;

    //分页点击事件
    $scope.pageroll = function (id) {
      //设置页面跳转
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
      //搜索条件
      var cond = {uid: $scope.user.uid, pid:$scope.user.uid, pageId:$scope.pageId, pageSize: $scope.pageSize};
      //请求接口
      $scope.searchByDate(cond);
    };

    //分页点击事件2
    $scope.pageroll1 = function (id) {
      switch (id) {
        // 首页
        case 0:
          $scope.pageId1 = 0;
          break;
        // 上一页
        case -1:
          if ($scope.pageId1 > 0)
            $scope.pageId1 -= 1;
          break;
        // 下一页
        case 1:
          if ($scope.pageId1 < $scope.pageNum1-1)
            $scope.pageId1 += 1;
          break;
        // 尾页
        case 2:
          $scope.pageId1 = $scope.pageNum1-1;
          break;
      }
      var cond = {uid: $scope.user.uid, pid:$scope.user.uid, pageId:$scope.pageId1, pageSize: $scope.pageSize};
      $scope.searchByDate(cond);
    };

    //根据日期搜索的分页
    $scope.searchByDate = function(cond ) {
        //判断是否存在搜索条件
        var cond = arguments[0] ? arguments[0] : {uid: $scope.user.uid, pid:$scope.user.uid, pageId:0, pageSize: $scope.pageSize};
        //设置起始时间
        var begin = new Date($scope.dateBegin);
        var end = new Date($scope.dateEnd);
        //起始日期大于终止日期
        if (begin >end) {
            dialog.showError("错误","起始日期不能大于截止日期");
            return;
        }
        //日期搜索条件存在
        else if ($scope.dateBegin !== null && $scope.dateEnd !== null) {
          //格式化获取的 起始 日期格式
            var strBegin = begin.getFullYear() + '/' + (begin.getMonth()+1) + '/' + begin.getDate();
            var strEnd = end.getFullYear() + '/' + (end.getMonth()+1) + '/' + end.getDate();
            cond['begin'] = strBegin;
            cond['end'] = strEnd;
            //日期搜索条件不全(搜索当日)
        } else if ($scope.dateBegin === null || $scope.dateEnd === null) {
            var today = new Date();
            var _today = today.getFullYear() + '/' + (today.getMonth()+1) + '/' + today.getDate();
            cond['begin'] = _today;
            cond['end'] = _today;
        }
        //佣金查询 调用接口
        request.request('/user/bonus', cond, true)
            .then(function(data) {
                console.log(data);
                if(!data) return;

                console.log(data);
                $scope.bonusIn = data.data.bonusIn;
                $scope.bonusOut = data.data.bonusOut;

                $scope.user = data.data.user;
                if (data.data.user.bonusTotal === null)
                    data.data.user.bonusTotal = 0.00;
                if (data.data.user.bonusOut === null)
                    data.data.user.bonusOut = 0.00;

                $scope.user.bonusTotal = data.data.user.bonusTotal.toFixed(2);
                $scope.user.bonusAvail = data.data.user.bonusTotal - data.data.user.bonusOut;
                $scope.user.bonusAvail = $scope.user.bonusAvail.toFixed(2);

                $scope.pageId = data.page.bonusInPage.id;
                $scope.pageNum = data.page.bonusInPage.num;
                $scope.pageId1 = data.page.bonusOutPage.id;
                $scope.pageNum1 = data.page.bonusOutPage.num;
            });
        //在页面信息获取之后全局刷新
        $scope.inited = true;
    };

    //用户信息
    request.request('/user/getInfo', {uid: $scope.user.uid, pid: $scope.user.uid})
    .then(function( agent) {
      $scope.agent = agent;

      // 显示代理数据
      request.request('/data/agentdata', {uid:$scope.user.uid}, false)
        .then(function(data) {
            if(!data) return;
          $scope.agent.chargeAmount = data.chargeAmount.toFixed(2);   //今日充值
          $scope.agent.bonusAvail= $scope.user.bonusAvail; //可提佣金
          $scope.agent.playerNum= data.playerNum;   //绑定玩家
          $scope.agent.agentNum = data.agentNum;  //下级代理
        });
    });

    //初始化搜索 第一次
    $scope.searchByDate();

      $scope.getBonus = function(record) {
          //if (record.l1Agent == $scope.user.uid) {
          //  return record.l1Bonus.toFixed(2);
          //} else if (record.l2Agent == $scope.user.uid) {
          //  return record.l2Bonus.toFixed(2);
          //} else if (record.playerAgent == $scope.user.uid) {
          //  return record.playerBonus.toFixed(2);
          //}
          return record.bonus.toFixed(2);
      };

    $scope.bonusStatus = function(record) {
      if (record.status == 1)
        return '成功';
      else if (record.status == 3 || record.status == 4)
        return '失败';
      else if (record.status == 0 || record.status == 2)
        return '正在处理';
    };

    //代理关系判断方法
    $scope.getUserLevel = function(record) {
      if (record.isAgent == 0) {
        return '直属玩家';
      } else {
        return '下级代理';
      }
    };

    $scope.showShortDateTime = function(record) {
      if(!record.createTime) return '';
      var temdate=new Date(record.createTime);
      return temdate.getFullYear() + '/' + (temdate.getMonth()+1) + '/' + temdate.getDate()+' '+temdate.getHours()+':'+ temdate.getMinutes();
    };

    //判断是否是微信浏览器
    $scope.isRunOnWeChat = function() {
      var ua = navigator.userAgent.toLowerCase();
      if(ua.indexOf("micromessenger") >= 0) {
        return true;
      } else {
        return false;
      }
    };

    //微信提示信息
    $scope.alertRunOnWeChat = function () {
      dialog.showError("","请使用微信登录后台才能提现到微信钱包!");
    };

    $scope.wxConfirm = function () {
      $window.location.href = 'http://mall.xiaocom.cn/wxconfirm.html?s=qd&i='+$scope.user.uid;
    }

  }]);