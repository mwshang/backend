'use strict';

/* Filters */
// need load the moment.js to use this filter. 
angular.module('app')
  .filter('fromNow', function() {
    return function(date) {
      return moment(date).fromNow();
    }
  });

angular.module('app')
  .filter('shortDateTime', function() {
    return function(date) {
      return moment(date).format("YYYY-MM-DD HH:mm");
    }
  });

