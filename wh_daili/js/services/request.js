'use strict';

var app = angular.module('app')
    .service('request', ['$http', '$q', '$state', 'dialog', function ($http, $q, $state, dialog) {

        //十三水
        // var baseUrl = 'http://www.yiqigame.me:30006';
        // 启东  新 30001 旧 30010 测试 30061
        var baseUrl = 'http://www.luminositygame.com:30160';
        // var baseUrl = 'http://www.yiqigame.me:30010';
        // var baseUrl = 'http://www.yiqigame.me:30061';
        // var baseUrl = 'http://localhost:3001';

        return {
            a: function () {
                console.log('a');
            },
            objKeySort: function (obj) {
                var newKeys = Object.keys(obj).sort();
                var newObj = {};
                for (var i = 0; i < newKeys.length; i++) {
                    newObj[newKeys[i]] = obj[newKeys[i]];
                }
                return newObj;
            },
            calcSign: function (params, key) {
                var _params = this.objKeySort(params);
                var mac = '';
                var keys = Object.keys(_params);
                for (var i in keys) {
                    if (typeof(_params[keys[i]]) === 'object') {
                        _params[keys[i]] = JSON.stringify(_params[keys[i]]);
                    }
                    if (keys[i] !== 'sign') {
                        mac += _params[keys[i]];
                    }
                }
                console.log(mac+key);
                return $.md5(mac+key);
            },
            request: function (url, data, hasPage) {
                data['session'] = app['session'];
                data['sign'] = this.calcSign(data , '6412f6a71ebc3747e2097352fb3bb635');
                // dialog.showLoading('正在请求,请稍等...');

                var deferred = $q.defer();
                $http.post(baseUrl + url, data).success(function (data) {
                    if (data.code !== 200) {
                        if (data.code === 500) {
                            dialog.showError('', data.msg);
                        }
                        else if (data.code === 501) {
                             dialog.showError('', '数据库异常');
                        }
                        // 会话过期 重新登录
                        else if (data.code === 502) {
                            dialog.showError('', data.msg);
                            $state.go('access.signin');
                        }
                        else if (data.code === 503) {
                            dialog.showError('', '游戏服异常 ');
                        }
                        else if (data.code === 503) {
                            dialog.showError('', '安全验证失败 ');
                        }
                        else if (data.code === 1000) {
                            dialog.showError('', '24小时内只能提现一次 ');
                        }
                        else {
                            dialog.showError('', '暂无数据');
                        }
                        deferred.resolve(null);
                    } else {
                        if (data.session != undefined && data.session != null)
                            app['session'] = data.session;
                        if (hasPage != undefined && hasPage)
                            deferred.resolve({data: data.data, page: data.page});
                        else
                            deferred.resolve(data.data);
                    }
                }).error(function (error) {
                    console.log(error);
                    var msg = '您的网络开小差啦!';
                    deferred.reject(msg);
                    dialog.showError('', msg);
                });

                return deferred.promise;
            }
        };
    }]);