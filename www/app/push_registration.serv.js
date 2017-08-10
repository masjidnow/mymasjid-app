angular.module('mymasjid.services')
.factory("PushRegistration", function(
  Restangular,
  $ionicPlatform,
  $cordovaPushV5,
  appConfig,
  $q
  ) {

  function initialize() {
    if(window.PushNotification == null){
      console.error("Couldn't find PushNotification, only available on device.");
      return;
    }
    $cordovaPushV5.initialize({
      android: {
        // senderID: "TESTID"
        senderID: appConfig.gcmSenderId
      },
      ios: {
        alert: "true",
        badge: "true",
        sound: "true"
      }
    });
  }

  function register(masjidId){
    if(window.PushNotification == null){
      console.error("Couldn't find PushNotification, only available on device.");
      return $q.defer().promise;
    }
    return $cordovaPushV5.register().then(function(token){
      console.log("Successfully registered with device. Token: ", token);
      var platform = ionic.Platform.isIOS() ? "mymasjid-ios" : "mymasjid-android";
      return Restangular.all("push_notifications").one("register").customPOST({
        src: (ionic.Platform.isIOS() ? "ios" : "android"),
        masjid_device: {
          platform: platform,
          token: token,
          masjid_id: masjidId
        }
      });
    }, function(error){
      console.log("cordovaPushV5 register failed. Error: ", error);
      throw error;
    });
  }

  function isPushEnabled(){
    var deferred = $q.defer();
    if(window.PushNotification == null){
      console.error("Couldn't find PushNotification, only available on device.");
      return $q.defer().promise;
    }
    $ionicPlatform.ready().then(function() {
      return PushNotification.hasPermission(function hasPermissionResult(result){
        deferred.resolve(result.isEnabled);
      });
    });
    return deferred.promise;
  }

  return {
    initialize: initialize,
    register: register,
    isPushEnabled: isPushEnabled
  };
});
