// Ionic mymasjid App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'mymasjid' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'mymasjid.controllers' is found in controllers.js
angular.module('mymasjid',
  [
    'ionic',
    'mymasjid.controllers',
    'restangular',
    'LocalForageModule',
  ]
)

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})
.config(function(RestangularProvider){
  RestangularProvider.setBaseUrl("https://www.masjidnow.com/api/v2");
});
