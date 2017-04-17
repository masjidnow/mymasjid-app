angular.module('mymasjid')
.config(function($stateProvider, $urlRouterProvider){
  $stateProvider
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'app/menu.html',
    controller: 'BaseCtrl',
    controllerAs: 'ctrl'
  })
  .state('app.setup', {
    url: '/setup',
    views: {
      'menuContent': {
        templateUrl: 'app/setup/setup.html',
        controller: "SetupCtrl",
        controllerAs: "ctrl"
      }
    }
  })
  .state('app.dailyTimings', {
    url: '/daily_timings',
    views: {
      'menuContent': {
        templateUrl: 'app/daily_timings/daily_timings.html',
        controller: "DailyTimingsCtrl",
        controllerAs: "ctrl",
      }
    }
  })
  .state('app.monthlyTimings', {
    url: '/monthly_timings',
    views: {
      'menuContent': {
        templateUrl: 'app/monthly_timings/monthly_timings.html',
        controller: "MonthlyTimingsCtrl",
        controllerAs: "ctrl",
      }
    }
  })
  .state('app.pushMessages', {
    url: '/push_messages',
    views: {
      'menuContent': {
        templateUrl: 'app/push_messages/push_messages.html',
        controller: "PushMessagesCtrl",
        controllerAs: "ctrl",
      }
    }
  })
  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'app/search.html',
        controller: "SearchCtrl",
        controllerAs: "ctrl",
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/daily_timings');
})
.run(function($rootScope){
//  var $rootScope = angular.element(document.querySelectorAll("[ui-view]")[0]).injector().get('$rootScope');

  $rootScope.$on('$stateChangeStart',function(event, toState, toParams, fromState, fromParams){
    console.log('$stateChangeStart to '+toState.to+' - fired when the transition begins. toState,toParams : \n',toState, toParams);
  });

  $rootScope.$on('$stateChangeError',function(event, toState, toParams, fromState, fromParams){
    console.log('$stateChangeError - fired when an error occurs during transition.');
    console.log(arguments);
  });

  $rootScope.$on('$stateChangeSuccess',function(event, toState, toParams, fromState, fromParams){
    console.log('$stateChangeSuccess to '+toState.name+' - fired once the state transition is complete.');
  });

  $rootScope.$on('$viewContentLoaded',function(event){
    console.log('$viewContentLoaded - fired after dom rendered',event);
  });

  $rootScope.$on('$stateNotFound',function(event, unfoundState, fromState, fromParams){
    console.log('$stateNotFound '+unfoundState.to+'  - fired when a state cannot be found by its name.');
    console.log(unfoundState, fromState, fromParams);
  });
});
