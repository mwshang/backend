'use strict';

angular.module('app')
  .service('dialog', ['toaster', function(toaster) {
    this.showLoading = function(text){
      toaster.clear();
      toaster.pop('wait', '', text, 2000);
    };

    this.showWarning = function(title, text){
      toaster.clear();
      toaster.pop('warning', title, text, 2000);
    };

    this.showSuccess = function(title, text){

      toaster.clear();
      toaster.pop('success', title, text, 2000);
    };

    this.showInfo = function(title, text){

      toaster.clear();
      toaster.pop('info', title, text, 2000);
    };

    this.showError = function(title, text){

      toaster.clear();
      toaster.pop('error', title, text, 2000);
    };
  }]);