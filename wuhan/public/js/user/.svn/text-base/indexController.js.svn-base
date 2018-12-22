/**
 * Created by yangshaochuan on 17/1/7.
 */

myApp.controller('indexController', function indexController($rootScope, $scope, $sessionStorage, $location) {
  if ($location.path().indexOf('/bind') >= 0) {
    var params = $location.search();
    $location.url('/bind?token='+params.token+'&t='+params.t+'&i='+params.i+'&s='+params.s);
  } else if ($rootScope.user == undefined || $rootScope.user == null)
    $location.url('/login');
  else
    $location.url('/main');
});