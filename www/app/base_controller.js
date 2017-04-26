angular.module('mymasjid.controllers')
.controller('BaseCtrl', function(
   $scope,
   $ionicModal,
   $state,
   $ionicSideMenuDelegate,
   $localForage,
   $ionicPlatform,
   $cordovaPushV5,
   $q,
   appConfig,
   Restangular,
   PushRegistration
 ) {

  var ctrl = this;
  $scope.global = {};

  ctrl.pushesAreEnabled = true;

  function init(){
    getStoredMasjids().then(
      registerForPush);
  }

  function getStoredMasjids(){
    return $localForage.getItem('storedMasjids').then(function(storedMasjids){
      storedMasjids = storedMasjids || [];
      $scope.otherMasjids = storedMasjids.slice(1);
      if(storedMasjids.length == 0)
        return null;
      else
        return storedMasjids[0];
    }).then(function(storedMasjid){
      $scope.global.selectedMasjid = storedMasjid;
    });
  };

  ctrl.hideSideMenu = function(){
    $ionicSideMenuDelegate.toggleLeft(false);
    return true;
  }

  ctrl.openChild = function(stateName){
    $state.go(stateName);
    $ionicSideMenuDelegate.toggleLeft(false);
  };

  ctrl.toggleShowingOtherMasjids = function(){
    ctrl.showingOtherMasjids = !ctrl.showingOtherMasjids;
    return true;
  }

  ctrl.setSelectedMasjid = function(masjid){
    return $localForage.getItem("storedMasjids")
      .then(function(storedMasjids){
        storedMasjids = storedMasjids || [];
        var storedIndex = _.findIndex(storedMasjids, function(storedMasjid){
          if(storedMasjid.id == masjid.id){
            return masjid;
          }
        });
        if(storedIndex != -1){
          storedMasjids.splice(storedIndex, 1);
        }
        storedMasjids.unshift(masjid);
        $scope.global.selectedMasjid = masjid;
        return $localForage.setItem("storedMasjids", storedMasjids);
      }).then(function(){
        $scope.$broadcast("mymasjid.selectedMasjidChanged");
      })
      .then(getStoredMasjids)
      .then(registerForPush);
  }


  function registerForPush(){
    $ionicPlatform.ready(function() {
      checkIfPushesEnabled();
      var masjid = $scope.global.selectedMasjid;
      if(masjid == null)
        return;
      PushRegistration.initialize();
      PushRegistration.register(masjid.id).then(function(response){
        console.log("PushRegistration success response", response);
      }, function(errors) {
        console.log("Got errors", errors);
      }).finally(function() {
        checkIfPushesEnabled();
      });
    });
  }

  function checkIfPushesEnabled(){
    PushRegistration.isPushEnabled().then(function(isEnabled){
      ctrl.pushesAreEnabled = isEnabled;
    });
  }

  $ionicPlatform.on('resume', function(){
    console.log("Resuming application...");
    init();
  });

  $scope.$on("$ionicView.enter", function(){
    init();
  });
});
