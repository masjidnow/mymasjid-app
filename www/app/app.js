// Ionic mymasjid App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'mymasjid' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'mymasjid.controllers' is found in controllers.js
angular.module('mymasjid',
  [
    'ionic',
    'mymasjid.controllers',
    'mymasjid.services',
    'restangular',
    'LocalForageModule',
    'ngCordova',
    'ngCordova.plugins.nativeStorage',
  ]
)

.run(function($ionicPlatform, $rootScope, alarmService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.backgroundColorByHexString("#285B7B"); //Light
       // for some reason doing the overlaysWebView twice like this
       // is necessary (tested on iPhone8 Plus iOS 11.2 - SIMULATOR)
      StatusBar.overlaysWebView(false);
      StatusBar.overlaysWebView(true);
      StatusBar.styleLightContent();
    }
    // $rootScope.$on('$cordovaLocalNotification:trigger', function(event, notification, state) {
    //   console.log(event);
    //   console.log(notification);
    //   console.log(state);
    //   alarmService.setLocalNotification();
    // });
  });
})
.config(function(RestangularProvider){
  // RestangularProvider.setBaseUrl("http://localhost:3000/api/v2");
  RestangularProvider.setBaseUrl("https://www.masjidnow.com/api/v2");
  console.log("Using API at ", RestangularProvider.configuration.baseUrl);
})
.run(function($http, appConfig) {
  if(appConfig.apiAuthToken == null)
    throw new Error("apiAuthToken must be specified in the appConfig");
  $http.defaults.headers.common.Authorization = 'Token token='+appConfig.apiAuthToken;
});
