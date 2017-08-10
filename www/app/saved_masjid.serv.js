angular.module('mymasjid.services')
.factory("SavedMasjid", function(
  $cordovaNativeStorage,
  $localForage,
  $ionicPlatform
  ){

  function getMasjids(){
    return $ionicPlatform.ready().then(function(){
      return getItem('storedMasjids');
    }).then(function(storedMasjids){
      return storedMasjids || [];
    });
  }

  function setSelected(masjid){
    return $ionicPlatform.ready().then(function(){
      return getItem("storedMasjids");
    })
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
      return setItem("storedMasjids", storedMasjids);
    })
    .then(function(storedMasjids){
      return storedMasjids[0];
    });
  }

  function removeStoredMasjid(masjid){
    console.error("removeStoredMasjid not implemented");
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
    getMasjids: getMasjids,
    setSelected: setSelected,
    removeStoredMasjid: removeStoredMasjid
  };
});
