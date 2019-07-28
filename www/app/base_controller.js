angular.module('mymasjid.controllers')
.controller('BaseCtrl', function(
   $scope,
   $rootScope,
   $ionicModal,
   $state,
   $ionicSideMenuDelegate,
   $ionicPlatform,
   $cordovaPushV5,
   $q,
   $window,
   appConfig,
   alarmService,
   Restangular,
   PushRegistration,
   SavedMasjid,
   $ionicPopup,
   $jukakuLaunchNavigator
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
    .then(setMenuStyle);
  }

  function refreshMasjid(){
    var masjid = $scope.global.selectedMasjid;
    if(masjid === null){
      return;
    }
    return Restangular.all("masjids").get(masjid.id).then(function(response){
      var masjid = response.masjid;
      console.log("Got refreshed masjid", masjid);
      alarmService.removeLastMonth();

      (async function(){
        // if(!await alarmService.isIqamahAvailable()){
        //   var date = new Date();
        //   console.log('fetching');
        //   await alarmService.fetchIqamah(date.getMonth() + 1, date.getFullYear(), masjid.id);
        //   await alarmService.fetchIqamah(date.getMonth() + 2, date.getFullYear(), masjid.id);
        // }


        try {
          var notifSetting = await alarmService.getNotificationSettings();
          var hasSetting = Object.values(notifSetting).filter(function(v){
            return v > 0;
          });
          if($window.cordova){
              await alarmService.cancelAllNotification();
          }
          if(hasSetting.length > 0){
            var cm, nm;
            var date = new Date();
            if(!await alarmService.isIqamahAvailable()){
              console.log('fetching');
              cm = await alarmService.fetchIqamah(date.getMonth() + 1, date.getFullYear(), masjid.id);
              nm = await alarmService.fetchIqamah(date.getMonth() + 2, date.getFullYear(), masjid.id);
            }else{
              cm = await alarmService.get((date.getMonth() + 1).toString() + date.getFullYear().toString());
              nm = await alarmService.get((date.getMonth() + 2).toString() + date.getFullYear().toString());
            }
            var cmSchedule = await alarmService.generateNotificationSchedule(cm, true);
            var nmSchedule = await alarmService.generateNotificationSchedule(nm, false);
            if(cmSchedule.length > 0){
              alarmService.setLocalNotification(cmSchedule);
            }
            if(nmSchedule.length > 0){
              alarmService.setLocalNotification(nmSchedule);
            }
          }
        } catch (error) {
          console.log(error);
        }
      })();
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
  };

  ctrl.openChild = function(stateName){
    $state.go(stateName);
    $ionicSideMenuDelegate.toggleLeft(false);
  };

  ctrl.toggleShowingOtherMasjids = function(){
    ctrl.showingOtherMasjids = !ctrl.showingOtherMasjids;
    return true;
  };

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
  };

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
  };

  ctrl.canNavigate = function(){
    if($scope.global.selectedMasjid == null){
      return false;
    }
    return true;
  };

  ctrl.navigateToMasjid = function(masjid){
    var destination = [masjid.latitude, masjid.longitude];
    var start = null;
    $jukakuLaunchNavigator.navigate(destination).then(function() {
      console.log("Navigator launched");
    }, function (err) {
      console.error(err);
    });
  };

  function registerForPush(){
    return $ionicPlatform.ready(function() {
      checkIfPushesEnabled();
      var masjid = $scope.global.selectedMasjid;
      if(masjid == null)
        return;
      PushRegistration.initialize();
      $cordovaPushV5.onNotification(); // start listening to events
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

  $rootScope.$on('$cordovaPushV5:notificationReceived', function(event, notification){
    console.log("Got push notification. Event: ", event, ". Notification", notification);
    $state.go("app.pushMessages");
    if(notification.additionalData.foreground){
      alert(notification.message);
    }
  });
});
