angular.module('mymasjid.controllers')
.controller('BaseCtrl', function(
   $scope,
   $ionicModal,
   $state,
   $ionicSideMenuDelegate,
   $ionicPlatform,
   $cordovaPushV5,
   $q,
   appConfig,
   Restangular,
   PushRegistration,
   SavedMasjid,
   $ionicPopup
 ) {

  var ctrl = this;
  $scope.global = {};

  ctrl.pushesAreEnabled = true;

  function init(){
    getStoredMasjids().then(
      registerForPush);
    clearPushBadges();
  }

  function getStoredMasjids(){
    return SavedMasjid.getMasjids().then(function(storedMasjids){
      $scope.otherMasjids = storedMasjids.slice(1);
      if(storedMasjids.length == 0)
        return null;
      else
        return storedMasjids[0];
    }).then(function(storedMasjid){
      $scope.global.selectedMasjid = storedMasjid;
      return storedMasjid;
    })
    .then(refreshMasjid)
    .then(setMenuStyle)
  };

  function refreshMasjid(){
    var masjid = $scope.global.selectedMasjid;
    return Restangular.all("masjids").get(masjid.id).then(function(response){
      var masjid = response.masjid;
      console.log("Got refreshed masjid", masjid);
      return SavedMasjid.setSelected(masjid);
    });
  }

  function setMenuStyle(masjid){
    // set style for menu item
    var style = {};
    if(masjid.cover_photo_url != null){
      style["background-image"] = "linear-gradient(to bottom, rgba(0,0,0,.1), black), url('" + masjid.cover_photo_url + "'), linear-gradient(to top, black, black)";
      style["background-size"] = "contain, contain";
      style["background-repeat"] = "no-repeat, no-repeat";
    }
    ctrl.selectedMasjidStyle = style;
    return masjid;
  }

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
    return SavedMasjid.setSelected(masjid).then(function(selectedMasjid){
      $scope.global.selectedMasjid = masjid;
      $scope.$broadcast("mymasjid.selectedMasjidChanged");
      return masjid;
    })
    .then(setMenuStyle)
    .then(getStoredMasjids)
    .then(registerForPush)
    .then(refreshMasjid);
  }

  ctrl.removeMasjid = function(masjid){
    var confirmPopup = $ionicPopup.confirm({
       title: 'Remove Masjid?',
       template: 'Are you sure you want to remove this masjid?'
     });

    confirmPopup.then(function(confirmed) {
     if(!confirmed)
       return;
     SavedMasjid.removeStoredMasjid(masjid).then(function(storedMasjid){
       console.log("Removed masjid", storedMasjid);
     }).then(getStoredMasjids);
    });
  }

  function registerForPush(){
    return $ionicPlatform.ready(function() {
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

  function clearPushBadges(){
    $ionicPlatform.ready(function(){
      $cordovaPushV5.setBadgeNumber(0);
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
