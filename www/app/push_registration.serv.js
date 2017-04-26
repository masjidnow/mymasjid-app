angular.module('mymasjid.services')
.factory("PushRegistration", function(
  Restangular,
  $ionicPlatform,
  $cordovaPushV5,
  appConfig,
  $localForage,
  $q
  ) {

  function initialize() {
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
    return $ionicPlatform.ready().then(function() {
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
