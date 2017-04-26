angular.module('mymasjid.controllers')
.controller('BaseCtrl', function(
   $scope,
   $ionicModal,
   $state,
   $ionicSideMenuDelegate,
   $localForage,
   $ionicPlatform,
   $cordovaPushV5,
   appConfig
 ) {

  var ctrl = this;
  $scope.global = {};

  ctrl.pushesAreEnabled = true;

  function init(){
    getStoredMasjids();
    try{
      registerForPush();
    } catch(e){
      console.error("registerForPush failed", e);
    }
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
      .then(getStoredMasjids);
  }


  function registerForPush(){
    $ionicPlatform.ready(function() {
      $cordovaPushV5.initialize({
        android: {
          senderID: "TESTID"
          // senderID: appConfig.gcmSenderId
        },
        ios: {
          alert: "true",
          badge: "true",
          sound: "true"
        }
      });

      checkIfPushesEnabled();

      $cordovaPushV5.register().then(function(token){
        console.log("Successfully registered with device. Token: ", token);
        console.log("Attempting to register for each known masjid...");
        var preferences = null;
        return $localForage.getItem(["userPreferences", "storedMasjids"]).then(function(preferences, storedMasjids){
          preferences = preferences || {};
          storedMasjids = storedMasjids || [];
          serverRegistrationPromises = _.map(storedMasjids, function(masjid){
            return Restangular.all("push_notifications").post("register", {
              masjid_device: {
                src: ionic.Platform.isIOS() ? "ios" : "android",
                platform: ionic.Platform.isIOS() ? "ios" : "android",
                token: token,
                masjid_id: masjid.id
              }
            });
          });
          return $q.all(serverRegistrationPromises);
        });
      }, function(error){
        console.log("register() failed");
        console.error(error);
        checkIfPushesEnabled();
      }).then(function(responses){
        console.log("Successfully registered with server for all masjids.");
        console.log(responses);
      }).finally(function(response){
        console.error("Error when trying to register for pushes..");
        console.log(response);
        checkIfPushesEnabled();
      });
    });
  }

  function checkIfPushesEnabled(){
    PushNotification.hasPermission(function hasPermissionResult(result){
      ctrl.pushesAreEnabled = result.isEnabled;
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
