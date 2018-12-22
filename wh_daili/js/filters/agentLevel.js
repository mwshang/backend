'use strict';

/* Filters */
angular.module('app')
  .filter('agentLevelFormat', function() {
    return function(level) {
      switch (level) {
        case 1:
          return '金钻代理';
        case 2:
          return '银钻代理';
        case 3:
          return '蓝钻代理';
      }
      return '';
    }
  });/**
 * Created by fyw2515 on 2017/9/10.
 */
