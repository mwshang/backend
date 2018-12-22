'use strict';

myApp.controller('mainController',
  function mainController($rootScope, $scope, $sessionStorage, $location, $http, browser) {
    $scope.isMobile = browser.mobile;
    console.log(browser, $scope.isMobile);

    // $scope.user = {
    //   name : '',
    //   uid : '',
    //   isAgent: 0,
    //   gemNum: 0,
    //   bonusAvail: 0
    // };

    $scope.player = {
      name : '',
      uid : '',
      vipLevel: 0,
      cardNum: 0
    };

    $scope.today = {
      chargeNum: 0,
      playNum: 0,
      activeUserNum: 0,
      newUserNum: 0
    };

    $scope.yesterday = {
      chargeNum: 0,
      playNum: 0,
      activeUserNum: 0,
      newUserNum: 0
    };

    $scope.week = {
      chargeNum: 0,
      playNum: 0,
      newUserNum: 0
    };

    $scope.bonus = {
      bonusIn: [],
      bonusOut: []
    };

    $scope.supportedBanks = [
      '工商银行',
      '建设银行',
      '农业银行',
      '招商银行',
      '交通银行',
      '平安银行',
      '广发银行',
      '光大银行',
      '民生银行',
      '中信银行',
      '浦东发展银行',
      '北京银行'
    ];

    $scope.serverTypes = [];
    $scope.serverTypeNames = [];

    $scope.user = $rootScope.user;
    $scope.user._agentLevel = $scope.user.agentLevel >= 3 ? '普通' : ($scope.user.agentLevel == 2 ? '中级' : '高级');

    // $scope.user.uid = $rootScope.user.uid;
    // $scope.user.name = $rootScope.user.name;
    // $scope.user.isAgent = $rootScope.user.isAgent;
    // $scope.user.gemNum = $rootScope.user.gemNum;

    $scope.switchTab = function (tab) {
      $scope.player = {
        name : '',
        uid : '',
        vipLevel: 0,
        cardNum: 0
      };

      $scope.bonus = {
        bonusIn: [],
        bonusOut: []
      };

      $scope.msg = '';
      $scope.noticeContent = '';
      $scope.noticeTitle = '';
      $scope.notices = [];
      $scope.donates = [];
      $scope.agents = [];
      $scope.agentResult = -1;
      $scope.donateResult = -1;
      $scope.noticeResult = -1;
      $scope.subAgentResult = -1;
      $scope.payBonusResult = -1;
      $scope.changeSettingsResult = -1;
      $scope.recommender = 0;
      $scope.donateCardNum = 0;
      $scope.noticeContentType = "1";
      $scope.closeRoomResult = -1;

      // agent tab
      $scope.showGetAgentNotice = false;
      $scope.showBuyCards = false;
      $scope.showDonateCards = false;
      $scope.showAddSubAgent = false;
      $scope.showSubAgentList = false;
      $scope.showBonusList = false;
      $scope.showAllMyAgentList = false;

      // operator tab
      $scope.showSendGameNotice = false;
      $scope.showSendAgentNotice = false;
      $scope.showAuditAgent = false;
      $scope.showRewardCards = false;
      $scope.showOpData = false;
      $scope.showSpecSubAgentList = false;
      $scope.showSettingsFlag = false;
      $scope.showSubAgentDonateList = false;
      $scope.showSubAgentBonusList = false;
      $scope.showPayBonusList = false;
      $scope.showBigAgentList = false;

      // common
      $scope.showGetNoticeNotice = false;
      $scope.showDonateResult = false;
      $scope.showRewardResult = false;
      $scope.showCloseRoomFlag = false;

      switch (tab) {
        case 'getAgentNotice':
          $scope.showGetAgentNotice = true;
          $scope.title = '查看代理通知';
          break;
        case 'getGameNotice':
          $scope.showGetGameNotice = true;
          $scope.title = '查看游戏通知';
          break;
        case 'buyCards':
          $scope.showBuyCards = true;
          $scope.title = '代理钻石充值';
          break;
        case 'donateCards':
          $scope.showDonateCards = true;
          $scope.title = '发放钻石';
          break;
        case 'sendGameNotice':
          $scope.showSendGameNotice = true;
          $scope.title = '发布游戏通知';
          break;
        case 'sendAgentNotice':
          $scope.showSendAgentNotice = true;
          $scope.title = '发布代理通知';
          break;
        case 'auditAgent':
          $scope.showAuditAgent = true;
          $scope.title = '代理审核';
          break;
        case 'rewardCards':
          $scope.showRewardCards = true;
          $scope.title = '钻石代充';
          break;
        case 'donateResult':
          $scope.showDonateResult = true;
          $scope.title = '最近发钻记录';
          break;
        case 'rewardResult':
          $scope.showRewardResult = true;
          $scope.title = '最近充钻记录';
          break;
        case 'addSubAgent':
          $scope.showAddSubAgent = true;
          $scope.title = '发展下级代理';
          break;
        case 'getSubAgents':
          $scope.showSubAgentList = true;
          $scope.title = '我的下级代理';
          break;
        case 'showSpecSubAgent':
          $scope.showSpecSubAgentList = true;
          $scope.title = '查询代理发展';
          break;
        case 'showData':
          $scope.showOpData = true;
          $scope.title = '数据概览';
          break;
        case 'showSubAgentDonate':
          $scope.showSubAgentDonateList = true;
          $scope.title = '查询代理消费';
          break;
        case 'showSubAgentBonus':
          $scope.showSubAgentBonusList = true;
          $scope.title = '查询代理佣金';
          break;
        case 'showBonus':
          $scope.showBonusList = true;
          $scope.title = '我的佣金';
          break;
        case 'showPayBonus':
          $scope.showPayBonusList = true;
          $scope.title = '代理提现';
          break;
        case 'showBigSubAgent':
          $scope.showBigAgentList = true;
          $scope.title = '查询高级代理';
          break;
        case 'showAllMyAgents':
          $scope.showAllMyAgentList = true;
          $scope.title = '我的代理发展';
          break;
        case 'showSettings':
          $scope.showSettingsFlag = true;
          $scope.title = '运营设置';
          break;
        case 'showCloseRoomFlag':
          $scope.showCloseRoomFlag = true;
          $scope.title = '牌局解散';
          break;
      }

      $http.post("/player/getInfo", {uid: $scope.user.uid, pid: $scope.user.uid, session:$rootScope.session})
        .success(function(data, status, headers, config){
          //当异步请求成功返回响应时触发
          console.log(data, status);

          if (data.code == 200) {
            $scope.msg = '';
            $rootScope.session = data.session;
            $scope.user.gemNum = data.data.gemNum;
          }
        }).error(function(data, status, headers, config){
        //当发生异常时触发
        console.log(data);
      });

      console.log($scope.title);
    };

    $scope.logout = function() {
      $rootScope.user = null;
      $location.url('/login');
    };

    $scope.notice = function(type) {
      $http.post("/gameop/notice", {uid: $scope.user.uid, session:$rootScope.session, type: type})
        .success(function(data, status, headers, config){
          //当异步请求成功返回响应时触发
          console.log(data, status);

          if (data.code == 200) {
            $scope.msg = '';
            $rootScope.session = data.session;
            console.log(data.data);
            $scope.notices = data.data;
          } else {
            $scope.msg = data.msg;
          }
        }).error(function(data, status, headers, config){
          //当发生异常时触发
          console.log(data);
          $scope.msg = "您的网络开小差啦!";
        });
    };

    $scope.buyCards = function() {

    };

    $scope.callAgent = function (uid) {
      $scope._agent(uid);
    };

    $scope.callDonates = function (uid) {
      $scope.donate(uid, 0);
    }

    $scope.getPlayer = function(cb) {
      $http.post("/player/getInfo", {uid: $scope.user.uid, pid: $scope.player.uid, session:$rootScope.session})
        .success(function(data, status, headers, config){
          //当异步请求成功返回响应时触发
          console.log(data, status);

          if (data.code == 200) {
            $scope.msg = '';
            $rootScope.session = data.session;
            $scope.player.name = data.data.nickName;
            $scope.player.vipLevel = data.data.vipLevel;
            $scope.player.cardNum = data.data.gemNum;
            if ($scope.player.vipLevel >= 11)
              $scope.agentInfo = '已开启';
            else
              $scope.agentInfo = '已关闭';
            $scope.player.upLevelAgent = data.data.upLevelAgent;
            $scope.player.agentLevel = data.data.agentLevel;

            if (!!cb)
              cb(parseInt($scope.player.uid));
          } else {
            $scope.msg = data.msg;
          }
        }).error(function(data, status, headers, config){
          //当发生异常时触发
          console.log(data);
          $scope.msg = "您的网络开小差啦!";
        });
    };

    $scope.isDonating = false;
    $scope.donateCards = function() {
      if ($scope.isDonating)
        return;

      $scope.donateResult = -1;

      if ($scope.donateCardNum == undefined || $scope.donateCardNum <= 0) {
        $scope.msg = "赠送钻石数量错误!";
        return;
      }

      if ($rootScope.user.isAgent < 5 && $rootScope.user.gemNum < $scope.donateCardNum) {
        $scope.msg = "您的钻石不够了!";
        return;
      }

      $scope.isDonating = true;
      $http.post("/user/donateCards", {uid: $scope.user.uid, agent: $scope.user.isAgent, pid: $scope.player.uid,
                                        gem: $scope.donateCardNum, session:$rootScope.session})
        .success(function(data, status, headers, config){
          //当异步请求成功返回响应时触发
          console.log(data, status);
          $scope.isDonating = false;

          if (data.code == 200) {
            $scope.msg = '';
            $rootScope.session = data.session;
            $scope.donateResult = data.data;

            $scope.donate($scope.user.uid, 0);

            if ($rootScope.user.isAgent < 5) {
              $rootScope.user.gemNum -= $scope.donateCardNum;
              $scope.user.gemNum = $rootScope.user.gemNum;
            }
          } else {
            $scope.donateResult = 0;
            $scope.msg = data.msg;
          }
        }).error(function(data, status, headers, config){
          //当发生异常时触发
          console.log(data);
          $scope.isDonating = false;
          $scope.msg = "您的网络开小差啦!";
        });
    };

    $scope.isNoticeSending = false;
    $scope.sendNotice = function () {
      $scope.isNoticeSending = true;
      $http.post("/user/sendNotice", {uid: $scope.user.uid, title: $scope.noticeTitle,
          content: $scope.noticeContent, session:$rootScope.session,
          type: ($scope.showSendAgentNotice ? 1 : 0), contentType: parseInt($scope.noticeContentType)})
        .success(function(data, status, headers, config){
          //当异步请求成功返回响应时触发
          console.log(data, status);

          if (data.code == 200) {
            $scope.msg = '';
            $rootScope.session = data.session;
            $scope.noticeResult = data.data;
          } else {
            $scope.msg = data.msg;
          }

          $scope.isNoticeSending = false;
        }).error(function(data, status, headers, config){
        //当发生异常时触发
        console.log(data);
        $scope.msg = "您的网络开小差啦!";
        $scope.isNoticeSending = false;
      });
    };

    $scope.deleteNotice = function (id) {
      $http.post("/user/deleteNotice", {uid: $scope.user.uid, id: id, session:$rootScope.session})
        .success(function(data, status, headers, config){
          //当异步请求成功返回响应时触发
          console.log(data, status);

          if (data.code == 200) {
            $scope.msg = '';
            $rootScope.session = data.session;
            $scope.notice($scope.showGetAgentNotice ? 1:0);
          }
        }).error(function(data, status, headers, config){
        //当发生异常时触发
        console.log(data);
        $scope.msg = "您的网络开小差啦!";
      });
    };

    $scope.isAgentAuditing = false;
    $scope.bindAgent = function () {
      $scope.isAgentAuditing = true;
      $scope.agentResult = -1;
      $http.post("/user/bindAgent", {uid: $scope.user.uid, pid: $scope.player.uid, recommender: parseInt($scope.recommender), session:$rootScope.session})
        .success(function(data, status, headers, config){
          //当异步请求成功返回响应时触发
          console.log(data, status);

          if (data.code == 200) {
            $scope.msg = '';
            $rootScope.session = data.session;
            $scope.agentResult = data.data;

            setTimeout(function () {
              $scope.getPlayer();
              $scope.agentResult = -1;
            }, 1000);
          } else {
            $scope.msg = data.msg;
          }

          $scope.isAgentAuditing = false;
        }).error(function(data, status, headers, config){
        //当发生异常时触发
        console.log(data);
        $scope.msg = "您的网络开小差啦!";
        $scope.isAgentAuditing = false;
      });
    };

    $scope.isAgentAuditing = false;
    $scope.auditAgent = function(type, audit) {
      $scope.agentResult = -1;
      $scope.isAgentAuditing = true;
      $http.post("/user/auditAgent", {uid: $scope.user.uid, pid: $scope.player.uid, recommender: parseInt($scope.recommender), session:$rootScope.session, type: type, audit: audit})
        .success(function(data, status, headers, config){
          //当异步请求成功返回响应时触发
          console.log(data, status);

          if (data.code == 200) {
            $scope.msg = '';
            $rootScope.session = data.session;
            $scope.agentResult = data.data;

            setTimeout(function () {
              $scope.getPlayer();
              $scope.agentResult = -1;
            }, 1000);
          } else {
            $scope.msg = data.msg;
          }

          $scope.isAgentAuditing = false;
        }).error(function(data, status, headers, config){
          //当发生异常时触发
          console.log(data);
          $scope.msg = "您的网络开小差啦!";
          $scope.isAgentAuditing = false;
        });
    };

    $scope.donate = function(pid, type) {
      if (pid == undefined || pid == null || pid == '')
        pid = $scope.user.uid;

      $http.post("/user/donates", {uid: $scope.user.uid, type: type, session:$rootScope.session, pid: pid})
        .success(function(data, status, headers, config){
          //当异步请求成功返回响应时触发
          console.log(data, status);

          if (data.code == 200) {
            $scope.msg = '';
            $rootScope.session = data.session;
            console.log(data.data);
            $scope.donates = data.data;
          } else {
            $scope.msg = data.msg;
          }
        }).error(function(data, status, headers, config){
        //当发生异常时触发
        console.log(data);
        $scope.msg = "您的网络开小差啦!";
      });
    };

    $scope.isSubAgentAdding = false;
    $scope.addSubAgent = function() {
      $scope.isSubAgentAdding = true;
      $http.post("/user/addSubAgent", {uid: $scope.user.uid, pid: $scope.player.uid, session:$rootScope.session})
        .success(function(data, status, headers, config){
          //当异步请求成功返回响应时触发
          console.log(data, status);

          if (data.code == 200) {
            $scope.msg = '';
            $rootScope.session = data.session;
            $scope.subAgentResult = data.data;
          } else {
            $scope.msg = data.msg;
          }

          $scope.isSubAgentAdding = false;
        }).error(function(data, status, headers, config){
        //当发生异常时触发
        console.log(data);
        $scope.msg = "您的网络开小差啦!";
        $scope.isSubAgentAdding = false;
      });
    };

    $scope._agent = function (pid) {
      if (pid == undefined || pid == null || pid == '')
        pid = $scope.user.uid;

      $http.post("/user/agents", {uid: $scope.user.uid, session:$rootScope.session, pid: pid})
        .success(function(data, status, headers, config){
          //当异步请求成功返回响应时触发
          console.log(data, status);

          if (data.code == 200) {
            $scope.msg = '';
            $rootScope.session = data.session;
            $scope.agents = data.data;
          } else {
            $scope.msg = data.msg;
          }
        }).error(function(data, status, headers, config){
        //当发生异常时触发
        console.log(data);
        $scope.msg = "您的网络开小差啦!";
      });
    };

    $scope._bonus = function (pid) {
      if (pid == undefined || pid == null || pid == '')
        pid = $scope.user.uid;

      $http.post("/user/bonus", {uid: $scope.user.uid, session:$rootScope.session, pid: pid})
        .success(function(data, status, headers, config){
          //当异步请求成功返回响应时触发
          console.log(data, status);

          if (data.code == 200) {
            $scope.msg = '';
            $rootScope.session = data.session;
            $scope.bonus = data.data;
          } else {
            $scope.msg = data.msg;
          }
        }).error(function(data, status, headers, config){
        //当发生异常时触发
        console.log(data);
        $scope.msg = "您的网络开小差啦!";
      });
    };

    $scope.callBonus = function (uid) {
      $scope._bonus(uid);
    }

    $scope.opdata = function (req, res) {
      $http.post("/data/simpledata", {uid: $scope.user.uid, session:$rootScope.session})
        .success(function(data, status, headers, config){
          //当异步请求成功返回响应时触发
          console.log(data, status);

          if (data.code == 200) {
            $scope.msg = '';
            $rootScope.session = data.session;
            $scope.today.activeUserNum = data.data.today.activeUsers;
            $scope.today.newUserNum = data.data.today.newUsers;
            $scope.today.chargeNum = data.data.today.buyCards;
            $scope.today.playNum = data.data.today.usedCards;
            $scope.today.onlineNum = data.data.today.onlineNum;
            $scope.week.playNum = data.data.week.usedCards;
            $scope.week.newUserNum = data.data.week.newUsers;
            $scope.yesterday.activeUserNum = data.data.yesterday.activeUsers;
            $scope.yesterday.newUserNum = data.data.yesterday.newUsers;
            $scope.yesterday.chargeNum = data.data.yesterday.buyCards;
            $scope.yesterday.playNum = data.data.yesterday.usedCards;
          } else {
            $scope.msg = data.msg;
          }
        }).error(function(data, status, headers, config){
        //当发生异常时触发
        console.log(data);
        $scope.msg = "您的网络开小差啦!";
      });
    };

    $scope.getRewardSwitch = function () {
      $http.post("/settings/getRewardSwitch", {uid: $scope.user.uid, session:$rootScope.session})
        .success(function(data, status, headers, config){
          //当异步请求成功返回响应时触发
          console.log(data, status);

          if (data.code == 200) {
            $scope.msg = '';
            $rootScope.session = data.session;
            $scope.rewardSwitchFlag = data.data;
          } else {
            $scope.msg = data.msg;
          }
        }).error(function(data, status, headers, config){
        //当发生异常时触发
        console.log(data);
        $scope.msg = "您的网络开小差啦!";
      });
    };

    $scope.getAgentInfo = function() {
      $http.post("/user/getInfo", {uid: $scope.user.uid, pid: $scope.player.uid, session:$rootScope.session})
        .success(function(data, status, headers, config){
          //当异步请求成功返回响应时触发
          console.log(data, status);

          if (data.code == 200) {
            $scope.msg = '';
            $scope.payBonusResult = -1;
            $scope.payBonusList = {};
            $scope.payBonusList.bonusOut = [];

            $scope.agent = data.data;
            $scope.agent.bonusAvail = data.data.bonusTotal - data.data.bonusOut;
          } else {
            $scope.msg = data.msg;
          }
        }).error(function(data, status, headers, config){
        //当发生异常时触发
        console.log(data);
        $scope.msg = "您的网络开小差啦!";
      });
    };

    $scope.isPayingBonus = false;
    $scope.payAccount = '';
    $scope.payUserName = '';
    $scope.selectedBank = '';

    $scope.bonusPay = function() {
      if ($scope.isAgent()) {
        if ($scope.selectedBank.length == 0) {
          $scope.msg = "请选择银行!";
          return;
        }
        if ($scope.payAccount.length == 0 || isNaN($scope.payAccount)) {
          $scope.msg = "请正确填写银行账号!";
          return;
        }
        if ($scope.payUserName.length == 0) {
          $scope.msg = "请正确填写开户姓名!";
          return;
        }
        if ($scope.payBonus.length == 0 || parseInt($scope.payBonus) <= 0 ||
            parseInt($scope.payBonus) > ($scope.bonus.user.bonusTotal - $scope.bonus.user.bonusOut)) {
          $scope.msg = "填写提取数量错误!";
          return;
        }

        $scope.isPayingBonus = true;
        $http.post("/withdraw/withdraw", {uid: $scope.user.uid, outNum: $scope.payBonus, bankAccount:$scope.payAccount,
                                          bankUserName:$scope.payUserName, bankName: $scope.selectedBank,
                                          session:$rootScope.session})
          .success(function(data, status, headers, config){
            //当异步请求成功返回响应时触发
            console.log(data, status);

            if (data.code == 200) {
              $scope.msg = '';
              $scope.payBonusResult = (data.data == 2 ? 1:0);

              $scope._bonus($scope.user.uid);

            } else {
              $scope.msg = data.msg;
            }

            $scope.isPayingBonus = false;
          }).error(function(data, status, headers, config){
          //当发生异常时触发
          console.log(data);
          $scope.msg = "您的网络开小差啦!";
          $scope.isPayingBonus = false;
        });
      } else {
        if ($scope.payBonus.length == 0 || parseInt($scope.payBonus) <= 0 || parseInt($scope.payBonus) > $scope.agent.bonusAvail) {
          $scope.msg = "填写提取数量错误!";
          return;
        }

        $scope.isPayingBonus = true;
        $http.post("/user/payBonus", {uid: $scope.user.uid, pid: $scope.player.uid, num: $scope.payBonus, session:$rootScope.session})
          .success(function(data, status, headers, config){
            //当异步请求成功返回响应时触发
            console.log(data, status);

            if (data.code == 200) {
              $scope.msg = '';
              $rootScope.session = data.session;
              $scope.payBonusResult = data.data.result;
              $scope.payBonusList = {};
              $scope.payBonusList.bonusOut = data.data.list;
              $scope.payBonusList.user = data.data.user;
              $scope.agent.bonusAvail -= $scope.payBonus;
            } else {
              $scope.msg = data.msg;
            }

            $scope.isPayingBonus = false;
          }).error(function(data, status, headers, config){
          //当发生异常时触发
          console.log(data);
          $scope.msg = "您的网络开小差啦!";
          $scope.isPayingBonus = false;
        });
      }
    };

    $scope.bigAgents = function (pid) {
      if (pid == undefined || pid == null || pid == '')
        pid = $scope.user.uid;

      $http.post("/user/bigAgents", {uid: $scope.user.uid, session:$rootScope.session, pid: pid})
        .success(function(data, status, headers, config){
          //当异步请求成功返回响应时触发
          console.log(data, status);

          if (data.code == 200) {
            $scope.msg = '';
            $rootScope.session = data.session;
            $scope.agents = data.data;
          } else {
            $scope.msg = data.msg;
          }
        }).error(function(data, status, headers, config){
        //当发生异常时触发
        console.log(data);
        $scope.msg = "您的网络开小差啦!";
      });
    };

    $scope.callBigAgent = function (uid) {
      $scope.bigAgents(uid);
    };

    $scope.loadSettings = function () {
      $http.post("/settings/load", {uid: $scope.user.uid, session:$rootScope.session})
        .success(function(data, status, headers, config){
          //当异步请求成功返回响应时触发
          console.log(data, status);
          if (data.code == 200) {
            $scope.msg = '';
            $rootScope.session = data.session;
            $scope.settings = data.data;
          } else {
            $scope.msg = data.msg;
          }
        }).error(function(data, status, headers, config){
        //当发生异常时触发
        console.log(data);
        $scope.msg = "您的网络开小差啦!";
      });
    };

    $scope.isSettingsChanging = false;
    $scope.changeSettings = function () {
      $scope.isSettingsChanging = true;
      $http.post("/settings/save", {uid: $scope.user.uid, settings:$scope.settings, session:$rootScope.session})
        .success(function(data, status, headers, config){
          //当异步请求成功返回响应时触发
          console.log(data, status);
          $scope.isSettingsChanging = false;
          if (data.code == 200) {
            $scope.msg = '';
            $rootScope.session = data.session;
            $scope.changeSettingsResult = data.data;
          } else {
            $scope.msg = data.msg;
          }
        }).error(function(data, status, headers, config){
        //当发生异常时触发
        console.log(data);
        $scope.isSettingsChanging = false;
        $scope.msg = "您的网络开小差啦!";
      });
    };

    $scope.isRoomClosing = false;
    $scope.selectedSrvType = '';
    $scope.selectedSrvTypeName = '';
    $scope.closeRoom = function (type) { // 1 私人房间   2 比赛场
      $scope.isRoomClosing = true;
      $http.post("/gameop/closeRoom", {uid: $scope.user.uid, arenaId:$scope.arenaId, tableId: $scope.tableId, serverType: $scope.selectedSrvType, type: type, session:$rootScope.session})
        .success(function(data, status, headers, config){
          //当异步请求成功返回响应时触发
          console.log(data, status);
          $scope.isRoomClosing = false;
          if (data.code == 200) {
            $scope.msg = '';
            $rootScope.session = data.session;
            $scope.closeRoomResult = data.data;
          } else {
            $scope.msg = data.msg;
          }
        }).error(function(data, status, headers, config){
        //当发生异常时触发
        console.log(data);
        $scope.isRoomClosing = false;
        $scope.msg = "您的网络开小差啦!";
      });
    };

    $scope.loadServerTypes = function () {
      $http.post("/gameop/getServerTypes", {})
        .success(function(data, status, headers, config){
          //当异步请求成功返回响应时触发
          console.log(data, status);
          if (data.code == 200) {
            for (var p in data.data) {
              var k = Object.keys(data.data[p])[0];
              $scope.serverTypes.push(k);
              $scope.serverTypeNames.push(data.data[p][k]);
            }
          }
        }).error(function(data, status, headers, config){
        //当发生异常时触发
        console.log(data);
      });
    };

    $scope.showNotice = function(type) {
      console.log('showNotice');
      $scope.switchTab(type == 1 ? 'getAgentNotice' : 'getGameNotice');
      $scope.notice(type);
    };

    $scope.showBuy = function() {
      $scope.switchTab('buyCards');
    };

    $scope.showDonate = function() {
      $scope.switchTab($scope.isAgent() ? 'donateCards' : 'rewardCards');

      $scope.player.name = '';
      $scope.player.cardNum = 0;
      $scope.player.uid = '';
    };

    $scope.showDonateList = function (type) {
      if (type == 0)
        $scope.switchTab('donateResult');
      else
        $scope.switchTab('rewardResult');
      $scope.donate($scope.user.uid, type);
    };

    $scope.showAudit = function() {
      $scope.switchTab('auditAgent');

      $scope.player.name = '';
      $scope.player.uid = '';
    };
    
    $scope.showSendAgent = function() {
      console.log('showSendAgentNotice');
      $scope.switchTab('sendAgentNotice');
      $scope.noticeContent = '';
      $scope.noticeTitle = '';
    };

    $scope.showSendGame = function() {
      console.log('sendGameNotice');
      $scope.switchTab('sendGameNotice');
      $scope.noticeContent = '';
      $scope.noticeTitle = '';
    };

    $scope.showAddAgent = function() {
      console.log('showAddSubAgent');
      $scope.switchTab('addSubAgent');

      $scope.player.name = '';
      $scope.player.uid = '';
    };

    $scope.showSubAgents = function () {
      console.log('showSubAgents');
      $scope.switchTab('getSubAgents');
      $scope._agent();
    };

    $scope.showData = function () {
      console.log('showData');
      $scope.switchTab('showData');
      $scope.opdata();
    };

    $scope.showSpecSubAgent = function () {
      console.log('showSpecSubAgent');
      $scope.switchTab('showSpecSubAgent');
    };

    $scope.showRewardSetting = function () {
      console.log('showRewardSetting');
      $scope.switchTab('showRewardSwitch');
      $scope.getRewardSwitch();
    };

    $scope.showSubAgentDonate = function () {
      console.log('showSubAgentDonate');
      $scope.switchTab('showSubAgentDonate');
    };

    $scope.showBonus = function () {
      console.log('showBonus');
      $scope.switchTab('showBonus');
      $scope._bonus();
    };

    $scope.showSubAgentBonus = function () {
      console.log('showSubAgentBonus');
      $scope.switchTab('showSubAgentBonus');
    };

    $scope.showPayBonus = function () {
      console.log('showPayBonus');
      $scope.payBonus = 0;
      $scope.switchTab('showPayBonus');
    };

    $scope.showBigSubAgent = function () {
      console.log('showBigSubAgent');
      $scope.switchTab('showBigSubAgent');
      if ($scope.user.isAgent >= 3)
        $scope.bigAgents();
    };

    $scope.showAllMyAgents = function () {
      console.log('showAllMyAgents');
      $scope.switchTab('showAllMyAgents');
      $scope.bigAgents();
    };

    $scope.showSettings = function () {
      console.log('showSettings');
      $scope.switchTab('showSettings');
      $scope.loadSettings();
    };

    $scope.showCloseRoom = function () {
      console.log('showCloseRoom');
      $scope.switchTab('showCloseRoomFlag');
    };

    $scope.getAgentLevel = function(agent) {
      if (!$scope.isAgent()) {
        if (agent.level2Agent == $scope.player.uid)
          return '下级';
        else if (agent.level1Agent == $scope.player.uid)
          return '下下级';
        else if (agent.playerAgent == $scope.player.uid)
          return '普通玩家';
        else
          return '下下级以下';
      } else {
        if (agent.level2Agent == $scope.user.uid)
          return '下级';
        else if (agent.level1Agent == $scope.user.uid)
          return '下下级';
        else if (agent.playerAgent == $scope.user.uid)
          return '普通玩家';
        else
          return '下下级以下';
      }
    };

    $scope._getAgentLevel = function(agent) {
      if (!$scope.isAgent()) {
        if (agent.l2Agent == $scope.player.uid)
          return '下级';
        else if (agent.l1Agent == $scope.player.uid)
          return '下下级';
        else if (agent.playerAgent == $scope.player.uid)
          return '普通玩家';
        else
          return '下下级以下';
      } else {
        if (agent.l2Agent == $scope.user.uid)
          return '下级';
        else if (agent.l1Agent == $scope.user.uid)
          return '下下级';
        else if (agent.playerAgent == $scope.user.uid)
          return '普通玩家';
        else
          return '下下级以下';
      }
    };

    $scope.getBonusNum = function (user, item) {
      if (user.uid == item.l1Agent)
        return item.l1Bonus;
      else if (user.uid == item.l2Agent)
        return item.l2Bonus;
      else if (user.uid == item.playerAgent)
        return item.playerBonus;

      return 0;
    };

    $scope.getBonusAvail = function (user) {
      if (user == undefined)
        return;

      return '可提佣数量: ' + (user.bonusTotal - user.bonusOut);
    };

    $scope.getBonusTotal = function (user) {
      if (user == undefined)
        return;

      return '累计获佣数量: ' + user.bonusTotal;
    };

    $scope.getBonusOut = function (user) {
      if (user == undefined)
        return;

      return '累计提佣数量: ' + user.bonusOut;
    };

    $scope.formatTime = function(time) {
      console.log(time);
      var t = new Date(Date.parse(time));
      return t.toLocaleString();
    };

    $scope.isAgent = function () {
      return $scope.user.isAgent <= 2;
    };

    $scope.bonusCNY= function (bonusNum) {
      if (bonusNum == undefined)
        bonusNum = 0;
      var cny = bonusNum * $scope.settings.withdrawPrice;
      return '提取金额: '+ cny.toFixed(2) +'-2.0元';
    };

    $scope.bonusOutStatus = function (status) {
      switch (status) {
        case 1:
          return '提取成功';
        case 2:
          return '已申请';
        case 3:
          return '申请失败';
        case 4:
          return '提取失败';
      }
    };

    $scope.isSelected = function (index) {
      return $scope.selectedBank == $scope.supportedBanks[index];
    };
    $scope.select = function (index) {
        $scope.selectedBank = $scope.supportedBanks[index];
    };

    $scope.isSelectedSrvType = function (index) {
      return $scope.selectedSrvType == $scope.serverTypes[index];
    };
    $scope.selectSrvType = function (index) {
      $scope.selectedSrvType = $scope.serverTypes[index];
      $scope.selectedSrvTypeName = $scope.serverTypeNames[index];
    };

    $scope.loadSettings();
    $scope.loadServerTypes();

    if ($scope.isAgent()) {
      $scope.switchTab('getAgentNotice');
      $scope.notice(1);
    } else {
      $scope.switchTab('showData');
      $scope.opdata();
    }
  });
