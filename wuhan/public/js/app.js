
var myApp = angular.module('myApp', [
    'ngResource',
    'ngStorage',
    'ngSanitize'
]);

myApp.service('browser', ['$window', function($window) {
  var u = $window.navigator.userAgent;
  console.log(u);

  var ua = u.toLowerCase();
  var btypeInfo = (ua.match( /firefox|chrome|safari|opera/g ) || "other")[ 0 ];
  if( (ua.match( /msie|trident/g ) || [] )[ 0 ] )
  {
    btypeInfo = "msie";
  }
  var pc = "";
  var prefix = "";
  var plat = "";
  //如果没有触摸事件 判定为PC
  var isTocuh = ("ontouchstart" in $window) || (ua.indexOf( "touch" ) !== -1) || (ua.indexOf( "mobile" ) !== -1);
  if( isTocuh )
  {
    if( ua.indexOf( "ipad" ) !== -1 )
    {
      pc = "pad";
    } else if( ua.indexOf( "mobile" ) !== -1 )
    {
      pc = "mobile";
    } else if( ua.indexOf( "android" ) !== -1 )
    {
      pc = "androidPad";
    } else
    {
      pc = "pc";
    }
  } else
  {
    pc = "pc";
  }
  switch( btypeInfo )
  {
    case "chrome":
    case "safari":
    case "mobile":
      prefix = "webkit";
      break;
    case "msie":
      prefix = "ms";
      break;
    case "firefox":
      prefix = "Moz";
      break;
    case "opera":
      prefix = "O";
      break;
    default:
      prefix = "webkit";
      break
  }
  plat = (ua.indexOf( "android" ) > 0) ? "android" : $window.navigator.platform.toLowerCase();

  return {
    version: (ua.match( /[\s\S]+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[ 1 ],     //版本
    plat: plat,                   //系统
    type: btypeInfo,              //浏览器
    pc: pc,
    prefix: prefix,                //前缀
    mobile: (pc == "pc") ? false : true              //是否是移动端
  };
}]);

myApp.config(function($routeProvider, $httpProvider) {
  $routeProvider.
    when('/', {
      controller: 'indexController'
    }).
    when('/login', {
      controller: 'loginController',
      templateUrl: 'js/user/login.html'
    }).
    when('/register', {
      controller: 'registerController',
      templateUrl: 'js/user/register.html'
    }).
    when('/main', {
      controller: 'mainController',
      templateUrl: 'js/dashboard/dashboard.html'
    }).
    when('/profile', {
      controller: 'profileController',
      templateUrl: 'js/user/profile.html'
    }).
    when('/bind', {
      controller: 'bindController',
      templateUrl: 'js/user/bind.html'
    }).
    otherwise({redirectTo: '/'});
});

