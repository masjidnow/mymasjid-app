angular.module('mymasjid')
.config(function($stateProvider, $urlRouterProvider){
  $stateProvider
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'BaseCtrl'
  })
  .state('app.timings', {
    url: '/timings',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlist.html'
      }
    }
  })
  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/timings');
});
