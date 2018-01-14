angular.module('mymasjid.services')
.factory("NotificationPreferences", function(
  $cordovaNativeStorage,
  $localForage,
  $ionicPlatform
  ){

  var IQAMAH_PREFERENCES_KEY = 'notificationIqamahPreferences';

  function getIqamahPreferences(){
    return $ionicPlatform.ready().then(function(){
      return getItem(IQAMAH_PREFERENCES_KEY);
    }).then(function(prefs){
      return prefs || {};
    });
  }

  function setIqamahPreference(salah, minutes){
    return $ionicPlatform.ready().then(function(){
      return getItem(IQAMAH_PREFERENCES_KEY);
    }).then(function(prefs){
      prefs = prefs || {};
      prefs[salah] = minutes;
      return setItem(IQAMAH_PREFERENCES_KEY, prefs);
    })
    .then(function(prefs){
      return prefs;
    });
  }

  function setItem(key, val){
    return $localForage.setItem(key, val)
    .then(function(){
      return $cordovaNativeStorage.setItem(key, val);
    });
  }

  function getItem(key){
    return $cordovaNativeStorage.getItem(key).then(function(val){
      if(val != null){
        return val;
      }
      return $localForage.getItem(key);
    }, function(){
      console.log("Falling back to localForage")
      return $localForage.getItem(key);
    });
  }

  return {
    getIqamahPreferences: getIqamahPreferences,
    setIqamahPreference: setIqamahPreference,
  };
});
