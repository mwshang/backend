'use strict';

/**
 * Config for the router
 */
angular.module('app')
    .run(
        ['$rootScope', '$state', '$stateParams',
            function ($rootScope, $state, $stateParams) {
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;
            }
        ]
    )
    .config(
        ['$stateProvider', '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) {

                $urlRouterProvider
                    .otherwise('/access/signin');
                $stateProvider

                    .state('app', {
                        abstract: true,
                        url: '/app',
                        templateUrl: 'tpl/app.html'
                    })


                    //登录
                    .state('access.signin', {
                        url: '/signin',
                        templateUrl: 'tpl/page_signin.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/signin.js']);
                                }]
                        }
                    })

                    //首页
                    .state('app.index', {
                        url: '/index',
                        templateUrl: 'tpl/index/index.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/index/indexController.js']);
                                }]
                        }
                    })
// 运营----------------------------------------------------------------------------------------------------------------
                    //运营统计
                    .state('app.operation', {
                        url: '/operation',
                        templateUrl: 'tpl/operation/operation.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/operation/operationController.js']);
                                }]
                        }
                    })



                   //运营数据查询
                    .state('app.operationData', {
                        url: '/operation/operationData',
                        templateUrl: 'tpl/operation/operationData.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/operation/operationDataController.js']);
                                }]
                        }
                    })

// 营收----------------------------------------------------------------------------------------------------------------

                    //营收统计表
                    .state('app.revenueStatistics', {
                        url: 'revenue/Statistics',
                        templateUrl: 'tpl/revenues/statistics.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/revenue/revenueStatisticsController.js']);
                                }]
                        }
                    })

                    //营收查询
                    .state('app.sharedRevenue', {
                        url: 'revenue/shareRevenue',
                        templateUrl: 'tpl/revenues/shareRevenue.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/revenue/shareRevenueController.js']);
                                }]
                        }
                    })

                    //提现查询
                    .state('app.withdraw', {
                        url: '/revenue/withdraw',
                        templateUrl: 'tpl/revenues/withdraw.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/revenue/withdrawController.js']);
                                }]
                        }
                    })
// 玩家----------------------------------------------------------------------------------------------------------------
                    //玩家查看
                    .state('app.playerList', {
                        url: 'game/playerList',
                        templateUrl: 'tpl/player/playerList.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/player/playerListController.js']);
                                }]
                        }
                    })

                    //玩家封停列表
                    .state('app.playerLockList', {
                        url: 'player/playerLockList',
                        params: {'pid': 0},
                        templateUrl: 'tpl/player/playerLockList.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/player/playerLockListController.js']);
                                }]
                        }
                    })

                    //解散房间
                    .state('app.releaseRoom', {
                        url: 'player/releaseRoom',
                        templateUrl: 'tpl/player/releaseRoom.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/player/releaseRoomController.js']);
                                }]
                        }
                    })

                    //玩家踢出房间
                    .state('app.playerKick', {
                        url: 'player/playerKick',
                        templateUrl: 'tpl/player/playerKick.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/player/playerKickController.js']);
                                }]
                        }
                    })

                    //充钻
                    .state('app.sendDiamond', {
                        url: 'player/sendDiamond',
                        templateUrl: 'tpl/player/sendDiamond.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/player/sendDiamondController.js']);
                                }]
                        }
                    })

                    //充钻统计表
                    .state('app.sendDiamondList', {
                        url: 'player/sendDiamondList',
                        templateUrl: 'tpl/player/sendDiamondList.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/player/sendDiamondListController.js']);
                                }]
                        }
                    })

                    //玩家战绩统计
                    .state('app.playerRecord', {
                        url: 'player/playerRecord',
                        params: {'pid': 0},
                        templateUrl: 'tpl/player/playerRecord.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/player/playerRecordController.js']);
                                }]
                        }
                    })
                    //玩家战绩详情
                    .state('app.playerRecordDetail', {
                        url: 'player/playerRecordDetail',
                        params: {'pid': 0},
                        templateUrl: 'tpl/player/playerRecordDetail.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/player/playerRecordDetailController.js']);
                                }]
                        }
                    })

// 代理----------------------------------------------------------------------------------------------------------------
                    //代理查看
                    .state('app.agentList', {
                        url: 'agent/agentList',
                        params: {'pid': 0},
                        templateUrl: 'tpl/agent/agentList.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/agent/agentListController.js']);
                                }]
                        }
                    })

                    //代理封停列表
                    .state('app.agentLockList', {
                        url: 'agent/agentLockList',
                        templateUrl: 'tpl/agent/agentLockList.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/agent/agentLockListController.js']);
                                }]
                        }
                    })

                    //充值流水查询
                    .state('app.agentChargeList', {
                        url: 'agent/agentChargeList',
                        templateUrl: 'tpl/agent/agentChargeList.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/agent/agentChargeListController.js']);
                                }]
                        }
                    })


                    //代理收支表
                    .state('app.agentBonusList', {
                        url: 'agent/agentBonusList',
                        params: {'agent': {}},
                        templateUrl: 'tpl/agent/agentBonusList.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/agent/agentBonusListController.js']);
                                }]
                        }
                    })

                    //代理佣金统计表
                    .state('app.agentBonusInListDaily', {
                        url: 'agent/agentBonusInListDaily',
                        templateUrl: 'tpl/agent/agentBonusInListDaily.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/agent/agentBonusInListDailyController.js']);
                                }]
                        }
                    })

                    //代理提现统计表
                    .state('app.agentBonusOutListDaily', {
                        url: 'agent/agentBonusOutListDaily',
                        templateUrl: 'tpl/agent/agentBonusOutListDaily.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/agent/agentBonusOutListDailyController.js']);
                                }]
                        }
                    })


// 游戏相关设置---------------------------------------------------------------------------------------------------------

                    // //解散房间
                    // .state('app.releaseRoom', {
                    //     url: 'game/releaseRoom',
                    //     templateUrl: 'tpl/game/releaseRoom.html',
                    //     resolve: {
                    //         deps: ['uiLoad',
                    //             function (uiLoad) {
                    //                 return uiLoad.load(['js/controllers/game/releaseRoomController.js']);
                    //             }]
                    //     }
                    // })


// 比赛场相关设置--------------------------------------------------------------------------------------------------------

                    //解散比赛场
                    .state('app.releaseArena', {
                        url: 'arena/releaseArena',
                        templateUrl: 'tpl/arena/releaseArena.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/arena/releaseArenaController.js']);
                                }]
                        }
                    })

// 设置-----------------------------------------------------------------------------------------------------------------
                    //代理公告设置
                    .state('app.agentNotice', {
                        url: 'setting/agentNotice',
                        templateUrl: 'tpl/setting/agentNotice.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/setting/agentNoticeController.js']);
                                }]
                        }
                    })

                    //跑马灯设置
                    .state('app.gameNotice', {
                        url: 'setting/gameNotice',
                        templateUrl: 'tpl/setting/gameNotice.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/setting/gameNoticeController.js']);
                                }]
                        }
                    })

                    //游戏紧急公告
                    .state('app.gameUrgentNotice', {
                        url: 'setting/gameUrgentNotice',
                        templateUrl: 'tpl/setting/gameUrgentNotice.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/setting/gameUrgentNoticeController.js']);
                                }]
                        }
                    })

                    //游戏信息设置
                    .state('app.gameInformation', {
                        url: 'setting/gameInformation',
                        templateUrl: 'tpl/setting/gameInformation.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/setting/gameInformationController.js']);
                                }]
                        }
                    })

                    //修改密码
                    .state('app.changePassword', {
                        url: '/setting/changePassword',
                        templateUrl: 'tpl/setting/changePassword.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/setting/changePasswordController.js']);
                                }]
                        }
                    })

                    //查看代理密码
                    .state('app.viewAgentPassword', {
                        url: '/setting/viewAgentPassword',
                        templateUrl: 'tpl/setting/viewAgentPassword.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/setting/viewAgentPasswordController.js']);
                                }]
                        }
                    })

                    //修改邀请码
                    .state('app.changeCode', {
                        url: '/setting/changeCode',
                        templateUrl: 'tpl/setting/changeCode.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/setting/changeCodeController.js']);
                                }]
                        }
                    })

                    //钻石价格设置
                    .state('app.changeDiamondPrice', {
                        url: '/setting/changeDiamondPrice',
                        templateUrl: 'tpl/setting/changeDiamondPrice.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/setting/changeDiamondPriceController.js']);
                                }]
                        }
                    })

                    //联运分成比例设置
                    .state('app.changeSharing', {
                        url: '/setting/changeSharing',
                        templateUrl: 'tpl/setting/changeSharing.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/setting/changeSharingController.js']);
                                }]
                        }
                    })

                    //代理佣金比例设置设置
                    .state('app.setBonus', {
                        url: '/setting/setBonus',
                        templateUrl: 'tpl/setting/setBonus.html',
                        resolve: {
                            deps: ['uiLoad',
                                function (uiLoad) {
                                    return uiLoad.load(['js/controllers/setting/setBonusController.js']);
                                }]
                        }
                    })

                    .state('access', {
                        url: '/access',
                        template: '<div ui-view class="fade-in-right-big smooth"></div>'
                    })

                    .state('access.404', {
                        url: '/404',
                        templateUrl: 'tpl/page_404.html'
                    })

            }
        ]
    );