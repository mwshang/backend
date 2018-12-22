'use strict';

/**
 * Config for the router
 */
angular.module('app')
  .run(
    [          '$rootScope', '$state', '$stateParams',
      function ($rootScope,   $state,   $stateParams) {
          $rootScope.$state = $state;
          $rootScope.$stateParams = $stateParams;        
      }
    ]
  )
  .config(
    [          '$stateProvider', '$urlRouterProvider',
      function ($stateProvider,   $urlRouterProvider) {
          var version = 1.0;
          $urlRouterProvider
              .otherwise('/access/signin');
          $stateProvider
              .state('app', {
                  abstract: true,
                  url: '/app',
                  templateUrl: 'tpl/app.html'+'?version='+ version
              })

              //首页
              .state('app.dashboard', {
                  url: '/dashboard',
                  templateUrl: 'tpl/app_dashboard.html'+'?version='+ version,
                  resolve: {
                      deps: ['uiLoad',
                          function( uiLoad ){
                              return uiLoad.load( ['js/controllers/dashboard.js'+'?version='+ version] );
                          }]
                  }
              })
              //绑定玩家
              .state('app.players', {
                url: '/players',
                templateUrl: 'tpl/player_list.html'+'?version='+ version,
                resolve: {
                  deps: ['uiLoad',
                    function( uiLoad ){
                      return uiLoad.load( ['js/controllers/playerList.js'+'?version='+ version] );
                    }]
                }
              })

              //下级代理
              .state('app.agents', {
                url: '/agents',
                templateUrl: 'tpl/agent_list.html'+'?version='+ version,
                params: {'pid': 0},
                resolve: {
                  deps: ['uiLoad',
                    function( uiLoad ){
                      return uiLoad.load( ['js/controllers/agentList.js'+'?version='+ version] );
                    }]
                }
              })
              //显示个人信息
              .state('app.agentInformation', {
                  url: '/agentInformation',
                  templateUrl: 'tpl/agent_information.html'+'?version='+ version,
                  resolve: {
                      deps: ['uiLoad',
                          function( uiLoad ){
                              return uiLoad.load( ['js/controllers/agentInformationController.js'+'?version='+ version] );
                          }]
                  }
              })
              .state('app.bonus', {
                url: '/bonus',
                templateUrl: 'tpl/bonus_list.html'+'?version='+ version,
                resolve: {
                  deps: ['uiLoad',
                    function( uiLoad ){
                      return uiLoad.load( ['js/controllers/bonusList.js'+'?version='+ version] );
                    }]
                }
              })
              .state('app.charges', {
                url: '/charges',
                templateUrl: 'tpl/charge_list.html'+'?version='+ version,
                  resolve: {
                      deps: ['uiLoad',
                          function( uiLoad ){
                              return uiLoad.load( ['js/controllers/chargeList.js'+'?version='+ version] );
                          }]
                  }
              })
              .state('app.qrcode', {
                url: '/qrcode',
                templateUrl: 'tpl/qrcode.html'+'?version='+ version,
                resolve: {
                  deps: ['uiLoad',
                    function( uiLoad ){
                      return uiLoad.load( ['js/controllers/qrcode.js'+'?version='+ version] );
                    }]
                }
              })
              .state('access', {
                  url: '/access',
                  template: '<div ui-view class="fade-in-right-big smooth"></div>'
              })
              .state('access.signin', {
                  url: '/signin',
                  templateUrl: 'tpl/page_signin.html'+'?version='+ version,
                  resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( ['js/controllers/signin.js'+'?version='+ version] );
                      }]
                  }
              })
              .state('access.changepwd', {
                url: '/changepwd',
                templateUrl: 'tpl/page_changepwd.html'+'?version='+ version,
                resolve: {
                  deps: ['uiLoad',
                    function( uiLoad ){
                      return uiLoad.load( ['js/controllers/changepwd.js'+'?version='+ version] );
                    }]
                }
              })
              .state('access.404', {
                  url: '/404',
                  templateUrl: 'tpl/page_404.html'
              })


      }
    ]
  );